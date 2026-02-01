import { Injectable } from '@angular/core';
import { HttpClient,  HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Flight, Result, Seats } from './search.service';
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
  flightClass: 'economy' | 'business' | 'firstclass';
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

  public url = 'http://localhost:3005/api/bookings'; //webserver backend

  constructor(
    private http: HttpClient,
    private httpServices: HttpService
  ) { }

  public selectedFlightSource: Result | null = null;

  

  //prende mail e pssw li unisce con : e le codifica in base64
  createTicket(t1: ticketInfo, t2?: ticketInfo | null): Observable<ServerResponse> {
    console.log('ticket1' + JSON.stringify(t1), 'ticket2' + JSON.stringify(t2) );

    const token=this.httpServices.get_token();
    console.log('🔑 TOKEN INVIATO:', token);

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
     
}