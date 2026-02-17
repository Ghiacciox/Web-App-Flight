import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { Router, RouterModule, Routes } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AirportsService } from '../../services/airports.service';
import { Airport, Route } from '../../services/search.service';
import { ChangeDetectorRef } from '@angular/core';
import { AirlineRouteService } from '../../services/airline.route.service';



@Component({
  selector: 'app-admin-create-airports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [AirportsService],    
  templateUrl: './admin-create-airports.html',
  styleUrl: './admin-create-airports.css',
})

export class AdminCreateAirportsComponent {

  errorMessageAirport: string | null = null;
  successMessageAirport: string | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  AirportForm: FormGroup;
  newAirportForm: FormGroup;

  airports: Airport[] = [];

    constructor(
      private router: Router,
      public http: HttpService,
      private fb: FormBuilder,
      private airlineRouteService: AirlineRouteService,
      private airportService: AirportsService,
      private cdr: ChangeDetectorRef
      
    ) {
      this.newAirportForm = this.fb.group({
        code: ['', Validators.required], 
        name: ['', Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required]
    });
    this.AirportForm = this.fb.group({
       code: [''],
        name: [''],
        city: [''],
        country: ['']
    });
  }

  onclickCreateAirport() {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.newAirportForm.valid) {
       
      //toglie spazi mette maiuscole
      const airportCode = this.newAirportForm.value.code.toUpperCase().replace(/\s/g, "");
      const airportName = this.newAirportForm.value.name;
      const airportCity = this.newAirportForm.value.city;
      const airportCountry = this.newAirportForm.value.country;

      this.airportService.createAirport(airportCode, airportName, airportCity, airportCountry).subscribe({  
        next: (res) => {
            console.log('Aeroporto creato con successo:', res);
            this.successMessage = "'Aeroporto creato con successo!";
            this.newAirportForm.reset();
        },
        error: (error) => {
          console.error('Errore durante la creazione dell\'aeroporto:', error);
          this.errorMessage = error.error?.errormessage || 'Errore imprevisto del server';
        }
      });
    } else {
        this.newAirportForm.markAllAsTouched();
        this.errorMessage = "Compila bene i campi!";
    } 
  }

  searchAirports() {
    this.errorMessageAirport = null;
    this.successMessageAirport = null;

    if(this.AirportForm.value.code == '' && 
      this.AirportForm.value.name =='' &&
      this.AirportForm.value.city =='' &&
      this.AirportForm.value.country == '') {
        this.airports = [];
        this.cdr.detectChanges();
        return;
      }
    
    this.airportService.getAirports(
      this.AirportForm.value.code,
      this.AirportForm.value.name,
      this.AirportForm.value.city,
      this.AirportForm.value.country).subscribe({
      next: (response) => {
        console.log('Aeroporti trovati:', response);

        this.airports = response.airports;
        console.log('Aeroporti aggiornati:', this.airports);
        this.successMessageAirport = 'Aeroporti trovati con successo!';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessageAirport = error.error?.errormessage || 'Errore imprevisto del server';
      }
    });
  }
}
