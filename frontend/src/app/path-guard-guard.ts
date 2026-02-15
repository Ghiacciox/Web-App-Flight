import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpService } from './services/http.service';

@Injectable({
  providedIn: 'root'
})
export class PathGuardGuardUser implements CanActivate {
  constructor(private http: HttpService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  if (this.http.isAuthenticated()) {
      return true; //permette accesso se è autenticato
    }
    this.router.navigate(['/login']); // reindirizzato alla home se no
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PathGuardGuardAdmin implements CanActivate {
  constructor(private http: HttpService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
   if (this.http.isAuthenticated()&& this.http.is_admin()) {
      return true;
    }
    this.router.navigate(['/login']); 
    return false;
  }
}


@Injectable({
  providedIn: 'root'
})
export class PathGuardGuardAirline implements CanActivate {
  constructor(private http: HttpService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.http.isAuthenticated() && (this.http.is_airline() || this.http.is_admin())) {
      return true; 
    }
    this.router.navigate(['/login']);
    return false;
  }
}