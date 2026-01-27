import { Injectable } from '@angular/core';
import { HttpClient,  HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Result } from './search.service';


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
  bookingId: string
}

//teoricamente ho il token salvato in ogni caso quindi dovrei essere gucci
@Injectable({
  providedIn: 'root'
})
export class BookingService {

  public url = 'http://localhost:3005/bookings'; //webserver backend
  constructor(private http: HttpClient) { }

  public selectedFlightSource: Result | null = null;

  //prende mail e pssw li unisce con : e le codifica in base64
  createTicket(t1: ticketInfo, t2: ticketInfo): Observable<ServerResponse> {
    console.log('ticket1' + JSON.stringify(t1), 'ticket2' + JSON.stringify(t2) );
    return this.http.post<ServerResponse>(this.url + '/create', { t1, t2 });
  }

  setSelectedFlight(flight: Result) {
    this.selectedFlightSource = flight;
  }
     
}