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

  onclickChangeData() {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.newdata.valid) {
       
      //toglie spazi mette maiuscole

       let changedData : any= {
        id: this.http.get_id(),
      }
        if (this.newdata.value.name !== this.http.get_name()) {
            changedData.name = this.newdata.value.name;
        }
        if (this.newdata.value.surname !== this.http.get_surname()) {
            changedData.surname = this.newdata.value.surname;
        }
        if (this.newdata.value.phonenumber !== this.http.get_phonenumber()) {
            changedData.phonenumber = this.newdata.value.phonenumber;
        }
        if (this.newdata.value.paymentAddress !== this.http.get_paymentAddress()) {
            changedData.paymentAddress = this.newdata.value.paymentAddress;
        }
        if (this.newdata.value.company !== this.http.get_company()) {
            changedData.company = this.newdata.value.company;
        }

        const formDate = this.newdata.value.birthdate; 
        const oldDate = this.http.get_birthdate();

        if (formDate !== oldDate) {
             changedData.birthdate = formDate;
        }

        if (this.newdata.value.newPassword) {
            changedData.newPassword = this.newdata.value.newPassword;
            changedData.oldPassword = this.newdata.value.oldPassword;
        }

        if (Object.keys(changedData).length <= 1) {
            this.errorMessage = "Non hai modificato nessun dato!";
            return;
        }
        
      this.http.change_user_data(changedData).subscribe({  
        next: (response: any) => {
            this.successMessage = 'Dati utente aggiornati con successo! ';
            this.newdata.reset();
            if(response.token)
                this.http.refresh_token(response.token);
            this.ngOnInit(); // Ricarica i dati utente aggiornati
            this.cdr.detectChanges(); 
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