import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // Non dimenticare l'import!
import { ServerResponse } from './search.service';
import { HttpService } from './http.service';
import { Route } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AirlineRouteService {

  private readonly apiUrl = 'http://localhost:3005/api/routes';

  // Il costruttore serve SOLO per iniettare le dipendenze (come HttpClient)
  constructor(
    private http: HttpClient,
    private httpServices: HttpService) { }


  getRoutes(from : string, to: string) {

    const token = this.httpServices.get_token();

    let parameters= new HttpParams();
    parameters = parameters
        .set('from', from)
        .set('to', to);
    console.log(`Cerco rotte da ${from} a ${to}`);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Route[]>(
      this.apiUrl + '/', 
      { params: parameters,
        headers: headers });  
  }

  //pre creare rotta due codici Aeroporto validi
  createRoute(departureCode : String , arrivalCode: String) {
    const token = this.httpServices.get_token();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<ServerResponse>(
      this.apiUrl + '/', 
      { 
        departureCode: departureCode, 
        arrivalCode: arrivalCode 
      },
      {headers: headers }
    );  
  }

  deleteRoute(routeId: string) {
   const token = this.httpServices.get_token();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<ServerResponse>(
      this.apiUrl + '/'+ routeId, //url con id rotta 
      {headers: headers} 
    );
  }
  
}


