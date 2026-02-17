import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registration',
   standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [HttpService], 
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})


export class RegistrationComponent {

  role: string = 'passenger'; // Valore predefinito
  registrationForm: FormGroup;

  constructor(private fb: FormBuilder, private httpService: HttpService, private router: Router) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      company: [''],
      name: [''],
      surname: [''],
      birthdate: [''],
      phonenumber: [''],
      paymentAddress: [''],
    }); 
  }


  setRole(role: string) {
    this.role = role;
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      console.log('Dati inviati:', this.registrationForm.value);
      const email = this.registrationForm.get('email')?.value;
      const password = this.registrationForm.get('password')?.value;
      const role = this.role;
      const company = this.registrationForm.get('company')?.value;
      const name = this.registrationForm.get('name')?.value;
      const surname = this.registrationForm.get('surname')?.value;
      const birthdate = this.registrationForm.get('birthdate')?.value;
      const phonenumber = this.registrationForm.get('phonenumber')?.value;
      const paymentAddress = this.registrationForm.get('paymentAddress')?.value;
  
      
/*
company
{
  "email": "contact@skyfly.it",
  "password": "AirlinePassword2024!",
  "role": "airline",
  "company": "SkyFly Airlines"
}
utenteeee
{  
    "email": "mario.rossi@example.com",
    "password": "PasswordSicura123!",
    "role": "passenger",
    "name": "Mario",
    "surname": "Rossi",
    "birthdate": "1990-05-20",
    "phonenumber": "+393331234567",
    "paymentAddress": "Via Roma 1, Milano"
}
*/


  let userData: any = {};
  if (role === 'passenger') {
        userData = {
          email: email,
          password: password,
          role : role,
          name : name,
          surname : surname,
          birthdate : birthdate,
          phonenumber : phonenumber,
          paymentAddress : paymentAddress
        }
  } else if (role === 'airline') {    
        userData = {
          email: email,
          password: password,
          role : role,
          company : company 
        }

  }else{
        alert('Ruolo non valido selezionato!');
        return;
  }

      
  this.httpService.register(userData).subscribe({
        next: (response) => {
          if(response.error) {
            alert('Registrazione fallita: ' + response.errormessage);
            return;
          }
          console.log('Registrazione successful:',response);
          
          this.httpService.login(email, password, true).subscribe({
            next: (loginResponse) => {
              if(loginResponse.error) {
                alert('Login fallito: ' + loginResponse.errormessage);
                return;
              }
              console.log('Login successful:', loginResponse);
              //this.router.navigate(['/home']);
              window.location.href = '/home';
            },
            error: (error) => {
              console.error('Login failed:', error);
              alert('Login fallito. Controlla le tue credenziali.');
            }
          });
        
        },
        error: (error) => {
          console.error('Registrazione failed:', error);
          alert('Registrazione fallita. Controlla le tue credenziali.');
        }
      }); 
      
    } else {
      this.registrationForm.markAllAsTouched();
      alert('Compila bene i campi!');
    }
  }

}



