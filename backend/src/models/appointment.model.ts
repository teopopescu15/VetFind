import { pool } from '../config/database';

export interface Appointment {
  id?: number;
  company_id: number;
  user_id: number;
  service_id?: number;
  // Snapshot / aggregates stored at booking time
  total_price_min?: number | null;
  total_price_max?: number | null;
  total_duration_minutes?: number | null;
  appointment_date: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Factory function for appointment operations
export const createAppointmentModel = () => {
  return {
    // Normalize and validate status values to prevent Postgres enum cast errors.
    // (e.g. passing an unknown status in query params would otherwise crash with code 22P02)
    normalizeStatus(status?: string): Appointment['status'] | undefined {
      if (!status) return undefined;
      const s = String(status).trim().toLowerCase();
      const allowed: Array<Appointment['status']> = ['pending', 'confirmed', 'cancelled', 'completed'];
      return (allowed as string[]).includes(s) ? (s as Appointment['status']) : undefined;
    },

    /**
     * Set status to completed when current time is past (start + total service duration).
     * Duration: total_duration_minutes, else sum(appointment_services.duration_minutes), else 30 (matches frontend).
     */
    async autoCompletePastAppointments(now: Date = new Date()): Promise<number> {
      const result = await pool.query(
        `UPDATE appointments a
         SET status = 'completed', updated_at = NOW()
         WHERE a.status IN ('pending', 'confirmed')
           AND (a.deleted = FALSE OR a.deleted IS NULL)
           AND (
             a.appointment_date + (
               COALESCE(
                 NULLIF(a.total_duration_minutes, 0),
                 NULLIF((SELECT SUM(s.duration_minutes)::int FROM appointment_services s WHERE s.appointment_id = a.id), 0),
                 30
               ) * INTERVAL '1 minute'
             )
           ) <= $1`,
        [now]
      );

      return Number(result.rowCount || 0);
    },

    /** Same completion rule as autoCompletePastAppointments, scoped to one row (for findById / reviews). */
    async autoCompleteAppointmentByIdIfPast(id: number, now: Date = new Date()): Promise<void> {
      await pool.query(
        `UPDATE appointments a
         SET status = 'completed', updated_at = NOW()
         WHERE a.id = $1
           AND a.status IN ('pending', 'confirmed')
           AND (a.deleted = FALSE OR a.deleted IS NULL)
           AND (
             a.appointment_date + (
               COALESCE(
                 NULLIF(a.total_duration_minutes, 0),
                 NULLIF((SELECT SUM(s.duration_minutes)::int FROM appointment_services s WHERE s.appointment_id = a.id), 0),
                 30
               ) * INTERVAL '1 minute'
             )
           ) <= $2`,
        [id, now]
      );
    },

    // Create a new appointment. Supports an optional `services` array to snapshot per-service data.
    async create(appointment: any): Promise<number> {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert base appointment row. Keep service_id as first selected service (if provided) for backward compatibility.
        // IMPORTANT: preserve explicit null (manual blocks) - don't treat it as falsy and fall back.
        const primaryServiceId =
          Array.isArray(appointment.services) && appointment.services.length > 0
            ? appointment.services[0].id || appointment.services[0]
            : appointment.service_id ?? null;

        let clientPhone: string | null = null;
        const uid = Number(appointment.user_id);
        if (Number.isFinite(uid) && uid > 0) {
          const pr = await client.query(
            `SELECT NULLIF(TRIM(phone), '') AS p FROM users WHERE id = $1`,
            [uid]
          );
          const p = pr.rows[0]?.p;
          clientPhone = p != null && String(p).trim() !== '' ? String(p).trim() : null;
        }

        const insertQuery = `
          INSERT INTO appointments (company_id, user_id, service_id, appointment_date, status, notes, total_duration_minutes, client_phone)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `;
        const insertValues = [
          appointment.company_id,
          appointment.user_id,
          primaryServiceId,
          appointment.appointment_date,
          appointment.status || 'pending',
          appointment.notes || null,
          appointment.total_duration_minutes ?? null,
          clientPhone,
        ];

        const insertResult = await client.query(insertQuery, insertValues);
        const appointmentId = insertResult.rows[0].id;

  // If services were provided, snapshot them into appointment_services
        let totalPriceMin = 0;
        let totalPriceMax = 0;
        let totalDuration = 0;

        if (Array.isArray(appointment.services) && appointment.services.length > 0) {
          for (const svc of appointment.services) {
            // svc can be either an id (number) or an object { id }
            const serviceId = typeof svc === 'number' ? svc : svc.id;

            if (!serviceId) continue;

            // Read current service snapshot from company_services
            const svcRes = await client.query(`SELECT id, service_name, price_min, price_max, duration_minutes FROM company_services WHERE id = $1`, [serviceId]);
            const svcRow = svcRes.rows[0];

            const serviceName = svcRow ? svcRow.service_name : (svc.service_name || null);
            const priceMin = svcRow ? svcRow.price_min : (svc.price_min || null);
            const priceMax = svcRow ? svcRow.price_max : (svc.price_max || null);
            const duration = svcRow ? svcRow.duration_minutes : (svc.duration_minutes || 30);

            // Insert snapshot row
            await client.query(`
              INSERT INTO appointment_services (appointment_id, service_id, service_name, price_min, price_max, duration_minutes, price_at_booking)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [appointmentId, serviceId, serviceName, priceMin, priceMax, duration, priceMin]);

            totalPriceMin += Number(priceMin || 0);
            totalPriceMax += Number(priceMax || 0);
            totalDuration += Number(duration || 0);
          }

          // Update appointment totals
          await client.query(`
            UPDATE appointments
            SET total_price_min = $1, total_price_max = $2, total_duration_minutes = $3, updated_at = NOW()
            WHERE id = $4
          `, [totalPriceMin, totalPriceMax, totalDuration, appointmentId]);
        }

        await client.query('COMMIT');
        return appointmentId;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },

    // Get appointment by ID
    async findById(id: number): Promise<any | null> {
      const query = `
        SELECT a.*,
               c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone,
               u.name as user_name, u.email as user_email,
               COALESCE(NULLIF(TRIM(u.phone), ''), NULLIF(TRIM(a.client_phone), '')) as user_phone
        FROM appointments a
        JOIN companies c ON a.company_id = c.id
        JOIN users u ON a.user_id = u.id
        WHERE a.id = $1 AND (a.deleted = FALSE OR a.deleted IS NULL)
      `;

      await this.autoCompleteAppointmentByIdIfPast(id);

      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;

      const apt = result.rows[0];

      // Fetch snapshot services if any
      const servicesRes = await pool.query(`SELECT id, service_id, service_name, price_min, price_max, duration_minutes, price_at_booking FROM appointment_services WHERE appointment_id = $1 ORDER BY id`, [id]);
      apt.services = servicesRes.rows || [];

      // Backwards compatibility: expose single service_name/price_min/price_max if only one service
      if ((!apt.service_name || !apt.service_price_min) && apt.services.length > 0) {
        const first = apt.services[0];
        apt.service_name = first.service_name;
        apt.service_price_min = first.price_min;
        apt.service_price_max = first.price_max;
      }

      return apt;
    },

    // Get appointments by user
    async findByUser(userId: number, status?: string): Promise<any[]> {
      await this.autoCompletePastAppointments();

      let query = `
        SELECT a.*,
               c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone
        FROM appointments a
        JOIN companies c ON a.company_id = c.id
        WHERE a.user_id = $1 AND (a.deleted = FALSE OR a.deleted IS NULL)
      `;
      const params: any[] = [userId];

      const safeStatus = this.normalizeStatus(status);
      if (safeStatus) {
        query += ' AND a.status = $2';
        params.push(safeStatus);
      }

      query += ' ORDER BY a.appointment_date DESC';

      const result = await pool.query(query, params);
      const rows = result.rows;

      // Attach services for each appointment
      for (const r of rows) {
        const servicesRes = await pool.query(`SELECT id, service_id, service_name, price_min, price_max, duration_minutes, price_at_booking FROM appointment_services WHERE appointment_id = $1 ORDER BY id`, [r.id]);
        r.services = servicesRes.rows || [];
      }

      return rows;
    },

    // Get appointments by clinic
    async findByClinic(clinicId: number, status?: string): Promise<any[]> {
      await this.autoCompletePastAppointments();

      let query = `
        SELECT a.*,
               u.name as user_name, u.email as user_email,
               COALESCE(NULLIF(TRIM(u.phone), ''), NULLIF(TRIM(a.client_phone), '')) as user_phone
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.company_id = $1 AND (a.deleted = FALSE OR a.deleted IS NULL)
      `;
      const params: any[] = [clinicId];

      const safeStatus = this.normalizeStatus(status);
      if (safeStatus) {
        query += ' AND a.status = $2';
        params.push(safeStatus);
      }

      query += ' ORDER BY a.appointment_date DESC';

      const result = await pool.query(query, params);
      const rows = result.rows;

      for (const r of rows) {
        const servicesRes = await pool.query(`SELECT id, service_id, service_name, price_min, price_max, duration_minutes, price_at_booking FROM appointment_services WHERE appointment_id = $1 ORDER BY id`, [r.id]);
        r.services = servicesRes.rows || [];
      }

      return rows;
    },

    // Count appointments for a clinic in the last N days
    async countRecentByClinic(clinicId: number, days: number = 7): Promise<number> {
      // Use appointment_date window; exclude cancelled and soft-deleted rows
      const result = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM appointments
         WHERE company_id = $1
           AND appointment_date >= NOW() - ($2::text || ' days')::interval
           AND status != 'cancelled'
           AND (deleted = FALSE OR deleted IS NULL)`,
        [clinicId, days]
      );

      return Number(result.rows[0]?.count) || 0;
    },

    // Get upcoming appointments for a user
    async findUpcoming(userId: number): Promise<any[]> {
      await this.autoCompletePastAppointments();
      const query = `
        SELECT a.*,
               c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone,
               s.service_name as service_name, s.price_min as service_price_min, s.price_max as service_price_max
        FROM appointments a
        JOIN companies c ON a.company_id = c.id
        LEFT JOIN company_services s ON a.service_id = s.id
        WHERE a.user_id = $1 AND a.appointment_date >= NOW() AND a.status IN ('pending', 'confirmed') AND (a.deleted = FALSE OR a.deleted IS NULL)
        ORDER BY a.appointment_date ASC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;
    },

    // Get past appointments for a user
    async findPast(userId: number): Promise<any[]> {
      await this.autoCompletePastAppointments();
      const query = `
        SELECT a.*,
               c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone,
               s.service_name as service_name, s.price_min as service_price_min, s.price_max as service_price_max
        FROM appointments a
        JOIN companies c ON a.company_id = c.id
        LEFT JOIN company_services s ON a.service_id = s.id
        WHERE a.user_id = $1 AND a.appointment_date < NOW() AND (a.deleted = FALSE OR a.deleted IS NULL)
        ORDER BY a.appointment_date DESC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;
    },

    // Update appointment
    async update(id: number, appointment: Partial<Appointment>): Promise<boolean> {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(appointment).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (fields.length === 0) return false;

      values.push(id);
      const query = `
        UPDATE appointments
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
      `;

      const result = await pool.query(query, values);
      return (result.rowCount || 0) > 0;
    },

    // Cancel appointment
    async cancel(id: number): Promise<boolean> {
      const query = `
        UPDATE appointments
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = $1
      `;

      const result = await pool.query(query, [id]);
      return (result.rowCount || 0) > 0;
    },

    // Delete appointment
    // Soft-delete appointment (mark as deleted)
    async delete(id: number): Promise<boolean> {
      const query = `
        UPDATE appointments
        SET deleted = TRUE, updated_at = NOW()
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return (result.rowCount || 0) > 0;
    },

    // Find appointments by company and date range (for slot availability)
    async findByCompanyAndDateRange(
      companyId: number,
      startDate: Date,
      endDate: Date
    ): Promise<any[]> {
      await this.autoCompletePastAppointments();
      // Prefer stored total_duration_minutes when available, otherwise fall back to service duration
      const query = `
        SELECT a.*, COALESCE(a.total_duration_minutes, cs.duration_minutes) AS duration_minutes
        FROM appointments a
        LEFT JOIN company_services cs ON a.service_id = cs.id
        WHERE a.company_id = $1
          AND a.appointment_date >= $2
          AND a.appointment_date < $3
          AND a.status IN ('confirmed', 'pending')
          AND (a.deleted = FALSE OR a.deleted IS NULL)
        ORDER BY a.appointment_date ASC
      `;

      const result = await pool.query(query, [companyId, startDate, endDate]);
      return result.rows;
    },

    // Get occupied time slots for a specific date
    async getOccupiedSlots(companyId: number, date: Date): Promise<Array<{ start: Date; end: Date }>> {
      // Get all appointments for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await this.findByCompanyAndDateRange(companyId, startOfDay, endOfDay);

      // Calculate occupied time ranges based on appointment time + service duration
      return appointments.map(apt => {
        const start = new Date(apt.appointment_date);
        const durationMinutes = apt.duration_minutes || 30; // Default 30 minutes if not specified
        const end = new Date(start.getTime() + durationMinutes * 60000);

        return { start, end };
      });
    },

    // Check if a time slot is available
    async isSlotAvailable(
      companyId: number,
      appointmentDate: Date,
      durationMinutes: number
    ): Promise<boolean> {
      const slotStart = appointmentDate;
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

      const occupiedSlots = await this.getOccupiedSlots(companyId, appointmentDate);

      // Check if the requested slot overlaps with any occupied slot
      for (const occupied of occupiedSlots) {
        // Check for overlap: slot starts before occupied ends AND slot ends after occupied starts
        if (slotStart < occupied.end && slotEnd > occupied.start) {
          return false; // Slot overlaps with an existing appointment
        }
      }

      return true; // Slot is available
    }
  };
};
