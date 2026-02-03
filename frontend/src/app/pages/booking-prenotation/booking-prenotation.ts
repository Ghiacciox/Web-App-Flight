import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute} from '@angular/router';
import { HttpService } from '../../services/http.service';
import { BookingService, Booking } from '../../services/booking.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-booking-prenotation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [],
  templateUrl: './booking-prenotation.html',
  styleUrl: './booking-prenotation.css',
})

export class BookingPrenotationComponent implements OnInit {
  
  MyTitles$ = new BehaviorSubject<any[]>([]);
  //stesso discorso di flightsearch per prendere i parametri e fare la chiamata al service

    constructor(
    private router: Router,
    public http: HttpService, //publico che ci servono i metodi
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private bookingSerice: BookingService
  ) {}
  
  ngOnInit(): void {
     const userId = this.http.get_id();
     this.bookingSerice.getPrenotations(userId).subscribe({
      next: (response) => {
        console.log('Risposta dal server:', response);
        const data = Array.isArray(response) ? response : (response.result || []);
        this.MyTitles$.next(data);
        console.log('Prenotazioni ricevute:', this.MyTitles$.value);
      },
      error: (error) => {
        console.error('Errore nel recupero delle prenotazioni:', error);
        alert('Errore nel recupero delle prenotazioni. Riprova più tardi.');
      }
    });
  }
  
  
  goToDetail(prenotation: Booking): void {
    this.bookingSerice.setSelectedBooking(prenotation);
    this.router.navigate(['/bookingDetail']);
  }

  
  
}
