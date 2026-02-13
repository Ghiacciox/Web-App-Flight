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
  _id?: string;
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

export interface UsersResponse {
  error: boolean;
  errormessage: string;
  users: User[]; 
}

@Injectable(
  {providedIn: 'root'}
) 
export class HttpService {

  private token: string = '';
  private readonly url = 'http://localhost:3005/api/auth'; //webserver backend

  constructor( private http: HttpClient ) {
    //appena parte necessita di un client che è importato da node
    console.log('User service instantiated');
    
    const loadedtoken = localStorage.getItem('postmessages_token');
    // il local storage è una porzione di memoria di ogni pagina noi ci salviamo il token
    //se lo troviamo non lo chiediamo al serverr :))
    if ( !loadedtoken || loadedtoken.length < 1 ) {
      console.log("No token found in local storage");
      this.token = ""
    }else {
      // 2. Se c'è un token, controlliamo se è SCADUTO
      if (this.isTokenExpired(loadedtoken)) {
        console.log("Token scaduto trovato nel localStorage. Logout automatico.");
        this.logout(); // Pulisce tutto
      } else {
        this.token = loadedtoken as string;
        console.log("JWT loaded from local storage.")
      }
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token) as any;
      const currentTime = Date.now() / 1000; 
      // Tempo attuale in SECONDI
      // Se la scadenza (exp) è minore del tempo attuale, è scaduto
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
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
    //angular passa già user converito in json
    const options = {
      headers: new HttpHeaders({
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    return this.http.post( this.url + '/register', user, options );
  }

  /*
  name?: string;
  surname?: string;
  birthdate?: Date | string;
  phonenumber?: string;
  paymentAddress?: string;

  // Campi obbligatori se role === 'airline'
  company?: string;
  */

  get_token() {
    return this.token;
  }

  private getDecodedToken(): any {
  if (!this.token) return null;
  try {
   const decoded = jwtDecode(this.token);
    //console.log("Contenuto del Token decodificato:", decoded); // <--- AGGIUNGI QUESTO
    return decoded;
  } catch (error) {
    console.error("Token non valido", error);
    return null;
  }
}
  
  get_email() : string {
    return (this.getDecodedToken() as TokenData).email;
  }

  get_id() {
    return (this.getDecodedToken() as TokenData).id;
  }


  get_name() : string {
    return (this.getDecodedToken() as any)?.name || 'Utente';
  }

  get_surname() {
    return (this.getDecodedToken() as any)?.surname || 'Cognome';
  }

  get_birthdate(): Date | null {
    return (this.getDecodedToken() as any)?.birthdate || null;
  }

  get_phonenumber() : string {
    return (this.getDecodedToken() as any)?.phonenumber || 'Numero di telefono non disponibile';
  }

  get_paymentAddress() : string {
    return (this.getDecodedToken() as any)?.paymentAddress || 'Indirizzo di pagamento non disponibile';
  }

  get_company() : string {
    return (this.getDecodedToken() as any)?.company || 'Nome Azienda non disponibile';
  }

  get_role() {
    return (this.getDecodedToken() as TokenData).role;
  }

  //admin' | 'passenger' | 'airline'

  isAuthenticated(): boolean {
    if (!this.token) 
      return false;
    return !this.isTokenExpired(this.token);
  }


  is_admin(): boolean {
    if (!this.token) return false;
    const roles = this.get_role();
    if ( roles === 'admin' ) 
      return true;
    return false;
}

  is_passenger(): boolean {
    if (!this.token) return false;
    const roles = this.get_role();
    if ( roles === 'passenger' ) 
      return true;
    return false;
  }

  is_airline(): boolean {
    if (!this.token) return false;
    const roles = this.get_role();
    if ( roles === 'airline' )
        return true;
    return false;
  }

  get_users(email : string): Observable<UsersResponse> {
      const token = this.get_token();

      if(this.get_role() !== 'admin') { 
        console.log("Accesso negato: solo gli admin possono accedere alla lista degli utenti.");
        return throwError(() => new Error("Accesso negato: solo gli admin possono accedere alla lista degli utenti."));
      }
   
       let parameters= new HttpParams();
       parameters = parameters
           .set('email', email);
       console.log(`Cerco utenti con email ${email} con token ${token}`);
   
       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
   
       return this.http.get<UsersResponse>(this.url + '/users', { params: parameters,headers: headers });
  }
  

  delete_user(userId: string): Observable<UsersResponse> {
    const token = this.get_token();

    if(this.get_role() !== 'admin') { 
      console.log("Accesso negato: solo gli admin possono eliminare utenti.");
      return throwError(() => new Error("Accesso negato: solo gli admin possono eliminare utenti."));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<UsersResponse>(
      this.url + '/users/' + userId,
      { headers: headers }
    );
  }
  
  change_user_data( infos : any): Observable<any> {
    const token = this.get_token();

    if(this.get_role() !== 'admin' && this.get_id() !== infos.id) { 
      console.log("Accesso negato: solo gli admin o l'utente stesso possono modificare i dati.");
      return throwError(() => new Error("Accesso negato: solo gli admin o l'utente stesso possono modificare i dati."));
    }   
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.patch<UsersResponse>(
      this.url + '/changeData',
      infos,
      { headers: headers });
  }

  refresh_token(newToken: string): void {
    this.token = newToken;
    localStorage.setItem('postmessages_token', this.token);
  }   

}
