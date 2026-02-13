import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

export interface FlightStat {
  flightNumber: string;
  totalPassengers: number;
  totalRevenue: number;
  numberOfFlights: number;
  averagePassengersPerFlight: number;
}

export interface RouteStat {
  routeId: string;
  departureCode: string;
  arrivalCode: string;
  departureCity: string;
  arrivalCity: string;
  totalPassengers: number;
  totalRevenue: number;
}

export interface StatisticsResponse {
  error: boolean;
  errormessage: string;
  totalPassengers: number;
  totalRevenue: number;
  flightStats: FlightStat[];
  routeStats: RouteStat[];
}

@Injectable({
  providedIn: 'root',
})
export class AirlineStatService {

  private readonly url = 'http://localhost:3005/api/flights';

  constructor(
    private http: HttpClient,
    private httpServices: HttpService) {}

  getAirlineStatistics( dateFrom?: string, dateTo?: string, email?: string): Observable<StatisticsResponse> {
    
    const token = this.httpServices.get_token();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    let params = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }
    if (email) { //solo da dare per admin!!!!
      params = params.set('email', email);
    }

    return this.http.get<StatisticsResponse>(this.url + '/statistics', { 
      headers: headers,
      params: params 
    });
  }
}
