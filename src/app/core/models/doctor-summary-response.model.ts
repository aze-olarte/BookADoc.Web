import { SpecializationResponse } from './specialization-response.model';

export interface DoctorSummaryResponse {
  id: number;
  name: string;
  specialization: SpecializationResponse;
}
