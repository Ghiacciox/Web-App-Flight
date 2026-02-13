import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // Non dimenticare l'import!
import { Airport} from './search.service';
import { HttpService } from './http.service';


interface airportServerResponse {
  airports: Airport[];
  response:string;
}

@Injectable({
  providedIn: 'root',
})
export class AirportsService {

  private readonly apiUrl = 'http://localhost:3005/api/airports';

  // Il costruttore serve SOLO per iniettare le dipendenze (come HttpClient)
  constructor(
    private http: HttpClient,
    private httpServices: HttpService) { }

/*
// ritorno aereo protetto popolo il jwt
  router.post('/',checkJwt, airportController.createAirport); 

  //cerco con get aerei metodo pubblico
  router.get('/', airportController.getAirports)
*/

  getAirports(code?: string, name?: string, city?: string, country?: string) {

    const token = this.httpServices.get_token();

    let parameters= new HttpParams();

    if (code) 
      parameters = parameters.set('code', code);
    if (name) 
      parameters = parameters.set('name', name);
    if (city) 
      parameters = parameters.set('city', city);
    if (country) 
      parameters = parameters.set('country', country);

    console.log(`Cerco aeroporti con code ${code} nome ${name} in ${city}, ${country}`);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<airportServerResponse>(
      this.apiUrl + '/', 
      { params: parameters,
        headers: headers });  
  }

  //pre creare rotta due codici Aeroporto validi
  //solo per Admin
  createAirport(code: string, name: string, city: string, country: string) {
    const token = this.httpServices.get_token();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<AirportsService>( //da controllare per admin!!
      this.apiUrl + '/',  
      { 
        code: code, 
        name: name,
        city: city,
        country: country
      },
      {headers: headers }
    );  
  }


}



