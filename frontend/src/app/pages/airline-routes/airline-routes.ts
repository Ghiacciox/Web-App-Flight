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

  errorMessageRoute: string | null = null;
  successMessageRoute: string | null = null;
  errorMessageAirport: string | null = null;
  successMessageAirport: string | null = null;

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
       code: [''],
        name: [''],
        city: [''],
        country: ['']
    });
  }

  onclickCreateRoute() {
    this.errorMessageRoute = null;
    this.successMessageRoute = null;

    if (this.RouteForm.valid) {
       
      //toglie spazi mette maiuscole
      const departureCode = this.RouteForm.value.departureCode.toUpperCase().replace(/\s/g, "");
      const arrivalCode = this.RouteForm.value.arrivalCode.toUpperCase().replace(/\s/g, "")

      this.airlineRouteService.createRoute(departureCode, arrivalCode).subscribe({
        next: (response) => {
            this.successMessageRoute = "'Rotta creata con successo! ";
            console.log('Rotta creata:', response);
            this.RouteForm.reset();
        },
        error:(error) => {
          console.error('Errore durante la creazione della rotta:', error);
          this.errorMessageRoute = error.error?.errormessage || 'Errore imprevisto del server';
        }
      });
    } else {
        this.RouteForm.markAllAsTouched();
        this.errorMessageRoute = "Compila bene i campi!";
    } 
  }


  onclickSearchRoute() {
    this.errorMessageRoute = null;
    this.successMessageRoute = null;

    if (this.RouteForm.valid) {

      const departureCode = this.RouteForm.value.departureCode.toUpperCase().replace(/\s/g, "");
      const arrivalCode = this.RouteForm.value.arrivalCode.toUpperCase().replace(/\s/g, "");

      this.airlineRouteService.getRoutes(departureCode, arrivalCode).subscribe({
        next: (response: any) => { 
            console.log('JSON Arrivato:', response);
            this.routes = Array.isArray(response) ? response : [response]; 
            console.log('Rotte salvate nella variabile:', this.routes);
            this.cdr.detectChanges(); 

            if (this.routes.length === 0) {
                this.errorMessageRoute = 'Nessuna rotta trovata!';
            } else {
                this.successMessageRoute = 'Rotte trovate con successo!';
            }
        },
        error: (error) => {
            console.error('Errore backend:', error);
           this.errorMessageRoute = error.error?.errormessage || 'Errore imprevisto del server';
        }
      });
    } else {
        this.RouteForm.markAllAsTouched();
        this.errorMessageRoute = "Compila bene i campi!";
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
        this.cdr.detectChanges();
        console.log('Aeroporti aggiornati:', this.airports);
        this.successMessageAirport = 'Aeroporti trovati con successo!';
      },
      error: (error) => {
        this.errorMessageAirport = error.error?.errormessage || 'Errore imprevisto del server';
      }
    });
  }

  /*
  deleteRoute(routeId: string) {
   const token = this.httpServices.get_token();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<ServerResponse>(
      this.apiUrl + '/'+ routeId, //url con id rotta 
      {headers: headers} 
    );
  }
  */

   deleteRoute(routeId: string) { //semplicemente mette i voli come non attivi, non li cancella davvero
    this.airlineRouteService.deleteRoute(routeId).subscribe({
      next: (response) => {
          this.successMessageRoute = "Rotta eliminata con successo!";
          console.log('Risposta dal server:', response);
          this.routes = this.routes.filter(route => route._id !== routeId); //tolgo la rotta eliminata dalla lista
          this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Errore durante l\'eliminazione della rotta:', error);
        this.errorMessageRoute = error.error?.errormessage || 'Si è verificato un errore durante l\'eliminazione della rotta.';
        this.cdr.detectChanges();
      }
    });
  }

}
