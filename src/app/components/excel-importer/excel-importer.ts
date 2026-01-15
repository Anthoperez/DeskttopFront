import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ApiService, Gasto } from '../../services/api';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // <-- AÑADIR
// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-excel-importer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  templateUrl: './excel-importer.html',
  styleUrls: ['./excel-importer.css'],
})
export class ExcelImporterComponent {
  @Output() importComplete = new EventEmitter<void>();
  fileName: string = '';
  processing = false;
  processedData: Partial<Gasto>[] = [];

  private workbook: XLSX.WorkBook | null = null;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router // <-- INYECTAR ROUTER
  ) {}

  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>event.target;
    if (!target.files || target.files.length !== 1) {
      if (target) (target as any).value = null;
      return;
    }
    const file = target.files[0];
    this.processedData = [];
    this.workbook = null;
    this.fileName = file.name;
    this.processing = true;
    this.cdr.detectChanges();
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data: ArrayBuffer = e.target.result;
        this.workbook = XLSX.read(data, { type: 'array', cellDates: false });
        this.processAllSheets();
      } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        this.showError('El archivo parece estar dañado o no es un formato de Excel válido.');
        this.resetFileState();
      } finally {
        this.processing = false;
        this.cdr.detectChanges();
      }
    };
    reader.onerror = (error) => {
      console.error('Error en FileReader:', error);
      this.showError('Ocurrió un error fundamental al intentar leer el archivo.');
      this.resetFileState();
    };
    reader.readAsArrayBuffer(file);
  }

  private processAllSheets(): void {
    if (!this.workbook) return;
    let allGastos: Partial<Gasto>[] = [];
    for (const sheetName of this.workbook.SheetNames) {
      const ws: XLSX.WorkSheet = this.workbook.Sheets[sheetName];
      // ▼▼▼ MODIFICACIÓN AQUÍ ▼▼▼
      const rawData: any[][] = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
        defval: null,
      });
      // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

      const gastosDeLaHoja = this.parseSheetData(rawData);
      allGastos = allGastos.concat(gastosDeLaHoja);
    }
    this.processedData = allGastos;
    if (this.processedData.length === 0) {
      this.showError(`El archivo "${this.fileName}" no contiene filas de gastos válidas.`);
    }
  }

  private parseExcelDate(value: any, fieldName: keyof Gasto): Date | null {
    if (value === null || value === undefined || String(value).trim() === '') {
      return null;
    }

    if (typeof value === 'number') {
      // ✅ CORRECCIÓN: Se añade la hora 12 para evitar el desfase de zona horaria.
      const date = new Date(Date.UTC(1900, 0, value - 1, 12));
      return !isNaN(date.getTime()) ? date : null;
    }

    if (typeof value === 'string') {
      const cleanValue = value.trim();
      
      // Soportar separadores / o -
      let separator = '/';
      if (cleanValue.includes('-')) separator = '-';
      
      const parts = cleanValue.split(separator);
      if (parts.length !== 3) return null;

      let partA = parseInt(parts[0], 10); // Puede ser Día o Mes
      let partB = parseInt(parts[1], 10); // Puede ser Mes o Día
      let year = parseInt(parts[2], 10);

      if (year < 100) year += 2000;

      let day: number, month: number;

      // --- LÓGICA DE DETECCIÓN INTELIGENTE ---
      // Si el segundo número es mayor a 12, ¡definitivamente es el DÍA! (Formato MM/DD/YYYY)
      // Ejemplo: 4/19/2025 -> 19 no puede ser mes. Entonces 19 es día, 4 es mes.
      if (partB > 12) {
        month = partA;
        day = partB;
      } else {
        // En caso contrario, asumimos el estándar Perú (DD/MM/YYYY)
        // Ejemplo: 25/02/2025 -> 25 es día, 02 es mes.
        day = partA;
        month = partB;
      }

      // Validaciones finales de seguridad
      if (
        isNaN(day) || isNaN(month) || isNaN(year) ||
        month < 1 || month > 12 ||
        day < 1 || day > 31
      ) {
        return null;
      }

      // Crear fecha UTC a las 12:00 del mediodía para evitar problemas de zona horaria
      const date = new Date(Date.UTC(year, month - 1, day, 12));
      return !isNaN(date.getTime()) ? date : null;
    }

    return null;
  }

  private parseSheetData(rawData: any[][]): Partial<Gasto>[] {
    const gastos: Partial<Gasto>[] = [];
    let currentHeaders: string[] | null = null;
    const columnMap: { [key: string]: keyof Gasto | null } = {
      DOC: 'tipoDocumento',
      'N°': 'numeroDocumento',
      SIAF: 'siaf',
      'A NOMBRE DE': 'aNombreDe',
      CONCEPTO: 'concepto',
      MONTO: 'monto',
      ESPECIFICA: 'especifica',
      MONTO2: 'monto2',
      'FF.': 'ff',
      MES: 'mes',
      'FECHA DEVENGADO SIAF': 'fechaDevengado',
      PROYECTO: 'proyecto',
      META: 'meta',
      'CERTIFICACION VIATICO': 'certificacionViatico',
      DESTINO: 'destino',
      'FECHA SALIDA': 'fechaSalida',
      'FECHA RETORNO': 'fechaRetorno',
    };

    for (const row of rawData) {
      if (!row || row.length === 0) continue;
      const firstCell = row[0] ? String(row[0]).trim().toUpperCase() : '';
      if (firstCell === 'DOC') {
        currentHeaders = row.map((h) => (h ? String(h).trim().replace(/\s+/g, ' ') : ''));
        continue;
      }
      const tienePalabraTotal = row.some((cell) => cell && typeof cell === 'string' && cell.toUpperCase().includes('TOTAL'));
      if (tienePalabraTotal && firstCell === '') {
        continue;
      }
      if (!currentHeaders) continue;
      const gasto: Partial<Gasto> = {};
      let especificaCount = 0;
      currentHeaders.forEach((header, index) => {
        let dbField = columnMap[header.toUpperCase()];
        if (header.toUpperCase() === 'ESPECIFICA') {
          dbField = especificaCount === 0 ? 'especifica' : 'especifica2';
          especificaCount++;
        }
        const originalValue = row[index];
        if (dbField && originalValue !== null && originalValue !== undefined) {
          let finalValue: any = originalValue;

          if (
            dbField === 'fechaDevengado' ||
            dbField === 'fechaSalida' ||
            dbField === 'fechaRetorno'
          ) {
            const parsedDate = this.parseExcelDate(originalValue, dbField);
            finalValue = parsedDate ? parsedDate.toISOString() : null;
          } else if (dbField === 'monto' || dbField === 'monto2') {
            const cleanString = String(finalValue).replace(/[^0-9.-]/g, '');
            const numValue = parseFloat(cleanString);
            finalValue = isNaN(numValue) ? null : numValue;
          }
          if (finalValue !== null && String(finalValue).trim() !== '') {
            // Al cambiar 'raw' a 'false', 'finalValue' para 'numeroDocumento' y 'siaf'
            // ya será un string (ej: "0012"), así que no hay más cambios aquí.
            (gasto as any)[dbField] = finalValue;
          }
        }
      });

      const tieneMonto = (gasto.monto !== null && gasto.monto !== undefined) || (gasto.monto2 !== null && gasto.monto2 !== undefined);

      if (gasto.tipoDocumento && gasto.fechaDevengado && tieneMonto) {
        gastos.push(gasto);
      }
    }
    return gastos;
  }
  uploadData(): void {
    if (this.processedData.length === 0) return;
    this.processing = true;
    this.apiService.importarGastos(this.processedData).subscribe({
      next: () => {
        this.showSuccess(`¡Éxito! Se importaron ${this.processedData.length} registros.`);
        this.importComplete.emit();
        this.resetFileState();
        this.router.navigate(['/gastos']); // <-- NAVEGAR A LA LISTA
      },
      error: (err) => {
        this.showError('Ocurrió un error al importar los datos.');
        console.error('Error al llamar a la API:', err);
        this.processing = false;
      },
    });
  }

  private resetFileState(): void {
    this.fileName = '';
    this.processedData = [];
    this.processing = false;
    this.workbook = null;
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.cdr.detectChanges();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }
  get recordCount(): number {
    return this.processedData.length;
  }
}