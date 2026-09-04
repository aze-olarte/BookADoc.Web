import { UserRole } from './user-role.enum';

export interface AuthResponse {
  id: number;
  token: string;
  name: string;
  email: string;
  role: UserRole;
  doctorProfileId: number;
}
