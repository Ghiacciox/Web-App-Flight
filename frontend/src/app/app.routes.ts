import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { Registration } from './pages/registration/registration';


//qua ho tutte le rotte posso navigare in base 

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, //home
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: Registration },
];
