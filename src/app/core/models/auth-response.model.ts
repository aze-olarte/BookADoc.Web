import { UserRole } from './user-role.enum';

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: UserRole;
}
