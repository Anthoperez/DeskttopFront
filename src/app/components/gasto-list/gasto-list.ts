// src/app/components/gasto-list/gasto-list.component.ts
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Gasto } from '../../services/api';


// --- NUEVAS IMPORTACIONES ---
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GastoFormComponent } from '../gasto-form/gasto-form';
import { MatTooltipModule } from '@angular/material/tooltip';
// --- FIN DE NUEVAS IMPORTACIONES ---

// Importaciones de Angular Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-gasto-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatButtonModule, MatPaginatorModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './gasto-list.html',
  styleUrls: ['./gasto-list.css']
})
export class GastoListComponent implements OnInit{
  dataSource = new MatTableDataSource<Gasto>();
  // ¡Ahora mostramos todas las columnas!
  displayedColumns: string[] = [
    'tipoDocumento', 'numeroDocumento', 'siaf', 'aNombreDe',
    'concepto', 'monto', 'monto2', 'especifica', 'especifica2', 'ff',
    'mes', 'fechaDevengado', 'proyecto', 'meta',
    'certificacionViatico', 'destino', 'fechaSalida', 'fechaRetorno', 'acciones'
  ];

  // Conectamos el paginador y el ordenador de la plantilla
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  // Hacemos lo mismo para el ordenador (sort)
  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  @ViewChild('confirmDeleteTemplate') confirmDeleteTemplate!: TemplateRef<any>;
  @ViewChild('confirmDeleteAllTemplate') confirmDeleteAllTemplate!: TemplateRef<any>;

  constructor(private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarGastos();
  }

  cargarGastos(): void {
    console.log('Iniciando carga de gastos...'); // <-- AÑADIR ESTO
    this.apiService.getGastos().subscribe({
      next: (data) => {
        // --- AÑADIR ESTOS LOGS ---
        console.log('Datos recibidos de la API:', data);
        if (data.length === 0) {
          console.warn('La API devolvió 0 gastos.');
        }
        // --- FIN DE LOGS ---
        this.dataSource.data = data;
      },
      error: (err) => {
        // --- AÑADIR ESTE ERROR ---
        console.error('¡ERROR AL CARGAR GASTOS DESDE LA API!', err);
      }
    });
  }

  /**
   * Aplica el filtro a la tabla.
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Abre el diálogo de edición (reutilizando GastoFormComponent).
   */
  editarGasto(gasto: Gasto): void {
    const dialogRef = this.dialog.open(GastoFormComponent, {
      width: '1000px', // Mismo ancho que el formulario
      maxHeight: '90vh', // <-- 2. Alto máximo para activar el scroll
      panelClass: 'gasto-form-dialog', // <-- 3. Clase CSS para estilizarlo
      data: gasto // Pasamos el gasto completo al diálogo
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si el diálogo se cerró con 'updated', recargamos la lista
      if (result === 'updated') {
        this.cargarGastos();
        this.showSuccess('¡Gasto actualizado con éxito!');
      }
    });
  }

  /**
   * Elimina un solo gasto, con confirmación.
   */
  eliminarGasto(id: number): void {
    // Abrimos el diálogo usando el template definido en el HTML
    const dialogRef = this.dialog.open(this.confirmDeleteTemplate, {
      width: '350px',
      data: { mensaje: '¿Estás seguro de que deseas eliminar este gasto?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si result es true (el usuario dio click en Aceptar)
      if (result === true) {
        this.apiService.deleteGasto(id).subscribe({
          next: () => {
            this.showSuccess('Gasto eliminado con éxito');
            this.dataSource.data = this.dataSource.data.filter(g => g.id !== id);
          },
          error: (err) => {
            this.showError('Error al eliminar el gasto');
            console.error(err);
          }
        });
      }
    });
  }

  /**
   * Elimina TODOS los gastos, con doble confirmación.
   */
  eliminarTodos(): void {
    // Abrimos un diálogo más complejo para la confirmación de seguridad
    const dialogRef = this.dialog.open(this.confirmDeleteAllTemplate, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Validamos que el usuario haya escrito la palabra clave (viene del HTML)
      if (result === 'ELIMINAR') {
        this.apiService.deleteAllGastos().subscribe({
          next: () => {
            this.showSuccess('Todos los gastos han sido eliminados.');
            this.dataSource.data = [];
          },
          error: (err) => {
            this.showError('Error al eliminar todos los gastos');
            console.error(err);
          }
        });
      } else if (result) {
        // Si cerró el diálogo pero escribió mal la palabra (opcional)
        this.showError('Palabra de confirmación incorrecta. No se eliminó nada.');
      }
    });
  }

  // --- Funciones de Notificación ---
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }

}