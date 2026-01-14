import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';


//qua ho tutte le rotte dell'app

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, //home
    { path: 'login', component: LoginComponent },
];
