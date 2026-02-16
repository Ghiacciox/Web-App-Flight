
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { Router, RouterModule, Routes } from '@angular/router';
import { HttpService, User } from '../../services/http.service';
import { AirportsService } from '../../services/airports.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-admin-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [AirportsService],    
  templateUrl: './admin-add-user.html',
  styleUrl: './admin-add-user.css',
})


export class AdminAddUserComponent {

  newUserForm: FormGroup;

  userlist: User[] = [];
  SearchForm: FormGroup;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  errormessageUser: string | null = null;
  successmessageUser: string | null = null;

    constructor(
      private router: Router,
      public http: HttpService,
      private fb: FormBuilder,
      private cdr: ChangeDetectorRef
      
    ) {
      this.newUserForm = this.fb.group({
        email: ['', Validators.required], 
        password: ['', Validators.required],
        role: ['', Validators.required || Validators.pattern('^(passenger|airline)$')],

        name: [''],
        surname : [''],
        birthdate: [''],
        phonenumber: [''],
        paymentAddress: [''],

        company: ['']
    });
    this.SearchForm = this.fb.group({
        email: [''],
    });
  }

  onclickCreateUser() {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.newUserForm.valid) {
       
      //toglie spazi mette maiuscole
      const userEmail = this.newUserForm.value.email;
      const userPassword = this.newUserForm.value.password;
      const userRole = this.newUserForm.value.role;

      const userName = this.newUserForm.value.name;
      const userSurname = this.newUserForm.value.surname;
      const userBirthdate = this.newUserForm.value.birthdate;
      const userPhonenumber = this.newUserForm.value.phonenumber;
      const userPaymentAddress = this.newUserForm.value.paymentAddress;

      const userCompany = this.newUserForm.value.company;

      const newUser: User = {
        email: userEmail,
        password: userPassword,
        role: userRole,
        name: userName,
        surname: userSurname,
        birthdate: userBirthdate,
        phonenumber: userPhonenumber,
        paymentAddress: userPaymentAddress,
        company: userCompany
      };

      this.http.register(newUser).subscribe({  
        next: (result) => {
            this.successMessage = 'Utente creato con successo!';
            console.log('Utente creato con successo:', result);
            this.newUserForm.reset();
        },
        error: (error) => {
          console.error('Errore durante la creazione dell\'utente:', error);
          this.errorMessage = error.error?.errormessage || 'Errore imprevisto del server';
        }
      });
    } else {
        this.newUserForm.markAllAsTouched();
        this.errorMessage = "Compila bene i campi!";
    }
  }

  searchUser() {
    this.errorMessage = null;
    this.successMessage = null;

    this.http.get_users(this.SearchForm.value.email).subscribe({
      next: (response) => {
        if (response.error) {
          this.errormessageUser = response.errormessage || 'Errore imprevisto del server';
          this.userlist = [];
        } else {
          this.userlist = response.users;
          this.successmessageUser = 'Utenti trovati con successo!';
          console.log('Utenti trovati:', response);
          console.log('Utenti trovati:', this.userlist);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Errore durante la ricerca degli utenti:', error);
        this.errormessageUser = error.error?.errormessage || 'Errore imprevisto del server';
        this.userlist = [];
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(id : string) {
    this.errormessageUser = null;
    this.successmessageUser = null;

    if (!id) {
        console.error("Errore: ID utente mancante o non valido");
        return;
    }

    this.http.delete_user(id).subscribe({
      next: (response) => {
        if (response.error) {
          this.errormessageUser = response.errormessage || 'Errore imprevisto del server';
        } else {
          this.successmessageUser = 'Utente eliminato con successo!';
          console.log('Utente eliminato con successo:', response);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Errore durante l\'eliminazione dell\'utente:', error);
        this.errormessageUser = error.error?.errormessage || 'Errore imprevisto del server';
        this.cdr.detectChanges();
      }
    });   
  }
}