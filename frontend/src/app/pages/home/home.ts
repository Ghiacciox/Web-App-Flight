import { Component } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [SearchService, HttpService, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})  

export class HomeComponent {
  
  searchForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpService, private router: Router) {
    this.searchForm = this.fb.group({
      flightNumber: [''],
      from: ['', Validators.required],
      to: ['', Validators.required],
      initialDate: ['', Validators.required],
      finalDate: [''],
      company: ['']
    });
  }

  get isLoggedIn(): boolean {
    return this.http.isAuthenticated(); 
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.router.navigate(['/results'], { 
      queryParams: {
        from: this.searchForm.value.from,
        to: this.searchForm.value.to,
        initialDate: this.searchForm.value.initialDate, 
        finalDate: this.searchForm.value.finalDate,
        company: this.searchForm.value.company,
        flightNumber: this.searchForm.value.flightNumber
      }});
    }else{
      this.searchForm.markAllAsTouched();
      alert('Compila bene i campi!');
    }
  }
}