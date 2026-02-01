import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute} from '@angular/router';
import { HttpService } from '../../services/http.service';
import { BookingService, Booking } from '../../services/booking.service';

@Component({
  selector: 'app-booking-prenotation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [ HttpService, BookingService ],
  templateUrl: './booking-prenotation.html',
  styleUrl: './booking-prenotation.css',
})

export class BookingPrenotationComponent implements OnInit {
  
  mytitles: Booking[] = [];

    constructor(
    private router: Router,
    private http: HttpService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private bookingSerice: BookingService
  ) {}
  
  ngOnInit(): void {
     const userId = this.http.get_id();
     this.bookingSerice.getPrenotations(userId).subscribe({
      next: (response) => {
        this.mytitles = response.result ? response.result : []; // se c'è un risultato, altrimenti array vuoto
        console.log('Prenotazioni ricevute:', this.mytitles);
      },
      error: (error) => {
        console.error('Errore nel recupero delle prenotazioni:', error);
        alert('Errore nel recupero delle prenotazioni. Riprova più tardi.');
      }
    });
  }
  
  
goToDetail(bookingId: string): void {
  this.router.navigate(['/booking-detail', bookingId]);
}
  
}
