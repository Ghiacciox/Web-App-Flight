import { Injectable } from '@angular/core';
import { HttpClient,  HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airplane, Flight, Result} from './search.service';
import { HttpService } from './http.service';


export interface BookingUser {
  _id: string;
  name: string;
  surname: string;
  email: string;
}

export interface Ticket {
  _id: string;
  seat: string;
  class: 'economy' | 'business' | 'firstclass';
  price: number;
  flight: Flight;
  extras: {
    baggage: boolean;
    legroom: boolean;
    priorityBoarding: boolean;
  };
}


export interface Booking {
  _id: string;
  user: BookingUser;    // Popolato
  tickets: Ticket[];    // Array di Ticket popolati
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'used';
  bookingDate: string;  // Arriva come stringa ISO dal JSON
}


export interface ticketInfo{
  userId: string;
  flightId: string;
  seat: string;
  flightClass: 'economy' | 'business' | 'firstclass';
  extras: {
    baggage: boolean;
    legroom: boolean;
    priorityBoarding: boolean;
  };
  price: number;
}

interface ServerResponse {
  error: boolean;
  errormessage: string;

  result?: Booking[]; //per getPrenotations
  bookingId?: string; //per cancelPrenotation e createTicket
}

//teoricamente ho il token salvato in ogni caso quindi dovrei essere gucci
@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private readonly url = 'http://localhost:3005/api/bookings'; //webserver backend

  constructor(
    private http: HttpClient,
    private httpServices: HttpService
  ) { }

  public selectedFlightSource: Result | null = null;
  public selectedBookingSource: Booking | null = null;

  

  //prende mail e pssw li unisce con : e le codifica in base64
  createTicket(t1: ticketInfo, t2?: ticketInfo | null): Observable<ServerResponse> {
    console.log('ticket1' + JSON.stringify(t1), 'ticket2' + JSON.stringify(t2) );

    const token=this.httpServices.get_token();
    console.log(' TOKEN INVIATO:', token);

    return this.http.post<ServerResponse>(
      this.url + '/',
      { 
        tick1: t1,           
        tick2: t2 || null    
      },
      { headers: { 'Authorization' : 'Bearer ' + token } });
  }

  setSelectedFlight(flight: Result) {
    this.selectedFlightSource = flight;
  }

  setSelectedBooking(prenotation: Booking) {
    this.selectedBookingSource= prenotation;
  }

  getPrenotations(userId: string, bookingId?: string, dateFrom?: Date, dateTo?: Date): Observable<ServerResponse> {

    let parameters= new HttpParams();
     parameters = parameters.set('userId', userId);
    if(bookingId) 
      parameters = parameters.set('bookingId', bookingId);
    if(dateFrom)
      parameters = parameters.set('dateFrom',dateFrom.toISOString());
    if(dateTo)
      parameters = parameters.set('dateTo',dateTo.toISOString());

    return this.http.get<ServerResponse>(
      this.url + '/',
      { params: parameters,
        headers: { 'Authorization' : 'Bearer ' + this.httpServices.get_token() } });  
  }

  cancelPrenotation(bookingId: string): Observable<ServerResponse> {
    return this.http.delete<ServerResponse>(
      this.url + '/'+ bookingId, 
      { headers: { 'Authorization' : 'Bearer ' + this.httpServices.get_token() } });
  }

  public generateSeats(airplane: Airplane, className: string): string[] {
    const seatsConfig = airplane?.capacity?.[className as 'economy' | 'business' | 'firstclass'];
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

  public getColumns(airplane: Airplane, className:string): number {
    const seatsConfig = airplane?.capacity?.[className as 'economy' | 'business' | 'firstclass'];
    if (!seatsConfig || !seatsConfig.seatsPerRow) {
      return 0;
    }
    return seatsConfig.seatsPerRow || 0;
  }

  public seatsGap(index: number, airplane: Airplane, className: string): boolean {
    if (!airplane) return false;

    const seatsConfig = airplane?.capacity?.[className as 'economy' | 'business' | 'firstclass'];
    if (!seatsConfig || !seatsConfig.seatsPerRow) {
      return false;
    }
    const seatsPerRow = seatsConfig.seatsPerRow;
    // Aggiungi uno spazio dopo la metà delle colonne
    return (index + 1) % (seatsPerRow / 2) === 0;
  }
    
     
}