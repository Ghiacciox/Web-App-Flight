import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { FlightStat, RouteStat, AirlineStatService } from '../../services/airline.stat.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-airline-stat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [AirlineStatService],
  templateUrl: './airline-stat.html',
  styleUrl: './airline-stat.css',
})
export class AirlineStatComponent implements OnInit{

  searchForm : FormGroup;

  totalPassengers :number = 0;
  totalMoney :number = 0;

  flightStat : FlightStat[] = [];
  routeStat : RouteStat[] = [];

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private router: Router,
    public http: HttpService,
    private fb: FormBuilder,
    private statisticsService: AirlineStatService,
    private cdr: ChangeDetectorRef
    ){

    this.searchForm = this.fb.group({
      datefrom : [''],
      dateTo :[''],
      email: [''] //solo per admin
    });
  }

  ngOnInit(): void {
    this.loadStat();    
  }

  loadStat(){
    this.errorMessage =null;
    this.successMessage= null;

    const dateF= this.searchForm.value.dateFrom;
    const dateT= this.searchForm.value.dateTo;
    const email= this.searchForm.value.email;

    this.statisticsService.getAirlineStatistics(dateF,dateT,email).subscribe({
      next :(resp) =>{
        if(resp.error){
          this.errorMessage = resp.errormessage;
          this.totalPassengers = 0;
          this.totalMoney = 0;
          this.flightStat = [];
          this.routeStat = [];
        }else{
          this.totalPassengers = resp.totalPassengers;
          this.totalMoney = resp.totalRevenue;
          this.flightStat = resp.flightStats;
          this.routeStat = resp.routeStats;
        }
        this.cdr.detectChanges();
      },
      error: (err) =>{
        this.errorMessage = err.message || 'errore durante le statistiche';
        this.totalPassengers = 0;
        this.totalMoney = 0;
        this.flightStat = [];
        this.routeStat = [];
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(){
    this.loadStat();
  }

}
  
