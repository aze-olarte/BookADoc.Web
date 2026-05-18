import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { UserRole } from '../../../../core/models/user-role.enum';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-role',
  imports: [MatRadioModule, MatCardModule, FormsModule, RouterLink],
  templateUrl: './register-role.component.html',
  styleUrl: './register-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterRoleComponent {
  selectedOption = signal<UserRole>(UserRole.Patient);
  options = signal<UserRole[]>([UserRole.Patient, UserRole.Doctor]);
  redirectLink = computed(() => `${this.selectedOption().toLowerCase()}`);
}
