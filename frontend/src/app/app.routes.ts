import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegistrationComponent } from './pages/registration/registration';
import { HomeComponent } from './pages/home/home';
import { FlightsearchComponent } from './pages/flightsearch/flightsearch';
import { BookingCreationComponent } from './pages/booking-creation/booking-creation';
import { BookingPrenotationComponent } from './pages/booking-prenotation/booking-prenotation';
import { BookingDetailComponent } from './pages/booking-detail/booking-detail';
import { AirlineRoutesComponent } from './pages/airline-routes/airline-routes'; 
import { AirlineAirplanesComponent } from './pages/airline-airplanes/airline-airplanes';
import { AirlineFlightComponent } from './pages/airline-flight/airline-flight';
import { AirlineManageFlightComponent } from './pages/airline-manage-flight/airline-manage-flight';
import { AdminCreateAirportsComponent } from './pages/admin-create-airports/admin-create-airports';
import { AdminAddUserComponent } from './pages/admin-add-user/admin-add-user';
import { ProfileComponent } from './pages/profile/profile';
import { AirlineStatComponent } from './pages/airline-stat/airline-stat';
//protezione accessi
import { PathGuardGuardUser,PathGuardGuardAdmin,PathGuardGuardAirline } from './path-guard-guard';



//qua ho tutte le rotte posso navigare in base 

export const routes: Routes = [
    //liberi
    { path: '', redirectTo: 'home', pathMatch: 'full' }, //home
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent },


    //users (tutti loggati)
    { path: 'home', component: HomeComponent ,canActivate: [PathGuardGuardUser]},
    { path: 'results', component: FlightsearchComponent, canActivate: [PathGuardGuardUser] },
    { path: 'bookingCreation', component: BookingCreationComponent, canActivate: [PathGuardGuardUser] },
    { path: 'bookingPrenotation', component: BookingPrenotationComponent, canActivate: [PathGuardGuardUser] },
    { path: 'bookingDetail', component: BookingDetailComponent, canActivate: [PathGuardGuardUser] },
    { path: 'profile', component: ProfileComponent, canActivate: [PathGuardGuardUser] },

    //airline & admin
    { path: 'airline-Routes', component: AirlineRoutesComponent, canActivate: [PathGuardGuardAirline] },
    { path: 'airline-Airplanes', component: AirlineAirplanesComponent, canActivate: [PathGuardGuardAirline] },
    { path: 'airline-Flight', component: AirlineFlightComponent, canActivate: [PathGuardGuardAirline] },
    { path: 'airline-Manage', component: AirlineManageFlightComponent, canActivate: [PathGuardGuardAirline] },
    { path: 'airline-stat', component: AirlineStatComponent, canActivate: [PathGuardGuardAirline] },  

    //solo admin
    { path: 'admin-create-airports', component: AdminCreateAirportsComponent, canActivate: [PathGuardGuardAdmin] },
    { path: 'admin-add-user', component: AdminAddUserComponent, canActivate: [PathGuardGuardAdmin] },    
  
];
