import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute} from '@angular/router';
import { HttpService } from '../../services/http.service';
import { BookingService, Booking } from '../../services/booking.service';


@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
})

export class BookingDetailComponent implements OnInit {
  
  MyTitle: Booking | null = null;
  //stesso discorso di flightsearch per prendere i parametri e fare la chiamata al service

    constructor(
    private router: Router,
    public http: HttpService, //publico che ci servono i metodi
    private route: ActivatedRoute,
    public bookingService: BookingService
  ) {}
  
  ngOnInit(): void {
      this.MyTitle = this.bookingService.selectedBookingSource;
      console.log('Dettagli prenotazione:', this.MyTitle);
  }
  
}
