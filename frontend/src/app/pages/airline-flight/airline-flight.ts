import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Airplane, FlightPrices, SearchService,  } from '../../services/search.service';
import { ChangeDetectorRef } from '@angular/core';
import { AirlineAirplaneService} from '../../services/airline.airplane.service';
import { BookingService} from '../../services/booking.service';

//per non toccare l'oggetto originale
interface AirplaneUI extends Airplane {
    selectedClass?: string;
}

@Component({
  selector: 'app-airline-flight',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [AirlineFlightComponent],
  standalone: true,
  templateUrl: './airline-flight.html',
  styleUrl: './airline-flight.css',
})

export class AirlineFlightComponent {

  FlightForm: FormGroup;


  airplaneModelSearch: string = '';
  //res del search
  airplanes: AirplaneUI[] = [];
  
    constructor(
      public http: HttpService,
      private fb: FormBuilder,
      private airlineAirplaneService: AirlineAirplaneService,
      private searchService: SearchService,
      private cdr: ChangeDetectorRef,
      public bookingService: BookingService
      
    ) {
    this.FlightForm = this.fb.group({
      /*
      flightNumber: flightNumber,
        company: company,
        prices: prices,
        departureTime: departureTime, 
        arrivalTime: arrivalTime,  
        airplane: airplaneId,
        route: routeId,
        */

        flightNumber: ['', [Validators.required]], //nome volo

        departureTime: ['', [Validators.required]], //orario partenza
        departureDate: ['', [Validators.required]], //data partenza
        arrivalTime: ['', [Validators.required]], //orario arrivo
        arrivalDate: ['', [Validators.required]], //data arrivo

        airplaneId: ['', [Validators.required]], //id aereo dausare per il volo o modello
        from: ['', [Validators.required]], //codice rotta da usare per il volo
        to: ['', [Validators.required]], //codice rotta da usare per il volo

        economyPrice: [0, [Validators.required, Validators.min(0)]],
        businessPrice: [0, [Validators.required, Validators.min(0)]],
        firstClassPrice: [0, [Validators.required, Validators.min(0)]],
        legroom: [0, [Validators.required, Validators.min(0)]],
        baggage: [0, [Validators.required, Validators.min(0)]],
        priorityBoarding: [0, [Validators.required, Validators.min(0)]],

    });
  }

  onclickCreateFlight() {
    if (this.FlightForm.valid) {

      const flightNumber: string = this.FlightForm.value.flightNumber;
      const airplaneId: string = this.FlightForm.value.airplaneId;
      const from: string = this.FlightForm.value.from;
      const to: string = this.FlightForm.value.to;
      const prices: FlightPrices = {
        economy: this.FlightForm.value.economyPrice,
        business: this.FlightForm.value.businessPrice,
        firstclass: this.FlightForm.value.firstClassPrice,
        extras : {
          legroom: this.FlightForm.value.legroom,
          baggage: this.FlightForm.value.baggage,
          priorityBoarding: this.FlightForm.value.priorityBoarding
        }
      };

      let date = this.FlightForm.value.departureDate;
      let time = this.FlightForm.value.departureTime;
      const departureTime: Date = new Date(date + 'T' + time);

      date = this.FlightForm.value.arrivalDate;
      time = this.FlightForm.value.arrivalTime;
      const arrivalTime: Date = new Date(date + 'T' + time);
       

      this.searchService.createFlight(flightNumber, departureTime, arrivalTime, airplaneId, from, to, prices).subscribe({
        next: (response) => {
            alert("volo creato con successo!");
            console.log('Risposta dal server:', response);
            this.FlightForm.reset();
        },
        error: (error) => {
          console.error('Errore durante la creazione del volo:', error);
            alert('Si è verificato un errore durante la creazione del volo.');
        }
      });
    } else {
        this.FlightForm.markAllAsTouched();
        alert('Compila bene i campi!');
    } 
  }

  deleteFlight(flightNumber: string) { //semplicemente mette i voli come non attivi, non li cancella davvero
    this.searchService.deleteFlight(flightNumber).subscribe({
      next: (response) => {
          alert("volo eliminato con successo!");
          console.log('Risposta dal server:', response);
      },
      error: (error) => {
        console.error('Errore durante l\'eliminazione del volo:', error);
          alert('Si è verificato un errore durante l\'eliminazione del volo.');
      }
    });
  }

}
