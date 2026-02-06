import { Component, OnInit } from '@angular/core';
import { bookedSeats, Flight, SearchService, Seats } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { BookingService, ticketInfo } from '../../services/booking.service';

@Component({
  selector: 'app-booking-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [ SearchService],
  templateUrl: './booking-creation.html',
  styleUrl: './booking-creation.css',
})
export class BookingCreationComponent implements OnInit {

  firstFlight: Flight | null = null;
  secondFlight: Flight | null = null;
  
  public availableClasses = ['economy', 'business', 'firstclass'];

  selectedClass: string = 'economy';

  /*
  export interface Seats {
  rows: number;
  seatsPerRow: number;
  seatLetters: string;
  numberOfSeats: number;
}
  */

  seatsEconomyFirst: Seats = {} as Seats;
  seatsBusinessFirst: Seats = {} as Seats;
  seatsFirstClassFirst: Seats = {} as Seats;
  bookedSeatsFirst: bookedSeats[] = [];

  seatsEconomySecond: Seats = {} as Seats;
  seatsBusinessSecond: Seats = {} as Seats;
  seatsFirstClassSecond: Seats = {} as Seats;
  bookedSeatsSecond: bookedSeats[] = [];

  bookingForm!: FormGroup;

  constructor(
    private router: Router,
    public http: HttpService,
    private fb: FormBuilder,
    public bookingService: BookingService
  ) {}

  ngOnInit(): void { 
    const source = this.bookingService.selectedFlightSource;

    if (!source) {
      this.router.navigate(['/']);
      return;
    }

    const type = source.type;

    if (source.flights && source.flights.length > 0) {
      this.firstFlight = source.flights[0];
      
      this.bookedSeatsFirst = this.firstFlight.bookedSeats || [];
      this.seatsEconomyFirst = this.firstFlight.airplane?.capacity?.economy || {} as Seats;
      this.seatsBusinessFirst = this.firstFlight.airplane?.capacity?.business || {} as Seats;
      this.seatsFirstClassFirst = this.firstFlight.airplane?.capacity?.firstclass || {} as Seats;
    }

    if (type === 'stopover' && source.flights.length > 1) {
      this.secondFlight = source.flights[1];

      this.bookedSeatsSecond = this.secondFlight.bookedSeats || [];
      this.seatsEconomySecond = this.secondFlight.airplane?.capacity?.economy || {} as Seats;
      this.seatsBusinessSecond = this.secondFlight.airplane?.capacity?.business || {} as Seats;
      this.seatsFirstClassSecond = this.secondFlight.airplane?.capacity?.firstclass || {} as Seats;     
    }

    const formConfig: any = {};

    //*--- FORMAZIONE FORM ---*
    //per iol biglietto 1
    if (this.firstFlight) {
      formConfig.firstFlight = this.fb.group({

        class: ['economy', Validators.required], 
        seat: ['', Validators.required],
        
        extras: this.fb.group({
          baggage: [false],
          legroom: [false],
          priorityBoarding: [false]
        }),
        price: [0, Validators.required]
      });
    }

    //per il biglietto 2
    if (this.secondFlight) {
      formConfig.secondFlight = this.fb.group({

        class: ['economy', Validators.required],
        seat: ['', Validators.required],
        
        extras: this.fb.group({
          baggage: [false],
          legroom: [false],
          priorityBoarding: [false]
        }),
        price: [0, Validators.required]
      });
    }


    ///OKKKKKK
    this.bookingForm = this.fb.group(formConfig);

    this.setupPriceListeners('first');
    if (this.secondFlight) {
      this.setupPriceListeners('second');
    }

    this.calculatePrice('first');
    if (this.secondFlight) {
      this.calculatePrice('second');
    }
  }

  private setupPriceListeners(flightKey: 'first' | 'second') {
    const groupName = flightKey === 'first' ? 'firstFlight' : 'secondFlight';
    
    this.bookingForm.get(`${groupName}.class`)?.valueChanges.subscribe(() => {
      this.bookingForm.get(`${groupName}.seat`)?.setValue('');
      this.selectedClass = this.bookingForm.get(`${groupName}.class`)?.value; 
      this.calculatePrice(flightKey);
    });
    
    this.bookingForm.get(`${groupName}.extras`)?.valueChanges.subscribe(() => {
      this.calculatePrice(flightKey);
    });
  }


  //setta cambio classe
  public selectClass(flightClass: string, flightNumber: 'first' | 'second'): void {
    // Validazione tipo a runtime
    if (!['economy', 'business', 'firstclass'].includes(flightClass)) return;
    this.selectedClass = flightClass;
    const classFormPath = flightNumber === 'first' ? 'firstFlight.class' : 'secondFlight.class';
    this.bookingForm.get(classFormPath)?.setValue(flightClass);
  }

  
  public getClassPrice(flight: Flight, className: string): number {
    const key = className as 'economy' | 'business' | 'firstclass';
    return flight.prices[key] || 0;
  }


