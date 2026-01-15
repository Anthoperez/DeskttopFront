// src/app/components/report-meta/report-meta.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-meta',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  templateUrl: './report-meta.html',
  styleUrls: ['./report-meta.css'],
})
export class ReportMetaComponent {
  isGenerating = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
  ) {}

  generateReport(): void {
    this.isGenerating = true;

    const timestamp = new Date().toISOString().slice(0,19).replace(/[-T:]/g,'');
    this.apiService.downloadReportByMeta().subscribe({
      next: (blob) => {
        // Lógica para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Global_por_Meta${timestamp}.xlsx`; // Nombre fijo
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        this.isGenerating = false;
        this.showSuccess('¡Reporte por Meta generado y descargado!');
      },
      error: (err) => {
        this.isGenerating = false;
        this.showError('Ocurrió un error al generar el reporte por meta.');
        console.error('Error al descargar:', err);
      },
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }
}