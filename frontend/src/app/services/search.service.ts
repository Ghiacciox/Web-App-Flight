import { Injectable } from '@angular/core';
import { HttpClient,  HttpHeaders,  HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { AirportsService } from './airports.service';


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
  active: boolean;
}

// Struttura della Rotta (dal file Routes.js)
export interface Route {
  _id: string;
  departureAirport: Airport; 
  arrivalAirport: Airport;
  airlineId?: string; 
  active: boolean;
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
  active: boolean;
}

export interface bookedSeats {
  seats: string;  
  class: string
}
 export interface newFlightResponse {
  message: string;
  flight: Flight;
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

  private readonly url = 'http://localhost:3005/api/flights'; //webserver backend
  constructor(
    private http: HttpClient,
    private httpServices: HttpService
  ) { }


  //prende mail e pssw li unisce con : e le codifica in base64
  searchFlights( flightNumber: string, from: string, to: string, initialDate: Date, finalDate?: Date, company?: string, active?: boolean): Observable<ServerResponse> {
    console.log('flightNumber' + flightNumber , 'from' + from, 'to' + to, 'initialDate' + initialDate, 'finalDate' + finalDate, 'company' + company );

      let parameters= new HttpParams();
      parameters = parameters.set('flightNumber', flightNumber);
      
      if(company) 
        parameters = parameters.set('company', company);
      if(finalDate)
        parameters = parameters.set('finalDate',finalDate.toISOString());
      if(active)
        parameters = parameters.set('active', active.toString());
      
      parameters = parameters
        .set('from', from)
        .set('to', to)
        .set('initialDate', initialDate.toISOString())
    
    return this.http.get<ServerResponse>(this.url + '/', { params: parameters });
  }


  //per solo refreshInterval
  searchFlightsID( flightNumber: string): Observable<ServerResponse> {
    console.log('flightNumber' + flightNumber ); 

    let parameters= new HttpParams();
    parameters = parameters.set('flightNumber', flightNumber);

    return this.http.get<ServerResponse>(this.url + '/', { params: parameters });
  }


  /*
   flightNumber: "BAU100",
            company: airlineBau._id,
            prices: { economy: 50, business: 150, firstclass: 300, extras: { baggage: 30, legroom: 15, priorityBoarding: 10 } },
            departureTime: getTomorrowTime(8, 0), // Domani 08:00
            arrivalTime: getTomorrowTime(9, 30),  // Domani 09:30
            airplane: airplane._id,
            route: routeLinFco._id,
            bookedSeats: []
  */
  


  createFlight(flightNumber: string, departureTime: Date, arrivalTime: Date, airplaneId: string, from: string, to: string, prices: FlightPrices): Observable<newFlightResponse> {

    const company = this.httpServices.get_company(); 
    const token = this.httpServices.get_token();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<newFlightResponse>( 
      this.url + '/',  
      { 
        flightNumber: flightNumber,
        company: company,
        prices: prices,
        departureTime: departureTime, 
        arrivalTime: arrivalTime,  
        airplane: airplaneId,
        from: from,
        to: to
        //bookedSeats: [] automatic
      },
      {headers: headers }
    );  
  }

  deleteFlight(flightId: string): Observable<ServerResponse> {
    const token = this.httpServices.get_token();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<ServerResponse>(
      this.url + '/'+ flightId, //url con id rotta 
      {headers: headers} 
    );
  }


}