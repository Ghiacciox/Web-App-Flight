import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // <--- ORA IMPORTA CORRETTAMENTE "AppComponent"

import './styles.css'; // Carica Tailwind

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));