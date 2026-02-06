import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // Non dimenticare l'import!
import { Airplane, Seats } from './search.service';
import { HttpService } from './http.service';

export interface AirplaneServerResponse {
    message: string;
    airplanes: Airplane[];
}

@Injectable({
  providedIn: 'root',
})
export class AirlineAirplaneService {

  private readonly apiUrl = 'http://localhost:3005/api/airplanes';

  // Il costruttore serve SOLO per iniettare le dipendenze (come HttpClient)
  constructor(
    private http: HttpClient,
    private httpServices: HttpService) { }


  getAirplanes(airplaneModel : string) {

    const token = this.httpServices.get_token();

    let parameters= new HttpParams();
    parameters = parameters
        .set('airplaneModel', airplaneModel);
    console.log(`Cerco aerei modello ${airplaneModel} con token ${token}`);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<AirplaneServerResponse>(
      this.apiUrl + '/', 
      { params: parameters,
        headers: headers });  
  }

  //pre creare rotta due codici Aeroporto validi
  createAirplane(airplaneModel : String , economy: Seats, business: Seats, firstClass: Seats) {
    const token = this.httpServices.get_token();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<AirplaneServerResponse>(
      this.apiUrl + '/', 
      { 
        airplaneModel: airplaneModel,
        capacity : {
          economy : economy,
          business : business,
          firstclass : firstClass
        }
      },
      {headers: headers }
    );  
  }

  deleteAirplane(airplaneId: string) {
   const token = this.httpServices.get_token();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<AirplaneServerResponse>(
      this.apiUrl + '/'+ airplaneId, //url con id rotta 
      {headers: headers} 
    );
  }
  
}


