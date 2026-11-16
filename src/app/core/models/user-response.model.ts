import { SpecializationResponse } from './specialization-response.model';
import { UserRole } from './user-role.enum';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  specialization?: SpecializationResponse;
  consultationFee?: number;
  bio?: string;
  licenseNumber?: string;
}
