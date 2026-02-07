import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Airplane, Seats } from '../../services/search.service';
import { ChangeDetectorRef } from '@angular/core';
import { AirlineAirplaneService, AirplaneServerResponse } from '../../services/airline.airplane.service';
import { BookingService} from '../../services/booking.service';

//per non toccare l'oggetto originale
interface AirplaneUI extends Airplane {
    selectedClass?: string;
}

@Component({
  selector: 'app-airline-airplanes',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  providers: [AirlineAirplanesComponent],
  standalone: true,
  templateUrl: './airline-airplanes.html',
  styleUrl: './airline-airplanes.css',
})

export class AirlineAirplanesComponent {

  AirplaneForm: FormGroup;


  airplaneModelSearch: string = '';
  //res del search
  airplanes: AirplaneUI[] = [];
  

    constructor(
      private router: Router,
      public http: HttpService,
      private fb: FormBuilder,
      private airlineAirplaneService: AirlineAirplaneService,
      private cdr: ChangeDetectorRef,
      public bookingService: BookingService
      
    ) {
    this.AirplaneForm = this.fb.group({
        model: ['', [Validators.required]],

        economyRows: [0, [Validators.required, Validators.min(1)]],
        economySeatsPerRow: [0, [Validators.required, Validators.min(1)]],
        economySeatLetters: [''],

        businessRows: [0, [Validators.required, Validators.min(1)]],
        businessSeatsPerRow: [0, [Validators.required, Validators.min(1)]],
        businessSeatLetters: [''],

        firstClassRows: [0, [Validators.required, Validators.min(1)]],
        firstClassSeatsPerRow: [0, [Validators.required, Validators.min(1)]],
        firstClassSeatLetters: [''],
    });
  }

  generateSeatLetters(seatsPerRow: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let seatLetters = '';
    for (let i = 0; i < seatsPerRow; i++) {
      seatLetters += alphabet[i % alphabet.length];
    }
    return seatLetters;
  }

  onclickCreateAirplane() {
    if (this.AirplaneForm.valid) {
       
      //toglie spazi mette maiuscole
      const airplaneModel = this.AirplaneForm.value.model;

      const economy : Seats= {
        rows : this.AirplaneForm.value.economyRows,
        seatsPerRow : this.AirplaneForm.value.economySeatsPerRow,
        seatLetters : this.generateSeatLetters(this.AirplaneForm.value.economySeatsPerRow),
        numberOfSeats : 0 
      };

      const business : Seats = {
        rows : this.AirplaneForm.value.businessRows,
        seatsPerRow : this.AirplaneForm.value.businessSeatsPerRow,
        seatLetters : this.generateSeatLetters(this.AirplaneForm.value.businessSeatsPerRow),
        numberOfSeats : 0 
      };

      const firstClass : Seats = {
        rows : this.AirplaneForm.value.firstClassRows,
        seatsPerRow : this.AirplaneForm.value.firstClassSeatsPerRow,
        seatLetters : this.generateSeatLetters(this.AirplaneForm.value.firstClassSeatsPerRow),
        numberOfSeats : 0 //se li calcola da solo il db
      };
      

      this.airlineAirplaneService.createAirplane(airplaneModel, economy, business, firstClass).subscribe({
        next: (response) => {
            alert('Aereo creato con successo!');
            console.log('Risposta dal server:', response);
            this.AirplaneForm.reset();
        },
        error: (error) => {
          console.error('Errore durante la creazione dell\'aereo:', error);
            alert('Si è verificato un errore durante la creazione dell\'aereo.');
        }
      });
    } else {
        this.AirplaneForm.markAllAsTouched();
        alert('Compila bene i campi!');
    } 
  }


  searchAirplane() {
    if(this.airplaneModelSearch == '') {
        this.airplanes = [];
        this.cdr.detectChanges();
        return;
      }
    
    this.airlineAirplaneService.getAirplanes(this.airplaneModelSearch).subscribe({
      next: (response: AirplaneServerResponse) => { 
    
        console.log('Aereo trovato:', response.message , response.airplanes); 

        // Ora TypeScript sa che 'response.airplanes' esiste ed è un array!
        if (response.airplanes) {
            this.airplanes = response.airplanes.map(plane => ({
                ...plane, 
                selectedClass: 'economy'
            }));
        } else {
            this.airplanes = [];
        }
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Errore durante la ricerca degli aerei:', error);
      }
    });
  }


}
