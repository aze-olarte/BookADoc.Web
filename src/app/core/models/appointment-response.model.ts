import { AppointmentStatus } from './appointment-status.enum';

export interface AppointmentResponse {
  id: number;
  slotId: number;
  userId: number;
  patientName: string;
  doctorName: string;
  specialization: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  bookedAt: Date;
}
