import { Request, Response } from 'express';
import { createAppointmentModel } from '../models/appointment.model';
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

    // If service_id provided, verify it exists and get duration
    let serviceDuration = 30; // Default duration
    if (appointmentData.service_id) {
      const service = await CompanyServiceModel.findById(appointmentData.service_id);
      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      serviceDuration = service.duration_minutes || 30;
    }

    // Check if the slot is available
    const isAvailable = await appointmentModel.isSlotAvailable(
      appointmentData.clinic_id,
      appointmentDate,
      serviceDuration
    );

    if (!isAvailable) {
      res.status(409).json({ error: 'Time slot is not available' });
      return;
    }

    // Create appointment with instant confirmation (using user_id from JWT token)
    const appointmentId = await appointmentModel.create({
      company_id: appointmentData.clinic_id, // Map clinic_id from frontend to company_id in database
      user_id: user_id, // Use user_id from authenticated token, not request body
      service_id: appointmentData.service_id,
      appointment_date: appointmentDate,
      status: 'confirmed', // Instant confirmation
      notes: appointmentData.notes,
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

    // Check for overlap with occupied slots
    for (const occupied of occupiedSlots) {
      if (currentSlot < occupied.end && slotEnd > occupied.start) {
        isAvailable = false;
        break;
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
