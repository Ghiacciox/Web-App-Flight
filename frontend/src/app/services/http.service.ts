import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

//dati nascosti dentro il nostro token
//da capire se sono uguali al nostro
interface TokenData {
  email: string;
  role: string; //'admin' | 'passenger' | 'airline'
  id: string;
  exp: number;  // Scadenza standard del JWT
  iat: number;
}

//token restituito dal server
interface ReceivedToken {
  error: boolean;
  errormessage: string;
  token: string
}

//dati per registrare il nuovo utente
export interface User { 
  email: string;
  password?: string; // Opzionale perché non lo salviamo nel frontend dopo l'invio
  role: 'passenger' | 'airline' | 'admin';
  
  // Campi obbligatori se role === 'passenger'
  name?: string;
  surname?: string;
  birthdate?: Date | string;
  phonenumber?: string;
  paymentAddress?: string;

  // Campi obbligatori se role === 'airline'
  company?: string;
};

@Injectable() //può essere injectata in altri componenti
export class HttpService {

  private token: string = '';
  public url = 'http://localhost:3000/api/auth'; //webserver backend

  constructor( private http: HttpClient ) {
    //appena parte necessita di un client che è importato da node
    console.log('User service instantiated');
    
    const loadedtoken = localStorage.getItem('postmessages_token');
    // il local storage è una porzione di memoria di ogni pagina noi ci salviamo il token
    //se lo troviamo non lo chiediamo al serverr :))

    if ( !loadedtoken || loadedtoken.length < 1 ) {
      console.log("No token found in local storage");
      this.token = ""
    } else {
      this.token = loadedtoken as string;
      console.log("JWT loaded from local storage.")
    }
  }


  //prende mail e pssw li unisce con : e le codifica in base64
  login( mail: string, password: string, remember: boolean ): Observable<ReceivedToken> {

    console.log('Login: ' + mail + ' ' + password);
    const options = {
      //li unisce con : e le codifica in base64
      headers: new HttpHeaders({
        authorization: 'Basic ' + btoa( mail + ':' + password),
        'cache-control': 'no-cache',
        'Content-Type':  'application/x-www-form-urlencoded',
      })
    };


    return this.http.get<ReceivedToken>( this.url + '/login',  options, ).pipe(
      /*
      tap è un operatore di RxJS fondamentale qui. 
      Permette di eseguire delle azioni (side effects)
      senza modificare i dati che verranno passati al componente che ha chiamato il login.
      Cosa fa dentro il tap?
      Prende il token ricevuto dal server.
      Lo salva nella variabile locale this.token.
      Se remember è true: Salva il token nel localStorage del browser (così rimane anche se chiudi il browser).
      */

      tap( (data) => {
        if ( data.error || !data.token ) {
          console.log("Error during login: " + data.errormessage);
          return;
        }

        console.log("Data received when invoking the /login endpoint:")
        console.log(JSON.stringify(data.token));
        this.token = data.token;

        //as specifica il tipo
        if ( remember ) {
          console.log("Saving token to localstorage")
          localStorage.setItem('postmessages_token', this.token);
        } else {
          console.log("Token not saved to local storage.")
        }
      }));
  }


  //tutto in frontend cancello il token dalla variabile
  // e dalla memoria
  logout() {
    console.log('Logging out');
    this.token = '';
    localStorage.setItem('postmessages_token', this.token);
  }

  //ritorna un osservable
  register( user:User ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    return this.http.post( this.url + '/register', user, options );
  }

  get_token() {
    return this.token;
  }
  
  get_email() {
    return (jwtDecode(this.token) as TokenData).email;
  }

  get_id() {
    return (jwtDecode(this.token) as TokenData).id;
  }

  //admin' | 'passenger' | 'airline'

  is_admin(): boolean {
    const roles = (jwtDecode(this.token) as TokenData).role;
    if ( roles === 'admin' ) 
      return true;
    return false;
}

  is_passenger(): boolean {
    const roles = (jwtDecode(this.token) as TokenData).role;
    if ( roles === 'passenger' ) 
      return true;
    return false;
  }

  is_airline(): boolean {
    const roles = (jwtDecode(this.token) as TokenData).role;
    if ( roles === 'airline' )
        return true;
    return false;
  }

}
