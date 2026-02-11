import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { Router, RouterModule, Routes } from '@angular/router';
import { HttpService, User } from '../../services/http.service';
import { AirportsService } from '../../services/airports.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [AirportsService],    
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})


export class ProfileComponent implements OnInit{

  newdata: FormGroup;

  errorMessage: string | null = null;
  successMessage: string | null = null;

    constructor(
      private router: Router,
      public http: HttpService,
      private fb: FormBuilder,
      private cdr: ChangeDetectorRef
      
    ) {
      this.newdata = this.fb.group({
        email: [{ value: '', disabled: true }], 
        role: [{ value: '', disabled: true }],
        oldPassword: [''],
        newPassword: [''],
        name: [''],
        surname : [''],
        birthdate: [''],
        phonenumber: [''],
        paymentAddress: [''],
        company: ['']
    });
  }


  ngOnInit(): void {
    this.newdata.patchValue({
      email: this.http.get_email(),
      role: this.http.get_role(),
      name: this.http.get_name(),
      surname: this.http.get_surname(),
      birthdate: this.http.get_birthdate(),
      phonenumber: this.http.get_phonenumber(),
      paymentAddress: this.http.get_paymentAddress(),
      company: this.http.get_company()
    });
  }

  onclickchangeData() {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.newdata.valid) {
       
      //toglie spazi mette maiuscole
      const userEmail = this.newdata.value.email;
      const userOldPassword = this.newdata.value.oldPassword;
      const userNewPassword = this.newdata .value.newPassword;
      const userRole = this.newdata.value.role;

      const userName = this.newdata.value.name;
      const userSurname = this.newdata.value.surname;
      const userBirthdate = this.newdata.value.birthdate;
      const userPhonenumber = this.newdata.value.phonenumber;
      const userPaymentAddress = this.newdata.value.paymentAddress;

      const userCompany = this.newdata.value.company;

      const changedData= {
        id: this.http.get_id(),
        newPassword: userNewPassword,
        oldPassword: userOldPassword,
        name: userName,
        surname: userSurname,
        birthdate: userBirthdate,
        phonenumber: userPhonenumber,
        paymentAddress: userPaymentAddress,
        company: userCompany
      };

      this.http.change_user_data(changedData).subscribe({  
        next: () => {
            this.successMessage = 'Dati utente aggiornati con successo! ';
            this.newdata.reset();
        },
        error: (error) => {
          console.error('Errore durante l\'aggiornamento dei dati utente:', error);
          this.errorMessage = error.error?.errormessage || 'Errore imprevisto del server';
        }
      });
    } else {
        this.newdata.markAllAsTouched();
        this.errorMessage = "Compila bene i campi!";
    }
  }
}