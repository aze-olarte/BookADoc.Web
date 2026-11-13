import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-account',
  imports: [CurrencyPipe],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss',
})
export class MyAccountComponent {
  private authService = inject(AuthService);

  user = toSignal(this.authService.getMyDetails(), {
    initialValue: null,
  });
}
