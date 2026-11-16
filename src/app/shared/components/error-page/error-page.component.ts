import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-error-page',
  imports: [MatButtonModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
})
export class ErrorPageComponent {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  code: string = this.route.snapshot.data['code'];
  title: string = this.route.snapshot.data['title'];
  message: string = this.route.snapshot.data['message'];

  goBack(): void {
    const isLoggedIn = !!this.authService.getAuth();
    if (isLoggedIn) {
      this.router.navigate(['/portal/dashboard']);
    } else {
      this.router.navigate(['']);
    }
  }
}