  // Verifica se il posto è libero controllando l'array di oggetti
  public isSeatAvailable(seat: string, flightClass: string, flightNumber: 'first' | 'second'): boolean {
    let bookedSeatsArray : any[] | null = null; // Metti any temporaneamente per evitare errori TS

    if (flightNumber === 'first') {
      bookedSeatsArray = this.bookedSeatsFirst;
    } else if (flightNumber === 'second') {
      bookedSeatsArray = this.bookedSeatsSecond;
    } 

    if (!bookedSeatsArray || bookedSeatsArray.length === 0) return true; 

    // --- DEBUG: STAMPA IL PRIMO ELEMENTO PER VEDERE I NOMI REALI ---
    // Fallo solo per il posto 1A per non intasare la console
    if (seat === '1A') {
        console.log('STRUTTURA REALE DATA DAL SERVER:', JSON.stringify(bookedSeatsArray[0]));
    }
    // -------------------------------------------------------------

    const isBooked = bookedSeatsArray.some(booking => {
        // PROBABILMENTE LA SOLUZIONE È QUESTA (seat singolare, travelClass):
        // Verifica se i nomi coincidono con quelli stampati nel log sopra
        return (booking.seat || booking.seats) === seat && 
               (booking.travelClass || booking.class) === flightClass;
    });

    return !isBooked; 
}

  // Verifica se il posto è selezionato nel form per evidenziarlo
  public isSeatSelected(seat: string, flightNumber: 'first' | 'second'): boolean {
    const formPath = flightNumber === 'first' ? 'firstFlight.seat' : 'secondFlight.seat';
    return this.bookingForm.get(formPath)?.value === seat;
  }

  // Seleziona il posto aggiornando il form
  public selectSeat(seat: string, flightClass: string, flightNumber: 'first' | 'second'): void {
  
    if (!this.isSeatAvailable(seat, flightClass, flightNumber)) {
      return;
    }

    const seatFormPath = flightNumber === 'first' ? 'firstFlight.seat' : 'secondFlight.seat';
    
    // Se clicco su un posto già selezionato, lo deseleziono (opzionale, ma utile per UX)
    const currentSelection = this.bookingForm.get(seatFormPath)?.value;
    if (currentSelection === seat) {
        this.bookingForm.get(seatFormPath)?.setValue(''); // Deseleziona
    } else {
        this.bookingForm.get(seatFormPath)?.setValue(seat); // Seleziona
    }
  }


  // --- CALCOLO PREZZI ---

  calculatePrice(flightNumber: 'first' | 'second'): void {
    const flight = flightNumber === 'first' ? this.firstFlight : this.secondFlight;
    if (!flight) return;

    const groupName = flightNumber === 'first' ? 'firstFlight' : 'secondFlight';
    const selectedClass = this.bookingForm.get(`${groupName}.class`)?.value as 'economy' | 'business' | 'firstclass';
    const extras = this.bookingForm.get(`${groupName}.extras`)?.value;

    let total = flight.prices[selectedClass] || 0;
    
    if (extras?.baggage) total += flight.prices.extras.baggage;
    if (extras?.legroom) total += flight.prices.extras.legroom;
    if (extras?.priorityBoarding) total += flight.prices.extras.priorityBoarding;

    this.bookingForm.get(`${groupName}.price`)?.setValue(total, { emitEvent: false });
  }

  getTotalPrice(): number {
    
    if (!this.bookingForm) {
      return 0;
    }
    
    let total = 0;
    total += this.bookingForm.get('firstFlight.price')?.value || 0;
    if (this.secondFlight) {
      total += this.bookingForm.get('secondFlight.price')?.value || 0;
    }
    return total;
  }


  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    const userId = this.http.get_id();
    console.log('User ID:', userId);

    const bookingData = this.bookingForm.value;
    console.log('Invio:', bookingData);
    const t1: ticketInfo = {
      userId: this.http.get_id(),
      flightId: this.firstFlight!._id,
      seat: bookingData.firstFlight.seat,
      flightClass: bookingData.firstFlight.class,
      extras: bookingData.firstFlight.extras,
      price: bookingData.firstFlight.price
    };

    let t2: ticketInfo | null = null; 

    if(this.secondFlight){
      t2 = {
        userId: this.http.get_id(),
        flightId: this.secondFlight!._id,
        seat: bookingData.secondFlight.seat,
        flightClass: bookingData.secondFlight.class,
        extras: bookingData.secondFlight.extras,
        price: bookingData.secondFlight.price
      };
    }

    this.bookingService.createTicket(t1, t2).subscribe({
      next: (response) => {
        console.log('Risposta dal server:', response);
        this.router.navigate(['/bookingPrenotation']);
      },
      error: (error) => {
        console.error('Errore durante la creazione del biglietto:', error);
        alert('Si è verificato un errore durante la creazione del biglietto. Riprova più tardi.');
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.http.isAuthenticated();
  }
}