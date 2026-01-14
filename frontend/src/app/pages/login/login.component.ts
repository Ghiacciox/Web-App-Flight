import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';


//quali sono template attaccatti html e css
@Component({
  selector: 'app-login', 
  //come visualizzore il componente
  //ci inserisco l'html dove metto 
  // <app-loginc></app-login>
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './login.component.html',
  styleUrls: './login.component.css'
})
 
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Dati inviati:', this.loginForm.value);
      // Qui poi chiameremo il backend!
    } else {
      alert('Compila bene i campi!');
    }
  }
}