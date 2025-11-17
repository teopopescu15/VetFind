import { Request, Response } from 'express';
import { createAppointmentModel, Appointment } from '../models/appointment.model';
import { createClinicModel } from '../models/clinic.model';
import { createServiceModel } from '../models/clinic.model';

const appointmentModel = createAppointmentModel();
const clinicModel = createClinicModel();
const serviceModel = createServiceModel();

// Factory function for appointment controller
export const createAppointmentController = () => {
  return {
    // Create a new appointment
    async createAppointment(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ success: false, message: 'User not authenticated' });
          return;
        }

        const clinicId = parseInt(req.body.clinic_id);
        const clinic = await clinicModel.findById(clinicId);

        if (!clinic) {
          res.status(404).json({ success: false, message: 'Clinic not found' });
          return;
        }

        // Validate service if provided
        if (req.body.service_id) {
          const service = await serviceModel.findById(req.body.service_id);
          if (!service || service.clinic_id !== clinicId) {
            res.status(400).json({ success: false, message: 'Invalid service for this clinic' });
            return;
          }
        }

        const appointmentData: Appointment = {
          clinic_id: clinicId,
          user_id: userId,
          service_id: req.body.service_id || null,
          appointment_date: new Date(req.body.appointment_date),
          status: 'pending',
          notes: req.body.notes || null
        };

        const appointmentId = await appointmentModel.create(appointmentData);
        const appointment = await appointmentModel.findById(appointmentId);

        res.status(201).json({
          success: true,
          message: 'Appointment created successfully',
          data: appointment
        });
      } catch (error: any) {
        console.error('Create appointment error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create appointment',
          error: error.message
        });
      }
    },

    // Get appointment by ID
    async getAppointmentById(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const appointmentId = parseInt(req.params.id);

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
          res.status(404).json({ success: false, message: 'Appointment not found' });
          return;
        }

        // Check authorization
        const clinic = await clinicModel.findById(appointment.clinic_id);
        if (appointment.user_id !== userId && clinic?.owner_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to view this appointment' });
          return;
        }

        res.status(200).json({
          success: true,
          data: appointment
        });
      } catch (error: any) {
        console.error('Get appointment error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch appointment',
          error: error.message
        });
      }
    },

    // Get user's appointments
    async getMyAppointments(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ success: false, message: 'User not authenticated' });
          return;
        }

        const status = req.query.status as string | undefined;
        const appointments = await appointmentModel.findByUser(userId, status);

        res.status(200).json({
          success: true,
          data: appointments,
          total: appointments.length
        });
      } catch (error: any) {
        console.error('Get my appointments error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch appointments',
          error: error.message
        });
      }
    },

    // Get upcoming appointments
    async getUpcomingAppointments(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ success: false, message: 'User not authenticated' });
          return;
        }

        const appointments = await appointmentModel.findUpcoming(userId);

        res.status(200).json({
          success: true,
          data: appointments,
          total: appointments.length
        });
      } catch (error: any) {
        console.error('Get upcoming appointments error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch appointments',
          error: error.message
        });
      }
    },

    // Get past appointments
    async getPastAppointments(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ success: false, message: 'User not authenticated' });
          return;
        }

        const appointments = await appointmentModel.findPast(userId);

        res.status(200).json({
          success: true,
          data: appointments,
          total: appointments.length
        });
      } catch (error: any) {
        console.error('Get past appointments error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch appointments',
          error: error.message
        });
      }
    },

    // Get clinic appointments (for clinic owners)
    async getClinicAppointments(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const clinicId = parseInt(req.params.clinicId);

        const clinic = await clinicModel.findById(clinicId);
        if (!clinic) {
          res.status(404).json({ success: false, message: 'Clinic not found' });
          return;
        }

        if (clinic.owner_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to view these appointments' });
          return;
        }

        const status = req.query.status as string | undefined;
        const appointments = await appointmentModel.findByClinic(clinicId, status);

        res.status(200).json({
          success: true,
          data: appointments,
          total: appointments.length
        });
      } catch (error: any) {
        console.error('Get clinic appointments error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch appointments',
          error: error.message
        });
      }
    },

    // Update appointment
    async updateAppointment(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const appointmentId = parseInt(req.params.id);

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
          res.status(404).json({ success: false, message: 'Appointment not found' });
          return;
        }

        // Check authorization - user or clinic owner can update
        const clinic = await clinicModel.findById(appointment.clinic_id);
        if (appointment.user_id !== userId && clinic?.owner_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
          return;
        }

        await appointmentModel.update(appointmentId, req.body);
        const updatedAppointment = await appointmentModel.findById(appointmentId);

        res.status(200).json({
          success: true,
          message: 'Appointment updated successfully',
          data: updatedAppointment
        });
      } catch (error: any) {
        console.error('Update appointment error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update appointment',
          error: error.message
        });
      }
    },

    // Cancel appointment
    async cancelAppointment(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const appointmentId = parseInt(req.params.id);

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
          res.status(404).json({ success: false, message: 'Appointment not found' });
          return;
        }

        // Only the user who created the appointment can cancel it
        if (appointment.user_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
          return;
        }

        await appointmentModel.cancel(appointmentId);
        const cancelledAppointment = await appointmentModel.findById(appointmentId);

        res.status(200).json({
          success: true,
          message: 'Appointment cancelled successfully',
          data: cancelledAppointment
        });
      } catch (error: any) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to cancel appointment',
          error: error.message
        });
      }
    },

    // Delete appointment
    async deleteAppointment(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const appointmentId = parseInt(req.params.id);

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
          res.status(404).json({ success: false, message: 'Appointment not found' });
          return;
        }

        // Check authorization
        const clinic = await clinicModel.findById(appointment.clinic_id);
        if (appointment.user_id !== userId && clinic?.owner_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to delete this appointment' });
          return;
        }

        await appointmentModel.delete(appointmentId);
        res.status(200).json({
          success: true,
          message: 'Appointment deleted successfully'
        });
      } catch (error: any) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete appointment',
          error: error.message
        });
      }
    }
  };
};

// Export controller instance
const controller = createAppointmentController();
export const createAppointment = controller.createAppointment.bind(controller);
export const getAppointmentById = controller.getAppointmentById.bind(controller);
export const getMyAppointments = controller.getMyAppointments.bind(controller);
export const getUpcomingAppointments = controller.getUpcomingAppointments.bind(controller);
export const getPastAppointments = controller.getPastAppointments.bind(controller);
export const getClinicAppointments = controller.getClinicAppointments.bind(controller);
export const updateAppointment = controller.updateAppointment.bind(controller);
export const cancelAppointment = controller.cancelAppointment.bind(controller);
export const deleteAppointment = controller.deleteAppointment.bind(controller);
