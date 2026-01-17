import { Request, Response } from 'express';
import { createAppointmentModel, Appointment } from '../models/appointment.model';
import { CompanyServiceModel } from '../models/companyService.model';
import { pool } from '../config/database';
import {
  CreateAppointmentDTO,
  DayAvailability,
  TimeSlot,
} from '../types/appointment.types';
import { OpeningHours, DaySchedule } from '../types/company.types';

const appointmentModel = createAppointmentModel();

/**
 * Create a new appointment with instant confirmation
 * POST /api/appointments
 */
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentData: CreateAppointmentDTO = req.body;

    // Extract user_id from authenticated user (from JWT token)
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate required fields
    if (!appointmentData.clinic_id || !appointmentData.appointment_date) {
      res.status(400).json({ error: 'Missing required fields: clinic_id, appointment_date' });
      return;
    }

    // Convert appointment_date to Date object if it's a string
    const appointmentDate = new Date(appointmentData.appointment_date);

    if (isNaN(appointmentDate.getTime())) {
      res.status(400).json({ error: 'Invalid appointment_date format' });
      return;
    }

    // Verify company exists
    const companyCheck = await pool.query('SELECT id FROM companies WHERE id = $1', [appointmentData.clinic_id]);
    if (companyCheck.rows.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Determine total duration for the booking (support multiple services)
    // Manual blocking appointments are allowed ONLY for vetcompany users:
    // - user_id must be -1
    // - service_id must be -1
    // - duration is provided in notes as "DURATION_MINUTES=NN"
    const isCompanyUser = req.user?.role === 'vetcompany';
    const reqUserIdAny = (appointmentData as any).user_id;
    const reqServiceIdAny = (appointmentData as any).service_id;
    const isManualBlock = isCompanyUser && Number(reqUserIdAny) === -1 && Number(reqServiceIdAny) === -1;

    // Validate / resolve user_id
    // - Manual block: allow ONLY -1
    // - Otherwise: never allow -1; if user_id is provided it must exist; default to authenticated user id.
    let resolvedUserId: number = user_id;
    if (isManualBlock) {
      resolvedUserId = -1;
    } else {
      if (Number(reqUserIdAny) === -1) {
        res.status(400).json({ error: 'user_id=-1 is only allowed for manual blocks created by clinics' });
        return;
      }

      if (reqUserIdAny !== undefined && reqUserIdAny !== null) {
        const requestedUserId = Number(reqUserIdAny);
        if (!Number.isFinite(requestedUserId) || requestedUserId <= 0) {
          res.status(400).json({ error: 'Invalid user_id' });
          return;
        }

        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [requestedUserId]);
        if (userCheck.rows.length === 0) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        resolvedUserId = requestedUserId;
      }
    }

    // Validate service_id only for non-manual bookings
    if (!isManualBlock) {
      if (appointmentData.service_id !== undefined && appointmentData.service_id !== null) {
        const sid = Number(appointmentData.service_id);
        if (!Number.isFinite(sid) || sid <= 0) {
          res.status(400).json({ error: 'Invalid service_id' });
          return;
        }
      }
    }

    // Ensure placeholder user exists for manual blocks (appointments.user_id is NOT NULL and has FK)
    if (isManualBlock) {
      await pool.query(
        `INSERT INTO users (id, name, email, password, role)
         VALUES (-1, 'Manual Block', 'manual-block@system.local', 'disabled', 'user')
         ON CONFLICT (id) DO NOTHING`
      );

      // Ensure placeholder service exists for manual blocks (appointments.service_id has FK)
      // We keep service_id = -1 as a universal sentinel service.
      await pool.query(
        `INSERT INTO company_services (id, company_id, category, service_name, description, price_min, price_max, duration_minutes, is_custom, is_active)
         VALUES (-1, $1, 'custom', 'Manual Block', 'System placeholder service for manual blocking appointments', 0, 0, 30, true, false)
         ON CONFLICT (id) DO NOTHING`,
        [appointmentData.clinic_id]
      );
    }

    let totalDuration = 30; // Default duration
    const selectedServices: Array<number | { id: number }> =
      appointmentData.services && Array.isArray(appointmentData.services)
        ? appointmentData.services
        : (appointmentData.service_id && Number(appointmentData.service_id) > 0 ? [appointmentData.service_id] : []);

    if (isManualBlock) {
      const notes = String(appointmentData.notes || '');
      const m = notes.match(/DURATION_MINUTES\s*=\s*(\d+)/i);
      const parsed = m ? Number(m[1]) : NaN;
      totalDuration = Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
    } else if (selectedServices.length > 0) {
      totalDuration = 0;
      for (const s of selectedServices) {
        const sid = typeof s === 'number' ? s : s.id;
        const service = await CompanyServiceModel.findById(sid);
        if (!service) {
          res.status(404).json({ error: `Service not found: ${sid}` });
          return;
        }
        totalDuration += service.duration_minutes || 30;
      }
    }

    // Check if the slot is available for the total duration
    const isAvailable = await appointmentModel.isSlotAvailable(
      appointmentData.clinic_id,
      appointmentDate,
      totalDuration
    );

    if (!isAvailable) {
      res.status(409).json({ error: 'Time slot is not available' });
      return;
    }

    // Create appointment
    // 1) Default: created as pending (client booking)
    // 2) Manual block: created as confirmed, user_id = -1, service_id = -1
    const appointmentId = await appointmentModel.create({
      company_id: appointmentData.clinic_id, // Map clinic_id from frontend to company_id in database
      // user_id is NOT NULL in DB. Manual blocks use a reserved placeholder user id (-1).
      user_id: resolvedUserId,
      service_id: isManualBlock ? -1 : appointmentData.service_id,
      services: isManualBlock ? [] : selectedServices,
      appointment_date: appointmentDate,
      status: isManualBlock ? 'confirmed' : 'pending',
      notes: appointmentData.notes,
      // Store duration on appointment row so availability uses it when service_id is -1
      total_duration_minutes: isManualBlock ? totalDuration : undefined,
    });

    // Fetch the created appointment with details
    const appointment = await appointmentModel.findById(appointmentId);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

