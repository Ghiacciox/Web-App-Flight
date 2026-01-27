import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegistrationComponent } from './pages/registration/registration';
import { HomeComponent } from './pages/home/home';
import { FlightsearchComponent } from './pages/flightsearch/flightsearch';
import { BookingCreationComponent } from './pages/booking-creation/booking-creation';


//qua ho tutte le rotte posso navigare in base 

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, //home
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'home', component: HomeComponent },
    { path: 'results', component: FlightsearchComponent },
    { path: 'bookingCreation', component: BookingCreationComponent }
];
