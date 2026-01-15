// src/app/app.component.ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
// Importaciones de Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { GastoListComponent } from './components/gasto-list/gasto-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'frontend';

  @ViewChild(GastoListComponent) gastoListComponent!: GastoListComponent;

  onImportComplete(): void {
    this.gastoListComponent.cargarGastos();
  }

  onGastoCreado(): void {
    this.gastoListComponent.cargarGastos();
  }
}