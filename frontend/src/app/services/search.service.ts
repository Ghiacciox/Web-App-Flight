import { Injectable } from '@angular/core';
import { HttpClient,  HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


//flightNumber, from, to, initialDate , finalDate , company


// Struttura dei prezzi (dal file Flight.js)
export interface FlightPrices {
  economy: number;
  business: number;
  firstclass: number;
  extras: {
    baggage: number;
    legroom: number;
    priorityBoarding: number;
  };
}

// Struttura dell'Aeroporto (dal file Airports.js)
export interface Airport {
  _id: string;
  code: string;  // Es. VCE
  name: string;  // Es. Marco Polo
  city: string;  // Es. Venice
  country: string;
}

// Struttura della Rotta (dal file Routes.js)
export interface Route {
  _id: string;
  departureAirport: Airport; // Qui ci sarà l'oggetto completo, non solo l'ID
  arrivalAirport: Airport;
  airlineId?: string; 
}

export interface Seats {
  rows: number;
  seatsPerRow: number;
  seatLetters: string;
  numberOfSeats: number;
}

export interface Airplane {
  _id: string;
  airplaneModel: string;
  totalSeats: number;
  capacity: {
    economy: Seats;
    business: Seats;
    firstclass: Seats;
  };
}

export interface bookedSeats {
  seats: string;  
  class: string
}

//dati nascosti dentro il nostro token
//da capire se sono uguali al nostro
export interface Flight {
  _id: string;          // L'ID univoco di Mongo 
  flightNumber: string; // Es. AZ203
  
  departureTime: string; // Date arriva come stringa ISO dal JSON
  arrivalTime: string;

  prices: FlightPrices;
  
  route: Route;        // Contiene 'city', 'code' ecc.
  airplane: Airplane;
  
  company: any;        // O stringa o oggetto User popolato (dipende dal controller)
  bookedSeats: bookedSeats[]; // Array dei posti occupati es ["1A", "2B"]
}

//risultato json
export interface Result {
  type: 'direct' | 'stopover';
  flights: Flight[];
}

//restituito dal server
export interface ServerResponse {
  message: string;
  result: any[];
}

/*
//dati per registrare il nuovo utente
//flightNumber, from, to, initialDate , finalDate , company
export interface Flight { 
  flightNumber: string;
  from: string;
  to: string;
  initialDate: Date;
  finalDate: Date;
  company: string;
};
*/


//teoricamente ho il token salvato in ogni caso quindi dovrei essere gucci
@Injectable() //può essere injectata in altri componenti
export class SearchService {

  public url = 'http://localhost:3005/api/flights'; //webserver backend
  constructor(private http: HttpClient) { }


  //prende mail e pssw li unisce con : e le codifica in base64
  searchFlights( flightNumber: string, from: string, to: string, initialDate: Date, finalDate?: Date, company?: string): Observable<ServerResponse> {
    console.log('flightNumber' + flightNumber , 'from' + from, 'to' + to, 'initialDate' + initialDate, 'finalDate' + finalDate, 'company' + company );

      let parameters= new HttpParams();
      if(flightNumber)
        parameters = parameters.set('flightNumber', flightNumber);
      if(company) 
        parameters = parameters.set('company', company);
      if(finalDate)
        parameters = parameters.set('finalDate',finalDate.toISOString());
      
      parameters = parameters
        .set('from', from)
        .set('to', to)
        .set('initialDate', initialDate.toISOString())
    
    return this.http.get<ServerResponse>(this.url + '/', { params: parameters });
  }
}