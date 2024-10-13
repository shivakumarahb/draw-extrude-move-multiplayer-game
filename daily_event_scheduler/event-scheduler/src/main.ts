import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';  // Use this instead of HttpClientModule



// Bootstrap the standalone component with the HttpClient
bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]  // Correct way to provide HttpClient in standalone components
}).catch(err => console.error(err));
