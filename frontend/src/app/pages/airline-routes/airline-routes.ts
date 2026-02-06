import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { Router, RouterModule, Routes } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AirlineRouteService } from '../../services/airline.route.service';
import { AirportsService } from '../../services/airports.service';
import { Airport, Route } from '../../services/search.service';
import { ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-airline-routes',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [AirlineRoutesComponent],
  standalone: true,
  templateUrl: './airline-routes.html',
  styleUrl: './airline-routes.css',
})

export class AirlineRoutesComponent {

  RouteForm: FormGroup;
  AirportForm: FormGroup;

  airports: Airport[] = [];
  routes: Route[] = [];

    constructor(
      private router: Router,
      public http: HttpService,
      private fb: FormBuilder,
      private airlineRouteService: AirlineRouteService,
      private airportService: AirportsService,
      private cdr: ChangeDetectorRef
      
    ) {
      this.RouteForm = this.fb.group({
        departureCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
        arrivalCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    });
    this.AirportForm = this.fb.group({
       code: ['', [Validators.minLength(3), Validators.maxLength(3)]],
        name: [''],
        city: [''],
        country: ['']
    });
  }

  onclickCreateRoute() {
    if (this.RouteForm.valid) {
       
      //toglie spazi mette maiuscole
      const departureCode = this.RouteForm.value.departureCode.toUpperCase().replace(/\s/g, "");
      const arrivalCode = this.RouteForm.value.arrivalCode.toUpperCase().replace(/\s/g, "")

      this.airlineRouteService.createRoute(departureCode, arrivalCode).subscribe(
        () => {
            alert('Rotta creata con successo!');
            this.RouteForm.reset();
        },
        (error) => {
          console.error('Errore durante la creazione della rotta:', error);
            alert('Si è verificato un errore durante la creazione della rotta.');
        }
      );
    } else {
        this.RouteForm.markAllAsTouched();
        alert('Compila bene i campi!');
    } 
  }


  onclickSearchRoute() {
    if (this.RouteForm.valid) {

      const departureCode = this.RouteForm.value.departureCode.toUpperCase().replace(/\s/g, "");
      const arrivalCode = this.RouteForm.value.arrivalCode.toUpperCase().replace(/\s/g, "");

      this.airlineRouteService.getRoutes(departureCode, arrivalCode).subscribe({
        next: (response: any) => { 
            console.log('JSON Arrivato:', response);
            this.routes = response; 
            console.log('Rotte salvate nella variabile:', this.routes);
            this.cdr.detectChanges(); 

            if (this.routes.length === 0) {
                alert('Nessuna rotta trovata.');
            } else {
            }
        },
        error: (error) => {
            console.error('Errore backend:', error);
            alert('Errore durante la ricerca.');
        }
      });
    } else {
        this.RouteForm.markAllAsTouched();
        alert('Compila bene i campi!');
    } 
  }

  searchAirports() {
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
        this.cdr.detectChanges();
        console.log('Aeroporti aggiornati:', this.airports);
      },
      error: (error) => {
        console.error('Errore durante la ricerca degli aeroporti:', error);
      }
    });
  }


}
