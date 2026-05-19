import { SpecializationResponse } from './specialization-response.model';

export interface DoctorResponse {
  id: number;
  userId: number;
  name: string;
  email: string;
  consultationFee: number;
  licenseNumber: string;
  bio?: string;
  specialization: SpecializationResponse;
}
