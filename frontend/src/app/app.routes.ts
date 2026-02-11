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



//qua ho tutte le rotte posso navigare in base 

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, //home
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'home', component: HomeComponent },
    { path: 'results', component: FlightsearchComponent },
    { path: 'bookingCreation', component: BookingCreationComponent },
    { path: 'bookingPrenotation', component: BookingPrenotationComponent },
    { path: 'bookingDetail', component: BookingDetailComponent },
    { path: 'airline-Routes', component: AirlineRoutesComponent },
    { path: 'airline-Airplanes', component: AirlineAirplanesComponent },
    { path: 'airline-Flight', component: AirlineFlightComponent },
    { path: 'airline-Manage', component: AirlineManageFlightComponent},
    { path: 'admin-create-airports', component: AdminCreateAirportsComponent},
    { path: 'admin-add-user', component: AdminAddUserComponent}

];
