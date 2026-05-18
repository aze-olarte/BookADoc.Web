import { UserRole } from './user-role.enum';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  licenseNumber?: string;
  specializationId?: number;
  consultationFee?: number;
  bio?: string;
}