/**
 * Delete an appointment
 * DELETE /api/appointments/:id
 */
export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (isNaN(appointmentId)) {
      res.status(400).json({ error: 'Invalid appointment ID' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Only the appointment owner or the clinic owner can delete
    const clinicRes = await pool.query('SELECT user_id FROM companies WHERE id = $1', [appointment.company_id]);
    const clinicOwnerId = clinicRes.rows.length ? clinicRes.rows[0].user_id : null;

    if (appointment.user_id !== userId && clinicOwnerId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this appointment' });
      return;
    }

    const success = await appointmentModel.delete(appointmentId);
    if (!success) {
      res.status(500).json({ error: 'Failed to delete appointment' });
      return;
    }

    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};

/**
 * Get available time slots for a company and service
 * GET /api/appointments/availability/:companyId/:serviceId
 */
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = parseInt(req.params.companyId);
    const serviceId = parseInt(req.params.serviceId);
    const { startDate, endDate } = req.query;

    if (isNaN(companyId) || isNaN(serviceId)) {
      res.status(400).json({ error: 'Invalid companyId or serviceId' });
      return;
    }

    if (!startDate) {
      res.status(400).json({ error: 'startDate query parameter is required (YYYY-MM-DD)' });
      return;
    }

    // Parse dates
    const start = new Date(startDate as string);
    const end = endDate ? new Date(endDate as string) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    // Fetch company and service
    const companyResult = await pool.query('SELECT opening_hours FROM companies WHERE id = $1', [companyId]);
    if (companyResult.rows.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const service = await CompanyServiceModel.findById(serviceId);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const openingHours: OpeningHours = companyResult.rows[0].opening_hours;
    const serviceDuration = service.duration_minutes || 30;

    // Generate available slots
    const availability = await generateAvailableSlots(
      companyId,
      openingHours,
      serviceDuration,
      start,
      end
    );

    res.status(200).json({
      success: true,
      companyId,
      serviceId,
      serviceDuration,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      data: availability,
    });
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

/**
 * Get available slots for a company by duration only (no serviceId)
 * GET /api/appointments/availability-duration/:companyId
 */
export const getAvailableSlotsByDuration = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = parseInt(req.params.companyId);
    const { startDate, endDate, duration } = req.query;

    if (isNaN(companyId)) {
      res.status(400).json({ error: 'Invalid companyId' });
      return;
    }

    if (!startDate) {
      res.status(400).json({ error: 'startDate query parameter is required (YYYY-MM-DD)' });
      return;
    }

    const start = new Date(startDate as string);
    const end = endDate ? new Date(endDate as string) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    const dur = duration ? Number(duration) : 30;
    const durationMinutes = Number.isFinite(dur) && dur > 0 ? dur : 30;

    // Fetch company opening hours
    const companyResult = await pool.query('SELECT opening_hours FROM companies WHERE id = $1', [companyId]);
    if (companyResult.rows.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const openingHours: OpeningHours = companyResult.rows[0].opening_hours;

    const availability = await generateAvailableSlots(
      companyId,
      openingHours,
      durationMinutes,
      start,
      end
    );

    res.status(200).json({
      success: true,
      companyId,
      serviceId: -1,
      serviceDuration: durationMinutes,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      data: availability,
    });
  } catch (error: any) {
    console.error('Error fetching available slots (duration):', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

/**
 * Get user's appointments
 * GET /api/appointments/user
 */
export const getUserAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id; // From auth middleware

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status } = req.query;

    const appointments = await appointmentModel.findByUser(
      userId,
      status as string | undefined
    );

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error: any) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

/**
 * Get company's appointments
 * GET /api/appointments/company
 */
export const getCompanyAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id; // From auth middleware

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get user's company
    const companyResult = await pool.query('SELECT id FROM companies WHERE user_id = $1', [userId]);

    if (companyResult.rows.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const companyId = companyResult.rows[0].id;
    const { status } = req.query;

    const appointments = await appointmentModel.findByClinic(
      companyId,
      status as string | undefined
    );

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error: any) {
    console.error('Error fetching company appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

/**
 * Update an appointment
 * PATCH /api/appointments/:id
 */
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentId = parseInt(req.params.id);
    const userId = (req as any).user?.id; // From auth middleware

    if (isNaN(appointmentId)) {
      res.status(400).json({ error: 'Invalid appointment ID' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch appointment to verify ownership
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Get user's company to verify they own this appointment's company
    const companyResult = await pool.query('SELECT id FROM companies WHERE user_id = $1', [userId]);

    if (companyResult.rows.length === 0 || companyResult.rows[0].id !== appointment.company_id) {
      res.status(403).json({ error: 'You can only update appointments for your own company' });
      return;
    }

    // Extract update data from request body
    const updateData: Partial<Appointment> = {};

    if (req.body.appointment_date) {
      const appointmentDate = new Date(req.body.appointment_date);
      if (isNaN(appointmentDate.getTime())) {
        res.status(400).json({ error: 'Invalid appointment_date format' });
        return;
      }
      updateData.appointment_date = appointmentDate;
    }

    if (req.body.service_id !== undefined) {
      updateData.service_id = req.body.service_id;
    }

    if (req.body.status) {
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(req.body.status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
      }
      updateData.status = req.body.status;
    }

    if (req.body.notes !== undefined) {
      updateData.notes = req.body.notes;
    }

    // Update the appointment
    const success = await appointmentModel.update(appointmentId, updateData);

    if (!success) {
      res.status(500).json({ error: 'Failed to update appointment' });
      return;
    }

    // Fetch updated appointment
    const updatedAppointment = await appointmentModel.findById(appointmentId);

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment,
    });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

/**
 * Cancel an appointment
 * PATCH /api/appointments/:id/cancel
 */
export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentId = parseInt(req.params.id);
    const userId = (req as any).user?.id; // From auth middleware

    if (isNaN(appointmentId)) {
      res.status(400).json({ error: 'Invalid appointment ID' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch appointment to verify ownership
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    if (appointment.user_id !== userId) {
      res.status(403).json({ error: 'You can only cancel your own appointments' });
      return;
    }

    if (appointment.status === 'cancelled') {
      res.status(400).json({ error: 'Appointment is already cancelled' });
      return;
    }

    // Cancel the appointment
    const success = await appointmentModel.cancel(appointmentId);

    if (!success) {
      res.status(500).json({ error: 'Failed to cancel appointment' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

/**
 * Helper function to generate available time slots
 */
async function generateAvailableSlots(
  companyId: number,
  openingHours: OpeningHours,
  durationMinutes: number,
  startDate: Date,
  endDate: Date
): Promise<DayAvailability[]> {
  const availability: DayAvailability[] = [];
  const currentDate = new Date(startDate);

  // Iterate through each day in the range
  while (currentDate <= endDate) {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
      currentDate.getDay()
    ] as keyof OpeningHours;

    const daySchedule = openingHours[dayOfWeek];

    const dayAvailability: DayAvailability = {
      date: currentDate.toISOString().split('T')[0],
      dayOfWeek,
      isOpen: false,
      slots: [],
    };

    // Check if the company is open on this day
    if (daySchedule && !daySchedule.closed) {
      dayAvailability.isOpen = true;
      dayAvailability.openingHours = {
        open: daySchedule.open,
        close: daySchedule.close,
      };

      // Generate time slots for this day
      const slots = await generateDaySlots(
        companyId,
        currentDate,
        daySchedule,
        durationMinutes
      );

      dayAvailability.slots = slots;
    }

    availability.push(dayAvailability);

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availability;
}

/**
 * Helper function to generate slots for a single day
 */
async function generateDaySlots(
  companyId: number,
  date: Date,
  schedule: DaySchedule,
  durationMinutes: number
): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = [];

  // For "today", don't allow booking in the past.
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  // Parse opening and closing times
  const [openHour, openMinute] = schedule.open.split(':').map(Number);
  const [closeHour, closeMinute] = schedule.close.split(':').map(Number);

  // Create start and end times for the day
  const startTime = new Date(date);
  startTime.setHours(openHour, openMinute, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(closeHour, closeMinute, 0, 0);

  // Get occupied slots for this day
  const occupiedSlots = await appointmentModel.getOccupiedSlots(companyId, date);

  // Generate slots with the service duration interval
  let currentSlot = new Date(startTime);

  while (currentSlot.getTime() + durationMinutes * 60000 <= endTime.getTime()) {
    // Check if this slot is available
    const slotEnd = new Date(currentSlot.getTime() + durationMinutes * 60000);
    let isAvailable = true;

    // Block past times for same-day booking
    if (isToday && currentSlot.getTime() < now.getTime()) {
      isAvailable = false;
    }

    // Check for overlap with occupied slots
    if (isAvailable) {
      for (const occupied of occupiedSlots) {
        if (currentSlot < occupied.end && slotEnd > occupied.start) {
          isAvailable = false;
          break;
        }
      }
    }

    // Add slot to the list
    slots.push({
      date: date.toISOString().split('T')[0],
      time: `${String(currentSlot.getHours()).padStart(2, '0')}:${String(currentSlot.getMinutes()).padStart(2, '0')}`,
      datetime: currentSlot.toISOString(),
      available: isAvailable,
    });

    // Move to next slot (use service duration as interval)
    currentSlot = new Date(currentSlot.getTime() + durationMinutes * 60000);
  }

  return slots;
}
