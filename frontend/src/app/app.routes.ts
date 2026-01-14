import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';


//qua ho tutte le rotte posso navigare in base 

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, //home
    { path: 'login', component: LoginComponent },
];
