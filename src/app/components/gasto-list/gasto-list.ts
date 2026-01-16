// src/app/components/gasto-list/gasto-list.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Gasto } from '../../services/api';
// Añadir FormControl y ReactiveFormsModule
import { FormControl, ReactiveFormsModule } from '@angular/forms'; 

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog'; // Importar MatDialogRef
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select'; // Añadir Select
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { GastoFormComponent } from '../gasto-form/gasto-form';

@Component({
  selector: 'app-gasto-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatCardModule, 
    MatButtonModule, 
    MatPaginatorModule, 
    MatFormFieldModule,
    MatIconModule, 
    MatInputModule, 
    MatSortModule, 
    MatDialogModule, 
    MatSnackBarModule, 
    MatTooltipModule,
    MatSelectModule, // Importante para el filtro de mes
    ReactiveFormsModule // Importante para los filtros
  ],
  templateUrl: './gasto-list.html',
  styleUrls: ['./gasto-list.css']
})
export class GastoListComponent implements OnInit {
  dataSource = new MatTableDataSource<Gasto>();
  displayedColumns: string[] = [
    'tipoDocumento', 'numeroDocumento', 'siaf', 'aNombreDe',
    'concepto', 'monto', 'monto2', 'especifica', 'especifica2', 'ff',
    'mes', 'fechaDevengado', 'proyecto', 'meta',
    'certificacionViatico', 'destino', 'fechaSalida', 'fechaRetorno', 'acciones'
  ];

  // --- FILTROS INDEPENDIENTES ---
  siafFilter = new FormControl('');
  mesFilter = new FormControl('');
  numeroFilter = new FormControl('');
  proyectoFilter = new FormControl('');
  globalFilter = new FormControl('');

  // Valores actuales de los filtros
  filterValues = {
    siaf: '',
    mes: '',
    numeroDocumento: '',
    proyecto: '',
    global: ''
  };

  meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ];

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) this.dataSource.paginator = paginator;
  }
  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) this.dataSource.sort = sort;
  }

  // Guardamos referencia al dialogo de borrar todo para poder cerrarlo manualmente
  private deleteDialogRef: MatDialogRef<any> | null = null;

  constructor(private apiService: ApiService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargarGastos();
    this.setupFilters(); // Configurar lógica de filtros
  }

  cargarGastos(): void {
    this.apiService.getGastos().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        // Reinicializar el filtro custom después de cargar datos
        this.dataSource.filterPredicate = this.createFilter();
      },
      error: (err) => console.error(err)
    });
  }

  // --- LÓGICA DE FILTROS AVANZADA ---
  setupFilters() {
    this.siafFilter.valueChanges.subscribe((val) => {
      this.filterValues.siaf = val?.trim().toLowerCase() || '';
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.mesFilter.valueChanges.subscribe((val) => {
      this.filterValues.mes = val?.trim().toLowerCase() || '';
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.numeroFilter.valueChanges.subscribe((val) => {
      this.filterValues.numeroDocumento = val?.trim().toLowerCase() || '';
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.proyectoFilter.valueChanges.subscribe((val) => {
      this.filterValues.proyecto = val?.trim().toLowerCase() || '';
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.globalFilter.valueChanges.subscribe((val) => {
      this.filterValues.global = val?.trim().toLowerCase() || '';
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
  }

  createFilter(): (data: Gasto, filter: string) => boolean {
    return (data: Gasto, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);

      // Comprobaciones seguras (evitar nulls)
      const dataSiaf = data.siaf ? data.siaf.toLowerCase() : '';
      const dataMes = data.mes ? data.mes.toLowerCase() : '';
      const dataNumero = data.numeroDocumento ? data.numeroDocumento.toString().toLowerCase() : '';
      const dataProyecto = data.proyecto ? data.proyecto.toLowerCase() : '';
      
      // Para búsqueda global concatenamos todo lo relevante
      const allData = (
        dataSiaf + dataMes + dataNumero + dataProyecto + 
        (data.aNombreDe?.toLowerCase() || '') + 
        (data.concepto?.toLowerCase() || '')
      );

      // Lógica AND (deben cumplirse todas las condiciones que tengan texto)
      const matchSiaf = dataSiaf.indexOf(searchTerms.siaf) !== -1;
      const matchMes = searchTerms.mes ? dataMes === searchTerms.mes : true; // Mes coincidencia exacta si se selecciona
      const matchNumero = dataNumero.indexOf(searchTerms.numeroDocumento) !== -1;
      const matchProyecto = dataProyecto.indexOf(searchTerms.proyecto) !== -1;
      const matchGlobal = allData.indexOf(searchTerms.global) !== -1;

      return matchSiaf && matchMes && matchNumero && matchProyecto && matchGlobal;
    };
  }

  // --- ACCIONES ---

  editarGasto(gasto: Gasto): void {
    const dialogRef = this.dialog.open(GastoFormComponent, {
      width: '1000px',
      maxHeight: '90vh',
      panelClass: 'gasto-form-dialog',
      data: gasto
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') this.cargarGastos();
    });
  }

  eliminarGasto(id: number): void {
    if (confirm('¿Deseas eliminar este gasto?')) {
      this.apiService.deleteGasto(id).subscribe({
        next: () => {
          this.showSuccess('Gasto eliminado');
          this.dataSource.data = this.dataSource.data.filter(g => g.id !== id);
        },
        error: (err) => this.showError('Error al eliminar')
      });
    }
  }

  // --- LOGICA DE ELIMINAR TODO + FIX ENTER ---
  
  eliminarTodos(): void {
    // Abrimos el diálogo con referencia
    this.deleteDialogRef = this.dialog.open(this.confirmDeleteAllTemplate);

    this.deleteDialogRef.afterClosed().subscribe(result => {
      if (result === 'ELIMINAR') {
        this.performDeleteAll();
      }
      this.deleteDialogRef = null;
    });
  }

  // Función llamada por el evento (keyup.enter) en el HTML
  onEnterInDeleteDialog(value: string): void {
    if (value === 'ELIMINAR' && this.deleteDialogRef) {
      this.deleteDialogRef.close('ELIMINAR');
    }
  }

  private performDeleteAll(): void {
    this.apiService.deleteAllGastos().subscribe({
      next: () => {
        this.showSuccess('Tabla limpiada correctamente.');
        this.dataSource.data = [];
      },
      error: (err) => this.showError('Error al eliminar datos.')
    });
  }

  // Necesitamos acceso al template en el TS para pasarlo al dialog.open
  @ViewChild('confirmDeleteAllTemplate') confirmDeleteAllTemplate: any;

  // --- HELPERS ---
  private showError(msg: string) { this.snackBar.open(msg, 'Cerrar', { duration: 5000 }); }
  private showSuccess(msg: string) { this.snackBar.open(msg, 'Ok', { duration: 3000 }); }
  
  // Método para limpiar todos los filtros visualmente
  clearFilters() {
    this.siafFilter.setValue('');
    this.mesFilter.setValue('');
    this.numeroFilter.setValue('');
    this.proyectoFilter.setValue('');
    this.globalFilter.setValue('');
  }
}