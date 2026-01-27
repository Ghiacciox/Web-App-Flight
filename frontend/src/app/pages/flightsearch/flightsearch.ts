import { Component, OnInit } from '@angular/core';
import { SearchService, ServerResponse } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute} from '@angular/router';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { Result } from '../../services/search.service';


@Component({
  selector: 'app-flightsearch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [SearchService, HttpService, RouterModule],
  templateUrl: './flightsearch.html',
  styleUrl: './flightsearch.css',
})


/*
//restituito dal server
export interface ServerResponse {
  message: string;
  result: Results[];
}
*/


export class FlightsearchComponent implements OnInit {

  Results$ = new BehaviorSubject<any[]>([]);
  //searchForm: FormGroup;
  //array di voli come in search services

  constructor(
    private router: Router,
    private searchService: SearchService,
    private http: HttpService,
    private fb: FormBuilder,
    private urls: ActivatedRoute,
    private bookingService: BookingService) { 
  }

  ngOnInit(): void { 
    this.urls.queryParams.subscribe(params => {
      const flightNumber = params['flightNumber'] || '';
      const from = params['from'];
      const to = params['to'];
      const company = params['company'] || '';

      const initialDate = new Date(params['initialDate']);
      let finalDate = undefined;
      if(params['finalDate']) {
          finalDate = new Date(params['finalDate']);
      }

      this.searchService.searchFlights(flightNumber, from, to, initialDate , finalDate , company)
        .subscribe((response: ServerResponse) => {
          console.log('Search results:', response);
          this.Results$.next(response.result || []);
          console.log('✅ Lunghezza array Results:', response.result?.length);
        });
    });
  }
    
  get isLoggedIn(): boolean {
    return this.http.isAuthenticated(); 
  }

  getTotalPrice(flights: any[]): number {
    if (!flights) return 0;
    return flights.reduce((acc, f) => acc + (f.prices?.economy || 0), 0);
  }

  onSubmit(chosenFlight: Result) {
    this.bookingService.setSelectedFlight(chosenFlight);
    this.router.navigate(['/bookingCreation']);
  }
}


