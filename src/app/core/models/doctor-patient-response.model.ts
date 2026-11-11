export interface DoctorPatientResponse {
  patientProfileId: number;
  name: string;
  email: string;
  totalAppointments: number;
  lastAppointmentDate: Date;
}
