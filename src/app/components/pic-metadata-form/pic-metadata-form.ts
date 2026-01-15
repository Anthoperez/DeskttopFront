// src/app/components/pic-metadata-form/pic-metadata-form.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Importa tu servicio de API y las nuevas interfaces
import { ApiService, PicMetadataDto, GastoAnoAnterior, IngresoPic } from '../../services/api';

@Component({
  selector: 'app-pic-metadata-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './pic-metadata-form.html',
  styleUrls: ['./pic-metadata-form.css'],
})
export class PicMetadataFormComponent implements OnInit, OnDestroy {
  // Formulario principal
  metadataForm: FormGroup;
  
  // Para el dropdown de selección de proyecto
  picProjects: string[] = [];
  selectedProject = new FormControl('', [Validators.required]);
  public projectFilterCtrl: FormControl = new FormControl('');
  public filteredProjects: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  private _onDestroy = new Subject<void>();

  isPageLoading = false; // Se usa para ocultar el form mientras se carga
  saveState : 'idle' | 'saving' | 'saved' = 'idle'; // <-- PROPIEDAD ACTUALIZADA;      // Se usa para deshabilitar el botón de guardar
  isFetchingList = true;

  private formatter = new Intl.NumberFormat('es-PE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
  ) {
    // Inicializa el formulario (vacío al principio)
    this.metadataForm = this.fb.group({
      investigador: [''],
      tesista: [''],
<<<<<<< HEAD
      asesor: [''],
=======
      asesor: [''],  
>>>>>>> 2b63eab4a0241a63aa123ef13f36fd20708fc18a
      duracion: [''],
      presupuestoTotal: [null as number | null],
      ingresos: this.fb.array([]),
      gastosAnosAnteriores: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // 1. Cargar la lista de todos los proyectos PIC para el dropdown
    this.loadProjectList();

    // 2. Escuchar cambios en el filtro del dropdown
    this.projectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProjects();
      });

    // 3. Escuchar cambios en el dropdown principal
    this.selectedProject.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((projectName) => {
        if (projectName) {
          this.loadData(projectName);
        } else {
          this.metadataForm.reset();
        }
      });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Carga la lista de proyectos PIC del backend
   */
  loadProjectList(): void {
    this.isFetchingList = true;
    this.apiService.getMasterPicProjectList().subscribe({
      next: (projects) => {
        this.picProjects = projects;
        this.filteredProjects.next(projects.slice());
        this.isFetchingList = false;
      },
      error: () => {
        this.showError('Error al cargar la lista de proyectos PIC.');
        this.isFetchingList = false;
      },
    });
  }

  /**
   * Filtra la lista de proyectos en el dropdown
   */
  private filterProjects(): void {
    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredProjects.next(this.picProjects.slice());
      return;
    }
    search = search.toLowerCase();
    this.filteredProjects.next(
      this.picProjects.filter(
        (p) => p.toLowerCase().includes(search),
      ),
    );
  }

  /**
   * Carga la metadata existente para el proyecto seleccionado
   */
  loadData(projectName: string): void {
    this.isPageLoading = true;
    this.saveState = 'idle'; // <-- AÑADIDO: Resetea el botón de guardar
    this.apiService.getPicMetadata(projectName).subscribe({
      next: (data) => {
        // Limpiar el formulario antes de cargar
        this.metadataForm.reset();
        this.ingresos.clear();
        this.gastosAnosAnteriores.clear();

        if (data) {
          // Si hay datos, rellenar el formulario
          this.metadataForm.patchValue({
            investigador: data.investigador,
            tesista: data.tesista,
            asesor: data.asesor,
            duracion: data.duracion,
            presupuestoTotal: data.presupuestoTotal,
          });

          // Rellenar FormArrays
          if (data.ingresos) {
            data.ingresos.forEach((ing) =>
              this.ingresos.push(this.nuevoIngreso(ing)),
            );
          }
          if (data.gastosAnosAnteriores) {
            data.gastosAnosAnteriores.forEach((gasto) =>
              this.gastosAnosAnteriores.push(this.nuevoGastoAnoAnteriorGroup(gasto)),
            );
          }
        }
        
        // Asegurar que haya al menos una fila vacía si no vino nada
        if (this.ingresos.length === 0) this.agregarIngreso();
        if (this.gastosAnosAnteriores.length === 0) this.agregarGastoAnoAnterior();

        this.isPageLoading = false;
      },
      error: () => {
        this.isPageLoading = false;
        this.showError('Error al cargar los datos del proyecto.');
      },
    });
  }

