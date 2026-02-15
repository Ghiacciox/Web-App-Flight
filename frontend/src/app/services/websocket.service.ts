import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from "socket.io-client";

export interface SeatUpdateEvent {
  flightId: string;
  seat: string;
  class: string;
  available: boolean;
  timestamp: Date;
}

@Injectable()
export class WebsocketService {
  
  private readonly url = 'http://localhost:3005'; //webserver backend
  private seatUpdates = new Subject<SeatUpdateEvent>();
  private socket : Socket;
  

  constructor() { 
    console.log('Socket service in');
    this.socket = io(this.url);
    this.setupListeners();
  }

  private setupListeners() {

    this.socket.on('connect', () => {
      console.log('Connesso al server Socket.io con ID:', this.socket.id);
    });

    // Ascolta gli aggiornamenti dei posti
    this.socket.on('seat-updated', (data: SeatUpdateEvent) => {
      console.log('Aggiornamento posto ricevuto:', data);
      // Spariamo il dato dentro il Subject
      this.seatUpdates.next(data); 
    });

    this.socket.on('error', (err: any) => {
      console.error('Socket error:', err);
    });
  }

  // Metodo per entrare nella stanza del volo
  joinFlight(flightId: string) {
    console.log(`Richiesta di unione al volo: ${flightId}`);
    this.socket.emit('join-flight', flightId);
  }

  // Metodo per uscire dalla stanza
  leaveFlight(flightId: string) {
    console.log(`Uscita dal volo: ${flightId}`);
    this.socket.emit('leave-flight', flightId);
  }

  //I componenti si iscrivono a questo Observable
  getSeatUpdates(): Observable<SeatUpdateEvent> {
    return this.seatUpdates.asObservable();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}