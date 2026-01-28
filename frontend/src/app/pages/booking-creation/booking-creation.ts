import { Component, OnInit } from '@angular/core';
import { bookedSeats, Flight, SearchService, Seats } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute} from '@angular/router';
import { HttpService } from '../../services/http.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [ HttpService, SearchService],
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
    private searchService: SearchService,
    private http: HttpService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private bookingService: BookingService
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

  // FIX: Helper per ottenere il prezzo in modo sicuro nell'HTML
  public getClassPrice(flight: Flight, className: string): number {
    const key = className as 'economy' | 'business' | 'firstclass';
    return flight.prices[key] || 0;
  }

  // --- LOGICA POSTI ---

  public generateSeats(flight: Flight): string[] {
    const seatsConfig = flight.airplane?.capacity?.[this.selectedClass as 'economy' | 'business' | 'firstclass'];
    if (!seatsConfig || !seatsConfig.rows || !seatsConfig.seatLetters) {
      return [];
    }
    const seats: string[] = [];
    const letters = seatsConfig.seatLetters.split('');
    
    for (let row = 1; row <= seatsConfig.rows; row++) {
      for (let letter of letters) {
        seats.push(`${row}${letter}`);
      }
    }
    return seats;
  }

  public getColumns(flight: Flight): number {
    const seatsConfig = flight.airplane?.capacity?.[this.selectedClass as 'economy' | 'business' | 'firstclass'];
    if (!seatsConfig || !seatsConfig.seatsPerRow) {
      return 0;
    }
    return seatsConfig.seatsPerRow || 0;
  }

  public seatsGap(index: number): boolean {
    const flight = this.firstFlight;
    if (!flight) return false;

    const seatsConfig = flight.airplane?.capacity?.[this.selectedClass as 'economy' | 'business' | 'firstclass'];
    if (!seatsConfig || !seatsConfig.seatsPerRow) {
      return false;
    }
    const seatsPerRow = seatsConfig.seatsPerRow;
    // Aggiungi uno spazio dopo la metà delle colonne
    return (index + 1) % (seatsPerRow / 2) === 0;
  }
    

  public isSeatAvailable(seat: string, flightNumber: 'first' | 'second'): boolean {
    const bookedSeats = flightNumber === 'first' ? this.bookedSeatsFirst : this.bookedSeatsSecond;
    return !bookedSeats.includes(seat);
  }

  public isSeatSelected(seat: string, flightNumber: 'first' | 'second'): boolean {
    const formPath = flightNumber === 'first' ? 'firstFlight.seat' : 'secondFlight.seat';
    return this.bookingForm.get(formPath)?.value === seat;
  }

  public selectSeat(seat: string, flightClass: string, flightNumber: 'first' | 'second'): void {
    if (!this.isSeatAvailable(seat, flightNumber)) {
      return;
    }
    
    // Auto-correzione classe se necessario (opzionale)
    const seatFormPath = flightNumber === 'first' ? 'firstFlight.seat' : 'secondFlight.seat';
    this.bookingForm.get(seatFormPath)?.setValue(seat);
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

    const bookingData = this.bookingForm.value;
    console.log('Invio:', bookingData);
    this.router.navigate(['/booking-confirmation']);
  }

  get isLoggedIn(): boolean {
    return this.http.isAuthenticated();
  }
}