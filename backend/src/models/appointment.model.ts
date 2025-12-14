import { pool } from '../config/database';

export interface Appointment {
  id?: number;
  clinic_id: number;
  user_id: number;
  service_id?: number;
  appointment_date: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Factory function for appointment operations
export const createAppointmentModel = () => {
  return {
    // Create a new appointment
    async create(appointment: Appointment): Promise<number> {
      const query = `
        INSERT INTO appointments (clinic_id, user_id, service_id, appointment_date, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const values = [
        appointment.clinic_id,
        appointment.user_id,
        appointment.service_id || null,
        appointment.appointment_date,
        appointment.status || 'pending',
        appointment.notes || null
      ];

      const result = await pool.query(query, values);
      return result.rows[0].id;
    },

    // Get appointment by ID
    async findById(id: number): Promise<any | null> {
      const query = `
        SELECT a.*,
               c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone,
               u.name as user_name, u.email as user_email,
               s.name as service_name, s.price as service_price
        FROM appointments a
        JOIN companies c ON a.clinic_id = c.id
        JOIN users u ON a.user_id = u.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.id = $1
      `;

      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    },

    // Get appointments by user
    async findByUser(userId: number, status?: string): Promise<any[]> {
      let query = `
        SELECT a.*,
               c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone,
               s.name as service_name, s.price as service_price
        FROM appointments a
        JOIN companies c ON a.clinic_id = c.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.user_id = $1
      `;
      const params: any[] = [userId];

      if (status) {
        query += ' AND a.status = $2';
        params.push(status);
      }

      query += ' ORDER BY a.appointment_date DESC';

      const result = await pool.query(query, params);
      return result.rows;
    },

    // Get appointments by clinic
    async findByClinic(clinicId: number, status?: string): Promise<any[]> {
      let query = `
        SELECT a.*,
               u.name as user_name, u.email as user_email,
               s.name as service_name, s.price as service_price
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.clinic_id = $1
      `;
      const params: any[] = [clinicId];

      if (status) {
        query += ' AND a.status = $2';
        params.push(status);
      }

      query += ' ORDER BY a.appointment_date DESC';

      const result = await pool.query(query, params);
      return result.rows;
    },

    // Get upcoming appointments for a user
    async findUpcoming(userId: number): Promise<any[]> {
      const query = `
        SELECT a.*,
               c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone,
               s.name as service_name, s.price as service_price
        FROM appointments a
        JOIN companies c ON a.clinic_id = c.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.user_id = $1 AND a.appointment_date >= NOW() AND a.status != 'cancelled'
        ORDER BY a.appointment_date ASC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;
    },

    // Get past appointments for a user
    async findPast(userId: number): Promise<any[]> {
      const query = `
        SELECT a.*,
               c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone,
               s.name as service_name, s.price as service_price
        FROM appointments a
        JOIN companies c ON a.clinic_id = c.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.user_id = $1 AND a.appointment_date < NOW()
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
    async delete(id: number): Promise<boolean> {
      const query = 'DELETE FROM appointments WHERE id = $1';
      const result = await pool.query(query, [id]);
      return (result.rowCount || 0) > 0;
    },

    // Find appointments by company and date range (for slot availability)
    async findByCompanyAndDateRange(
      companyId: number,
      startDate: Date,
      endDate: Date
    ): Promise<any[]> {
      const query = `
        SELECT a.*, cs.duration_minutes
        FROM appointments a
        LEFT JOIN company_services cs ON a.service_id = cs.id
        WHERE a.company_id = $1
          AND a.appointment_date >= $2
          AND a.appointment_date < $3
          AND a.status IN ('confirmed', 'pending')
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
