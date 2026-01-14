import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Import necessario

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Rimuovi LoginComponent, aggiungi RouterOutlet
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'frontend';
}