  /**
   * Guarda los datos del formulario en el backend
   */
  saveData(): void {
    this.metadataForm.updateValueAndValidity();
    if (this.metadataForm.invalid || this.selectedProject.invalid) {
      this.showError('Formulario inválido. Revise los campos.');
      return;
    }

    this.saveState = 'saving';
    const projectName = this.selectedProject.value!;
    
    // Preparamos los datos para enviar
    const formData = this.metadataForm.value;
    const dataToSend: PicMetadataDto = {
      projectName: projectName,
      investigador: formData.investigador || '',
      tesista: formData.tesista || '',
      asesor: formData.asesor || '',
      duracion: formData.duracion || '',
      presupuestoTotal: parseFloat(String(formData.presupuestoTotal).replace(/,/g, '')) || null,
      ingresos: formData.ingresos
        .map((ing: any) => ({
          descripcion: ing.descripcion,
          monto: parseFloat(String(ing.monto).replace(/,/g, '')) || null,
        }))
        .filter((ing: IngresoPic) => ing.descripcion || ing.monto !== null), // Quitar filas vacías
      gastosAnosAnteriores: formData.gastosAnosAnteriores
        .map((gasto: any) => {
          const filaLimpia = {
            year: Number(gasto.year) || 0,
          } as GastoAnoAnterior;
          for (const key in gasto) {
            if (key !== 'year') {
              (filaLimpia as any)[key] = Number(gasto[key]) || null;
            }
          }
          return filaLimpia;
        })
        .filter((gasto: GastoAnoAnterior) => gasto.year), // Quitar filas sin año
    };

    this.apiService.savePicMetadata(projectName, dataToSend).subscribe({
      next: () => {
        this.saveState = 'saved';
        this.showSuccess('¡Datos guardados con éxito!');
        // Opcional: recargar los datos
        this.loadData(projectName);
        setTimeout(() => {
          this.saveState = 'idle';
        }, 2000);
      },
      error: () => {
        this.saveState = 'idle'; // <-- Volver al estado 'idle'
        this.showError('Error al guardar los datos.');
      },
    });
  }

  // --- Helpers para FormArray 'ingresos' ---
  get ingresos(): FormArray {
    return this.metadataForm.get('ingresos') as FormArray;
  }
  nuevoIngreso(ingreso?: IngresoPic): FormGroup {
    return this.fb.group({
      descripcion: [ingreso?.descripcion || ''],
      monto: [ingreso?.monto || null],
    });
  }
  agregarIngreso(): void {
    this.ingresos.push(this.nuevoIngreso());
  }
  eliminarIngreso(index: number): void {
    this.ingresos.removeAt(index);
  }

  // --- Helpers para FormArray 'gastosAnosAnteriores' ---
  get gastosAnosAnteriores(): FormArray {
    return this.metadataForm.get('gastosAnosAnteriores') as FormArray;
  }
  nuevoGastoAnoAnteriorGroup(gasto?: GastoAnoAnterior): FormGroup {
    return this.fb.group({
      year: [gasto?.year || new Date().getFullYear() - 1, [Validators.required]],
      bienesCorrientes: [gasto?.bienesCorrientes || null],
      bienesCapital: [gasto?.bienesCapital || null],
      servicios: [gasto?.servicios || null],
      subvencion: [gasto?.subvencion || null],
      viaticos: [gasto?.viaticos || null],
      encargoInterno: [gasto?.encargoInterno || null],
    });
  }
  agregarGastoAnoAnterior(): void {
    this.gastosAnosAnteriores.push(this.nuevoGastoAnoAnteriorGroup());
  }
  eliminarGastoAnoAnterior(index: number): void {
    if (this.gastosAnosAnteriores.length > 0) {
      this.gastosAnosAnteriores.removeAt(index);
    }
  }

  // --- Funciones de formato de Moneda ---
  onCurrencyFocus(event: FocusEvent, control: AbstractControl | null): void {
    if (!control) return;
    const input = event.target as HTMLInputElement;
    if (control.value !== null) {
      input.value = Number(control.value).toFixed(2);
      input.select();
    }
  }
  onCurrencyBlur(event: FocusEvent, control: AbstractControl | null): void {
    if (!control) return;
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/,/g, '');
    const numValue = parseFloat(rawValue);

    if (!isNaN(numValue)) {
      control.setValue(numValue);
      input.value = this.formatter.format(numValue);
    } else {
      control.setValue(null);
      input.value = '';
    }
  }

  // --- Funciones de Notificación ---
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }
}