import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [HttpService], 
  templateUrl: './login.html',
  styleUrls: ['./login.css']  
})

export class LoginComponent {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public httpService: HttpService,
    private router: Router
    ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Dati inviati:', this.loginForm.value);
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      
      this.httpService.login(email, password, true).subscribe({
        next: (response) => {
          if(response.error) {
            alert('Login fallito: ' + response.errormessage);
            return;
          }
          console.log('Login successful:', response);
          //this.router.navigate(['/home']);
          window.location.href = '/home';
        },
        error: (error) => {
          console.error('Login failed:', error);
          alert('Login fallito. Controlla le tue credenziali.');
        }
      }); 
      
    } else {
      this.loginForm.markAllAsTouched();
      alert('Compila bene i campi!');
    }
  }
}