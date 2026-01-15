// src/app/components/report-generator/report-generator.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// ▼▼▼ AÑADIR ESTAS IMPORTACIONES ▼▼▼
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportMetadataDialogComponent } from '../report-metadata-dialog/report-metadata-dialog';
import { ApiService, ReportMetadata } from '../../services/api'; // Importa ApiService y la nueva interfaz
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

// Importaciones de Angular Material (existentes)
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    MatButtonToggleModule,
  ],
  templateUrl: './report-generator.html',
  styleUrls: ['./report-generator.css'],
})
export class ReportGeneratorComponent implements OnInit {
  // --- PROPIEDADES MODIFICADAS ---
  contratoProjects: string[] = []; // Lista para Contratos
  picProjects: string[] = []; // NUEVA: Lista para PICs

  selectedContratoProject: string = ''; // Específico para Contrato
  selectedPicProject: string = ''; // NUEVO: Específico para PIC

  isLoadingContratos = false; // Específico
  isLoadingPics = false; // NUEVO
  isGenerating = false;

  // NUEVAS PROPIEDADES
  allProjects: string[] = []; // Lista de TODOS los proyectos
  selectedSimpleProject: string = '';
  selectedMonth: string | null = null;

  meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ];
  // Tipo de reporte ahora tiene 3 estados
  reportType: 'contrato' | 'pic' | 'meta' | 'project-simple' = 'contrato';
  // --- FIN DE PROPIEDADES MODIFICADAS ---

  // ▼▼▼ AÑADIR ESTA PROPIEDAD ▼▼▼
  modalidadesPIC: string[] = [
    'V CONVOCATORIA - 2021 MODALIDAD 1: PROYECTOS DE INVESTIGACIÓN BÁSICA Y APLICADA',
    'V CONVOCATORIA - 2021 MODALIDAD 2: PROYECTOS DE INVESTIGACIÓN DE TESIS DE PREGRADO',
    'V CONVOCATORIA - 2021 MODALIDAD 3: PROYECTOS DE INVESTIGACIÓN DE TESIS DE POSGRADO',
    'V CONVOCATORIA - 2021 MODALIDAD 4: PROYECTOS DE PUBLICACIONES',
    'V CONVOCATORIA - 2021 MODALIDAD MODALIDAD 4-II: PROYECTOS DE INVESTIGACIÓN PUBLICACIONES (LIBROS)',
    'VI CONVOCATORIA - 2022 MODALIDAD 1: PROYECTOS DE INVESTIGACIÓN APLICADA',
    'VI CONVOCATORIA - 2022 MODALIDAD 2: CATEGORIAS CONSOLIDADO Y POR CONSOLIDAR',
    'VI CONVOCATORIA - 2022 MODALIDAD 2: CATEGORIA EMERGENTE',
    'VI CONVOCATORIA - 2022 MODALIDAD: PROYECTOS EMBLEMATICO',
    'VII CONVOCATORIA - 2023 MODALIDAD: 01 - PROY. INVESTIGACION CIENTIFICA',
    'VII CONVOCATORIA - 2023 MODALIDAD: 02 - EN CIENCIAS SOCIALES',
    'VII CONVOCATORIA - 2023 MODALIDAD: 03 - PROY. INVESTIGACION EMBLEMATICA',
    'VIII CONVOCATORIA - 2024 MODALIDAD: 01 - PROY. INVESTIGACION CIENTIFICA',
    'VIII CONVOCATORIA - 2024 MODALIDAD: 02 - PROY. INVESTIGACION CIENTIFICA',
    'VIII CONVOCATORIA - 2024 MODALIDAD: 03 - PROY. INVESTIGACION CIENTIFICA',
    // ... (Puedes añadir el resto de modalidades de 2023 y 2024 aquí) ...
  ];
  // ▲▲▲ FIN DE LA PROPIEDAD ▲▲▲

  // ▼▼▼ INYECTAR 'MatDialog' ▼▼▼
  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // <-- AÑADIR ESTO
  ) {}
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  ngOnInit(): void {
    // Cargamos ambas listas de proyectos al iniciar
    this.loadContratoProjects();
    //this.loadPicProjects();
    this.loadAllProjects();
  }

  /**
   * NUEVO: Carga todos los proyectos (para el reporte simple)
   */
  loadAllProjects(): void {
    this.apiService.getProjects().subscribe({
      next: (data) => {
        this.allProjects = data;
      },
      error: () => {
        this.showError('No se pudo cargar la lista de proyectos.');
      },
    });
  }

  /**
   * NUEVO: Genera el reporte simple del proyecto
   */
  generateSimpleProjectReport(): void {
    if (!this.selectedSimpleProject) {
      this.showError('Por favor, selecciona un proyecto.');
      return;
    }

    this.isGenerating = true;

    if (this.selectedMonth) {
      // Reporte de un mes específico
      this.apiService
        .downloadProjectMonthReport(this.selectedSimpleProject, this.selectedMonth)
        .subscribe({
          next: (blob) => {
            this.downloadFile(
              blob,
              `Reporte_${this.selectedSimpleProject.replace(/[^a-z0-9]/gi, '_')}_${this.selectedMonth}.xlsx`,
            );
            this.isGenerating = false;
          },
          error: (err) => {
            this.isGenerating = false;
            this.showError('Ocurrió un error al generar el reporte mensual.');
            console.error('Error al descargar:', err);
          },
        });
    } else {
      // Reporte anual (todos los meses)
      this.apiService
        .downloadProjectAnnualReport(this.selectedSimpleProject)
        .subscribe({
          next: (blob) => {
            this.downloadFile(
              blob,
              `Reporte_Anual_${this.selectedSimpleProject.replace(/[^a-z0-9]/gi, '_')}.xlsx`,
            );
            this.isGenerating = false;
          },
          error: (err) => {
            this.isGenerating = false;
            this.showError('Ocurrió un error al generar el reporte anual.');
            console.error('Error al descargar:', err);
          },
        });
    }
  }
  // --- MÉTODOS DE CARGA SEPARADOS ---
  loadContratoProjects(): void {
    this.isLoadingContratos = true;
    this.apiService.getContratoProjects().subscribe({
      next: (data) => {
        this.contratoProjects = data;
        this.isLoadingContratos = false;
      },
      error: () => {
        this.isLoadingContratos = false;
        this.showError('No se pudo cargar la lista de Contratos.');
      },
    });
  }

  loadPicProjects(): void {
    // this.isLoadingPics = true;
    // this.apiService.getPicProjects().subscribe({
    //   next: (data) => {
    //     this.picProjects = data;
    //     this.isLoadingPics = false;
    //   },
    //   error: () => {
    //     this.isLoadingPics = false;
    //     this.showError('No se pudo cargar la lista de Proyectos PIC.');
    //   }
    // });
    this.isLoadingPics = false; // Simplemente detenemos la carga
  }
  // --- FIN DE MÉTODOS DE CARGA ---

  private getTimestamp(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hour}${minute}`; // Ej: 20250106_1430
  }

  /**
   * Genera el reporte para CONTRATO
   */
  generateContratoReport(): void {
    if (!this.selectedContratoProject) {
      this.showError('Por favor, selecciona un proyecto de Contrato.');
      return;
    }

    const dialogRef = this.dialog.open(ReportMetadataDialogComponent, {
      width: '600px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((metadata: ReportMetadata | undefined) => {
      if (metadata === undefined) {
        return; // Usuario canceló
      }

      this.isGenerating = true;
      // Llama al endpoint específico de CONTRATO
      this.apiService.downloadContratoReport(this.selectedContratoProject, metadata).subscribe({
        next: (blob) => {
          const safeName = this.selectedContratoProject.replace(/[^a-z0-9]/gi, '_');
          const timestamp = this.getTimestamp(); // Hora actual
          // ✅ Usar el método downloadFile que solo dispara UNA descarga
          this.downloadFile(
            blob,
            `Reporte_Contrato_${safeName}_${timestamp}.xlsx`
          );
          this.isGenerating = false;
        },
        error: (err) => {
          this.isGenerating = false;
          this.showError('Ocurrió un error al generar el reporte de Contrato.');
          console.error('Error al descargar:', err);
        },
      });
    });
  }

  /**
   * NUEVO: Genera el reporte para PIC
   */
  generatePicReport(): void {
    if (!this.selectedPicProject) {
      this.showError('Por favor, selecciona un proyecto PIC.');
      return;
    }

    this.isGenerating = true;
    const modalityName = this.selectedPicProject;

    // Llama al endpoint de PIC (que ahora espera una modalidad, no metadata)
    this.apiService.downloadPicReport(modalityName).subscribe({
      next: (blob) => {
        const safeName = modalityName.replace(/[^a-z0-9]/gi, '_');
        const timestamp = this.getTimestamp();
        this.downloadFile(blob, `Reporte_PIC_${safeName}_${timestamp}.xlsx`);
        this.isGenerating = false;
      },
      error: (err) => {
        this.isGenerating = false;
        this.showError('Ocurrió un error al generar el reporte PIC.');
        console.error('Error al descargar:', err);
      },
    });
  }

  /**
   * (Sin cambios)
   * Genera el reporte global agrupado por Meta
   */
  generateMetaReport(): void {
    this.isGenerating = true;
    this.apiService.downloadReportByMeta().subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'Reporte_Global_por_Meta.xlsx');
        this.isGenerating = false;
      },
      error: (err) => {
        this.isGenerating = false;
        this.showError('Ocurrió un error al generar el reporte por meta.');
        console.error('Error al descargar:', err);
      },
    });
  }
  // --- FIN DE MÉTODOS DE GENERACIÓN ---

  // --- Helpers (sin cambios) ---
  private downloadFile(blob: Blob, fileName: string): void {
    console.log('Iniciando descarga:', fileName);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    // Agregar al DOM temporalmente
    document.body.appendChild(link);

    // Ejecutar descarga
    link.click();

    // Limpiar inmediatamente (no esperar)
    document.body.removeChild(link);

    // Revocar el objeto URL después de un pequeño delay para asegurar que se procesó
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      console.log('Descarga completada y recursos liberados');
    }, 100);

    this.showSuccess('¡Reporte generado y descargado!');
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }
}