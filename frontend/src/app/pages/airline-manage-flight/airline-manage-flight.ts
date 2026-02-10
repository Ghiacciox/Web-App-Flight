import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, ValidatorFn, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Airplane, Flight, FlightPrices, SearchService,  } from '../../services/search.service';
import { ChangeDetectorRef } from '@angular/core';
import { AirlineAirplaneService} from '../../services/airline.airplane.service';
import { BookingService} from '../../services/booking.service';
import { RouterModule } from '@angular/router';
import { dateComparisonValidator } from '../airline-flight/airline-flight';


@Component({
  selector: 'app-airline-manage-flight',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  providers: [SearchService, AirlineAirplaneService, BookingService],
  templateUrl: './airline-manage-flight.html',
  styleUrl: './airline-manage-flight.css',
})

export class AirlineManageFlightComponent implements OnInit {

  //FlightForm: FormGroup;

  airplaneModelSearch: string = '';
  //res del search
  parentForm: FormGroup;
  searchForm: FormGroup;

  flights: Flight[] = [];

  errorMessage: string | null = null;
  successMessage: string | null = null;
  
    constructor(
      public http: HttpService,
      private fb: FormBuilder,
      private searchService: SearchService,
      private cdr: ChangeDetectorRef,
      public bookingService: BookingService
      
    ) {

    this.parentForm = this.fb.group({
      flightRows: this.fb.array([])
    });

    this.searchForm = this.fb.group({
      flightNumber: [''],
      from: [''],
      to: [''],
      initialDate: [''],
      finalDate: [''],
    });
  }


  //semplicemente prendo l'array dentro al fromgroup principale, che contiene tutte le righe dei voli
  get flightRows(): FormArray {
    return this.parentForm.get('flightRows') as FormArray;
  }

  ngOnInit() {
    this.loadFlights();
  }

  searchFlights() {
   this.loadFlights();
  }

  loadFlights() {
   let flightId = this.searchForm.value.flightNumber;
    if(flightId === '') flightId = undefined;

    let from = this.searchForm.value.from;
    if(from === '') from = undefined;
    
    let to = this.searchForm.value.to;
    if(to === '') to = undefined;

    let initialDate = this.searchForm.value.initialDate;
    if(initialDate === '') initialDate = undefined;

    let finalDate = this.searchForm.value.finalDate;
    if(finalDate === '') finalDate = undefined;

    
    let companyId: string | undefined = undefined;
    if (this.http.get_role() === 'airline') {
      companyId = this.http.get_company();
    }

    console.log('Ricerca voli con parametri:', { flightId, from, to, initialDate, finalDate, companyId });

    this.searchService.searchFlights(flightId, from, to, initialDate, finalDate, companyId).
      subscribe({
        next: (response) => {
          console.log('Voli trovati:', response);
          this.flights = response.result;
          this.populateFormArray(response.result);
        },
        error: (error) =>{
          console.error('Errore durante il recupero dei voli:', error);
          this.errorMessage = 'Errore durante il recupero dei voli : ' + error;
        }
      });
  }

  // Popola il FormArray con i dati ricevuti
  populateFormArray(flights: any[]) {
    //prendo l'array di form
    const control = this.flightRows;
    control.clear(); // Pulisce se c'erano vecchi dati

    for(let res of flights) {

      const f = res.flights[0];


      console.log('=== FLIGHT DEBUG ===');
      console.log('Full flight object:', JSON.stringify(f, null, 2));
      console.log('Flight number:', f.flightNumber);
      console.log('Prices object:', f.prices);
      console.log('Airplane object:', f.airplane);
      console.log('Route object:', f.route);
      console.log('Company object:', f.company);
      console.log('===================');


      const depDate = new Date(f.departureTime);
      const arrDate = new Date(f.arrivalTime);

       // Format time as HH:MM
    const formatTime = (date: Date): string => {
      if (!date || isNaN(date.getTime())) {
        return '00:00';
      }
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    // Format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      if (!date || isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0];
    };

      control.push(this.fb.group({
        id: [f._id],
        flightNumber: [f.flightNumber],
        airplaneId: [f.airplane?._id],
        from: [f.route?.departureAirport?.code],
        to: [f.route?.arrivalAirport?.code],

        //campi cambiabili
        departureTime: [formatTime(depDate)], //orario partenza
        departureDate: [formatDate(depDate)], //data partenza
        arrivalTime: [formatTime(arrDate)], //orario arrivo
        arrivalDate: [formatDate(arrDate)], //data arrivo

        // Using actual values from flight data
        economyPrice: [f.prices?.economy || 0],
        businessPrice: [f.prices?.business || 0],
        firstClassPrice: [f.prices?.firstclass || 0],
        legroom: [f.prices?.extras?.legroom || 0],
        baggage: [f.prices?.extras?.baggage || 0],
        priorityBoarding: [f.prices?.extras?.priorityBoarding || 0],
      }, { validators: dateComparisonValidator }));
    }
  }

  // Salva una singola riga
  //per modificare singolo
  saveRow(index: number) {
    const daCambiare = this.flightRows.at(index).value;

    console.log('Dati da salvare per il volo:', daCambiare);

    /*
    if (!daCambiare.valid) {
      this.errorMessage = 'Controlla che tutti i campi siano validi e che la data/ora di arrivo sia successiva alla partenza.';
      return;
    }
    */
    
    console.log('Dati validi, procedo con la chiamata API per aggiornare il volo:', daCambiare);
    
    const prices: FlightPrices = {
      economy: daCambiare.economyPrice,
      business: daCambiare.businessPrice,
      firstclass: daCambiare.firstClassPrice,
      extras: { 
        legroom: daCambiare.legroom,
        baggage: daCambiare.baggage,
        priorityBoarding: daCambiare.priorityBoarding
       }
    };

    const departureTime = new Date(daCambiare.departureDate + 'T' + daCambiare.departureTime);
    const arrivalTime = new Date(daCambiare.arrivalDate + 'T' + daCambiare.arrivalTime);

    this.searchService.updateFlight(daCambiare.id, prices, departureTime, arrivalTime).subscribe({
      next: (res) => {
        this.successMessage = ` aggiornato!`+ res.message;
        this.flightRows.at(index).markAsPristine(); // Segna come "non modificato"
      },
      error: (err) => {
        console.error('Errore durante l\'aggiornamento del volo:', err);
        this.errorMessage = `Errore durante l'aggiornamento del volo ${daCambiare.flightNumber}: ` + (err.error?.errormessage || 'Errore imprevisto del server');
      }
    });
  }

deleteRow(index: number) {
    const daCancellare = this.flightRows.at(index).value;
    console.log('Cancellazione del volo:', daCancellare);
    this.searchService.deleteFlight(daCancellare.id).subscribe({
      next: (res) => {
        this.successMessage = `Volo ${daCancellare.flightNumber} eliminato!`;
        this.flightRows.removeAt(index); // Rimuove la riga dal FormArray
      },
      error: (err) => {
        console.error('Errore durante l\'eliminazione del volo:', err);
        this.errorMessage = `Errore durante l'eliminazione del volo ${daCancellare.flightNumber}: ` + (err.error?.errormessage || 'Errore imprevisto del server');
      }
    });
  }


}