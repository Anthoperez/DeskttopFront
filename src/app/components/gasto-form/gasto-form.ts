// src/app/components/gasto-form/gasto-form.component.ts
import { Component, EventEmitter, Output, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms'; // Importa FormGroup
import { CommonModule } from '@angular/common';
import { ApiService, Gasto } from '../../services/api';
import { Router } from '@angular/router'; // <-- AÑADIR
// ▼▼▼ AÑADIR ESTAS IMPORTACIONES ▼▼▼
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {MatNativeDateModule } from '@angular/material/core';
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

// --- NUEVAS IMPORTACIONES ---
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// --- FIN NUEVAS IMPORTACIONES ---

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gasto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    NgxMatSelectSearchModule,
    MatSnackBarModule,
  ],
  templateUrl: './gasto-form.html',
  styleUrls: ['./gasto-form.css'],
})
export class GastoFormComponent implements OnInit, OnDestroy {
  @Output() gastoCreado = new EventEmitter<void>();
  tiposDocumento = ['P/V', 'P/S', 'O/S', 'R.DGA', 'O/C']; //no es C/S es P/V
  fuentesFinanciamiento = ['D Y T', 'R.DET', 'R.D.R']; // no es R.D es R.D.R
  meses = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
  ];
  // ▼▼▼ AÑADIR ESTA ESTRUCTURA DE DATOS ▼▼▼
  proyectosAgrupados = [
    {
      seccion: 'FONDECYT',
      proyectos: [
        'CONTRATO N° 04-2019-FONDECYT',
        'CONTRATO N° 038-2021-FONDECYT',
        'CONTRATO N° 041-2021-FONDECYT',
        'CONTRATO N° 066-2021-FONDECYT',
        'PROYECTO Nº 618506 - REMOVE', //preguntarrrr
        'CONTRATO N° 501078609-2022-PROCIENCIA', //preguntarrrrrr
        'CONTRATO N° 501083332-2023-PROCIENCIA',
        'CONTRATO N° 501082885-2023-PROCIENCIA',
        'CONTRATO N° 501082997-2023-PROCIENCIA',
        'CONTRATO N° 501083008-2023-PROCIENCIA',
        'CONTRATO N° 501085431-2023-PROCIENCIA-BM',
        'CONTRATO N° 501085962-2023-PROCIENCIA-BM',
        'CONTRATO N° 501086389-2024-PROCIENCIA',
        'CONTRATO N° 501087339-2024-PROCIENCIA',
        'CONTRATO N° 501086311-2024-PROCIENCIA',
      ],
    },
    {
      seccion: 'V CONVOCATORIA - 2021 MODALIDAD 1: PROYECTOS DE INVESTIGACIÓN BÁSICA Y APLICADA',
      proyectos: [
        'PIC 01-2021 MOD. 01 - V CONV.',
        'PIC 02-2021 MOD. 01 - V CONV.',
        'PIC 03-2021 MOD. 01 - V CONV.',
        'PIC 04-2021 MOD. 01 - V CONV.',
        'PIC 05-2021 MOD. 01 - V CONV.',
      ],
    },
    {
      seccion: 'V CONVOCATORIA - 2021 MODALIDAD 2: PROYECTOS DE INVESTIGACIÓN DE TESIS DE PREGRADO',
      proyectos: [
        'PIC 01-2021 MOD. 02 - V CONV.',
        'PIC 02-2021 MOD. 02 - V CONV.',
        'PIC 03-2021 MOD. 02 - V CONV.',
        'PIC 04-2021 MOD. 02 - V CONV.',
        'PIC 05-2021 MOD. 02 - V CONV.',
        'PIC 06-2021 MOD. 02 - V CONV.',
      ],
    },

    {
      seccion: 'V CONVOCATORIA - 2021 MODALIDAD 3: PROYECTOS DE INVESTIGACIÓN DE TESIS DE POSGRADO',
      proyectos: [
        'PIC 01-2021 MOD. 03 - V CONV.',
        'PIC 02-2021 MOD. 03 - V CONV.',
        'PIC 03-2021 MOD. 03 - V CONV.',
        'PIC 04-2021 MOD. 03 - V CONV.',
        'PIC 05-2021 MOD. 03 - V CONV.',
        'PIC 06-2021 MOD. 03 - V CONV.',
        'PIC 07-2021 MOD. 03 - V CONV.',
        'PIC 08-2021 MOD. 03 - V CONV.',
        'PIC 09-2021 MOD. 03 - V CONV.',
        'PIC 10-2021 MOD. 03 - V CONV.',
        'PIC 11-2021 MOD. 03 - V CONV.',
        'PIC 12-2021 MOD. 03 - V CONV.',
        'PIC 13-2021 MOD. 03 - V CONV.',
        'PIC 14-2021 MOD. 03 - V CONV.',
        'PIC 15-2021 MOD. 03 - V CONV.',
      ],
    },

    {
      seccion: 'V CONVOCATORIA - 2021 MODALIDAD 4: PROYECTOS DE PUBLICACIONES',
      proyectos: [
        'PIC 01-2021 MOD. 04 - V CONV.',
        'PIC 02-2021 MOD. 04 - V CONV.',
        'PIC 03-2021 MOD. 04 - V CONV.',
        'PIC 04-2021 MOD. 04 - V CONV.',
        'PIC 05-2021 MOD. 04 - V CONV.',
        'PIC 06-2021 MOD. 04 - V CONV.',
        'PIC 07-2021 MOD. 04 - V CONV.',
        'PIC 08-2021 MOD. 04 - V CONV.',
        'PIC 09-2021 MOD. 04 - V CONV.',
        'PIC 10-2021 MOD. 04 - V CONV.',
        'PIC 11-2021 MOD. 04 - V CONV.',
        'PIC 12-2021 MOD. 04 - V CONV.',
        'PIC 13-2021 MOD. 04 - V CONV.',
        'PIC 14-2021 MOD. 04 - V CONV.',
        'PIC 15-2021 MOD. 04 - V CONV.',
        'PIC 16-2021 MOD. 04 - V CONV.',
        'PIC 17-2021 MOD. 04 - V CONV.',
        'PIC 18-2021 MOD. 04 - V CONV.',
        'PIC 19-2021 MOD. 04 - V CONV.',
        'PIC 20-2021 MOD. 04 - V CONV.',
        'PIC 21-2021 MOD. 04 - V CONV.',
        'PIC 22-2021 MOD. 04 - V CONV.',
      ],
    },

    {
      seccion:
        'V CONVOCATORIA - 2021 MODALIDAD MODALIDAD 4-II: PROYECTOS DE INVESTIGACIÓN PUBLICACIONES (LIBROS)',
      proyectos: ['PIC 23-2021 MOD. 04-II - V CONV.', 'PIC 24-2021 MOD. 04-II - V CONV.'],
    },

    {
      seccion: 'VI CONVOCATORIA - 2022 MODALIDAD 1: PROYECTOS DE INVESTIGACIÓN APLICADA',
      proyectos: [
        'PIC 01-2022 MOD. 01 - VI CONV.',
        'PIC 02-2022 MOD. 01 - VI CONV.',
        'PIC 03-2022 MOD. 01 - VI CONV.',
        'PIC 04-2022 MOD. 01 - VI CONV.',
      ],
    },

    {
      seccion: 'VI CONVOCATORIA - 2022 MODALIDAD 2: CATEGORIAS CONSOLIDADO Y POR CONSOLIDAR',

      proyectos: ['PIC 01-2022 MOD. 02 - VI CONV.', 'PIC 02-2022 MOD. 02 - VI CONV.'],
    },

    {
      seccion: 'VI CONVOCATORIA - 2022 MODALIDAD 2: CATEGORIA EMERGENTE',
      proyectos: ['PIC 03-2022 MOD. 02 - VI CONV.', 'PIC 04-2022 MOD. 02 - VI CONV.'],
    },

    {
      seccion: 'VI CONVOCATORIA - 2022 MODALIDAD: PROYECTOS EMBLEMATICO',
      proyectos: [
        'PIC 01-2023 - EMBLEMATICO',
        'PIC 02-2023 - EMBLEMATICO',
        'PIC 03-2023 -EMBLEMATICO ',
      ],
    },

    {
      seccion: 'VII CONVOCATORIA - 2023 MODALIDAD: 01 - PROY. INVESTIGACION CIENTIFICA',
      proyectos: [
        'PIC 01-2023 MOD. 01 - VII CONV.',
        'PIC 02-2023 MOD. 01 - VII CONV.',
        'PIC 03-2023 MOD. 01 - VII CONV.',
        'PIC 04-2023 MOD. 01 - VII CONV.',
        'PIC 05-2023 MOD. 01 - VII CONV.',
        'PIC 06-2023 MOD. 01 - VII CONV.',
        'PIC 07-2023 MOD. 01 - VII CONV.',
        'PIC 08-2023 MOD. 01 - VII CONV.',
      ],
    },

    {
      seccion: 'VII CONVOCATORIA - 2023 MODALIDAD: 02 - EN CIENCIAS SOCIALES',
      proyectos: ['PIC 01-2023 MOD. 02 - VII CONV.', 'PIC 02-2023 MOD. 02 - VII CONV.'],
    },

    {
      seccion: 'VII CONVOCATORIA - 2023 MODALIDAD: 03 - PROY. INVESTIGACION EMBLEMATICA',
      proyectos: [
        'PIC 01-2023 MOD. 03 - VII CONV.',
        'PIC 02-2023 MOD. 03 - VII CONV.',
        'PIC 03-2023 MOD. 03 - VII CONV.',
        'PIC 04-2023 MOD. 03 - VII CONV.',
        'PIC 05-2023 MOD. 03 - VII CONV.',
        'PIC 06-2023 MOD. 03 - VII CONV.',
        'PIC 07-2023 MOD. 03 - VII CONV.',
      ],
    },

    {
      seccion: 'VIII CONVOCATORIA - 2024 MODALIDAD: 01 - PROY. INVESTIGACION CIENTIFICA',
      proyectos: ['PIC 01-2024 MOD. 01 - VIII CONV.', 'PIC 02-2024 MOD. 01 - VIII CONV.'],
    },

    {
      seccion: 'VIII CONVOCATORIA - 2024 MODALIDAD: 02 - PROY. INVESTIGACION CIENTIFICA',
      proyectos: [
        'PIC 01-2024 MOD. 02 - VIII CONV.',
        'PIC 02-2024 MOD. 02 - VIII CONV.',
        'PIC 03-2024 MOD. 02 - VIII CONV.',
        'PIC 04-2024 MOD. 02 - VIII CONV.',
        'PIC 05-2024 MOD. 02 - VIII CONV.',
        'PIC 06-2024 MOD. 02 - VIII CONV.',
        'PIC 07-2024 MOD. 02 - VIII CONV.',
        'PIC 08-2024 MOD. 02 - VIII CONV.',
        'PIC 09-2024 MOD. 02 - VIII CONV.',
        'PIC 10-2024 MOD. 02 - VIII CONV.',
        'PIC 11-2024 MOD. 02 - VIII CONV.',
        'PIC 12-2024 MOD. 02 - VIII CONV.',
        'PIC 13-2024 MOD. 02 - VIII CONV.',
        'PIC 14-2024 MOD. 02 - VIII CONV.',
        'PIC 15-2024 MOD. 02 - VIII CONV.',
        'PIC 16-2024 MOD. 02 - VIII CONV.',
        'PIC 17-2024 MOD. 02 - VIII CONV.',
      ],
    },

    {
      seccion: 'VIII CONVOCATORIA - 2024 MODALIDAD: 03 - PROY. INVESTIGACION CIENTIFICA',
      proyectos: [
        'PIC 01-2024 MOD. 03 - VIII CONV.',
        'PIC 02-2024 MOD. 03 - VIII CONV.',
        'PIC 03-2024 MOD. 03 - VIII CONV.',
        'PIC 04-2024 MOD. 03 - VIII CONV.',
      ],
    },
  ];
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  // 1. Declaramos la propiedad del formulario aquí
  gastoForm: FormGroup;

  isEditMode = false; // <-- NUEVA PROPIEDAD

  // ▼▼▼ AÑADIR ESTE FORMATEADOR DE MONEDA ▼▼▼
  private formatter = new Intl.NumberFormat('es-PE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  // ▼▼▼ 3. AÑADIR ESTAS PROPIEDADES PARA EL FILTRO ▼▼▼

  /** Control para el campo de búsqueda de proyectos */
  public proyectoFilterCtrl: FormControl = new FormControl('');

  /** Lista de proyectos filtrados (se actualiza en tiempo real) */
  public filteredProyectosAgrupados: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** Subject para manejar la des-suscripción */
  private _onDestroy = new Subject<void>();

  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  // 2. Inyectamos FormBuilder en el constructor y LUEGO inicializamos el formulario
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router, // <-- INYECTAR ROUTER
    @Optional() public dialogRef: MatDialogRef<GastoFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Gasto
  ) {
    this.gastoForm = this.fb.group({
      // --- CAMPOS OBLIGATORIOS ---
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      aNombreDe: ['', Validators.required],
      concepto: ['', Validators.required],
      monto: [null as number | null, [Validators.required]],
      especifica: ['', Validators.required],
      fechaDevengado: [null as Date | null, Validators.required],
      proyecto: ['', Validators.required],
      mes: ['', Validators.required],
      meta: ['', Validators.required],
      siaf: ['', Validators.required],
      ff: ['', Validators.required],

      // --- CAMPOS OPCIONALES (sin Validators.required) ---
      monto2: [null as number | null],
      especifica2: [''],
      certificacionViatico: [''],
      destino: [''],
      fechaSalida: [null as Date | null],
      fechaRetorno: [null as Date | null],
    });
  }

  // ▼▼▼ 4. AÑADIR ngOnInit Y ngOnDestroy ▼▼▼

  ngOnInit() {
    // Carga la lista inicial de proyectos en el filtro
    this.filteredProyectosAgrupados.next(this.proyectosAgrupados.slice());

    // Escucha los cambios en el campo de búsqueda
    this.proyectoFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterProyectos();
    });

    // --- NUEVA LÓGICA DE EDICIÓN ---
    if (this.data) {
      this.isEditMode = true;
      // Rellena el formulario con los datos del gasto
      this.gastoForm.patchValue(this.data);

      // FORZAR la actualización visual de los campos de moneda
      // ya que patchValue no dispara el evento 'blur'
      // Usamos un pequeño timeout para asegurar que el DOM esté listo
      setTimeout(() => {
        this.formatCurrencyInput('monto');
        this.formatCurrencyInput('monto2');
      }, 100);
    }
    // --- FIN LÓGICA DE EDICIÓN ---
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  // --- NUEVA FUNCIÓN AUXILIAR ---
  /**
   * Formatea el valor del input de moneda después de un patchValue
   */
  private formatCurrencyInput(controlName: 'monto' | 'monto2'): void {
    const control = this.gastoForm.get(controlName);
    if (control && control.value !== null) {
      // Buscamos el input dentro del DOM
      const input = document.querySelector(
        `input[formControlName="${controlName}"]`
      ) as HTMLInputElement;
      if (input) {
        // Le asignamos el valor formateado
        input.value = this.formatter.format(control.value);
      }
    }
  }

  // ▼▼▼ 5. AÑADIR EL MÉTODO DE FILTRADO ▼▼▼

  private filterProyectos() {
    if (!this.proyectosAgrupados) {
      return;
    }
    // Obtiene el valor de búsqueda
    let search = this.proyectoFilterCtrl.value;
    if (!search) {
      // Si no hay búsqueda, muestra la lista completa
      this.filteredProyectosAgrupados.next(this.proyectosAgrupados.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    // Filtra la lista
    this.filteredProyectosAgrupados.next(
      this.proyectosAgrupados
        .map((grupo) => {
          // Filtra los proyectos *dentro* de cada grupo
          const filteredProyectos = grupo.proyectos.filter((proyecto) =>
            proyecto.toLowerCase().includes(search)
          );

          if (filteredProyectos.length > 0) {
            // Si el grupo tiene resultados, devuelve un *nuevo* objeto de grupo
            return {
              seccion: grupo.seccion,
              proyectos: filteredProyectos,
            };
          }
          return null; // Si el grupo no tiene resultados, se descarta
        })
        .filter((grupo) => grupo !== null) // Limpia los grupos nulos
    );
  }

  onSubmit(): void {
    if (this.gastoForm.invalid) {
      this.gastoForm.markAllAsTouched(); // Muestra errores si está inválido
      return;
    }

    const formValue = this.gastoForm.getRawValue();

    if (this.isEditMode) {
      // --- LÓGICA DE ACTUALIZAR ---
      this.apiService.updateGasto(this.data.id, formValue as Gasto).subscribe({
        next: () => {
          // No mostramos snackbar aquí, lo hace la lista
          // Cerramos el diálogo y enviamos una señal de 'updated'
          this.dialogRef.close('updated');
        },
        error: (err) => {
          this.snackBar.open('Error al actualizar el gasto.', 'Cerrar', { duration: 5000 });
          console.error(err);
        },
      });
    } else {
      this.apiService.crearGasto(formValue as Partial<Gasto>).subscribe({
        next: () => {
          this.snackBar.open('Gasto registrado con éxito!', 'Ok', { duration: 3000 });
          this.cancelar();
          this.gastoCreado.emit();
          this.router.navigate(['/gastos']); // <-- NAVEGAR A LA LISTA
        },
        error: (err) => {
          this.snackBar.open('Error al registrar el gasto.', 'Cerrar', { duration: 5000 });
          console.error(err);
        },
      });
    }
  }

  // ▼▼▼ --- AÑADIR NUEVOS MÉTODOS --- ▼▼▼

  /**
   * Rellena un campo con ceros a la izquierda (ej: 20 -> 0020)
   * Se activa al salir del campo (onBlur).
   */
  padField(controlName: 'numeroDocumento' | 'siaf' | 'meta', padding: number): void {
    const control = this.gastoForm.get(controlName);
    if (control && control.value) {
      const value = String(control.value);
      control.setValue(value.padStart(padding, '0'));
    }
  }

  /**
   * Al entrar (focus) a un campo de moneda, muestra el número simple.
   * Ej: "23,500.00" -> "23500.00"
   */
  onCurrencyFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const controlName = input.getAttribute('formControlName') as 'monto' | 'monto2';
    const control = this.gastoForm.get(controlName);

    if (control && control.value !== null) {
      input.value = Number(control.value).toFixed(2);
    }
  }

  /**
   * Al salir (blur) de un campo de moneda:
   * 1. Parsea el valor (ej: "23,500.5" o "23500.5") a un número.
   * 2. Guarda el número limpio en el form control.
   * 3. Muestra el valor formateado en el input (ej: "23,500.50").
   */
  onCurrencyBlur(event: FocusEvent, controlName: 'monto' | 'monto2'): void {
    const input = event.target as HTMLInputElement;
    const control = this.gastoForm.get(controlName);

    if (control) {
      const rawValue = input.value.replace(/,/g, ''); // Quita comas
      const numValue = parseFloat(rawValue);

      if (!isNaN(numValue)) {
        control.setValue(numValue); // Guarda el número
        input.value = this.formatter.format(numValue); // Muestra formateado
      } else {
        control.setValue(null); // Borra si no es un número
        input.value = '';
      }
    }
  }

  /**
   * Limpia todos los campos del formulario.
   */
  cancelar(): void {
    if (this.dialogRef) {
      // Si está en un diálogo, solo lo cierra
      this.dialogRef.close();
    } else {
      this.gastoForm.reset();

      // También debemos limpiar manualmente los valores de los inputs de moneda
      // que fueron formateados por 'onCurrencyBlur'
      const montoInput = document.querySelector(
        'input[formControlName="monto"]'
      ) as HTMLInputElement;
      const monto2Input = document.querySelector(
        'input[formControlName="monto2"]'
      ) as HTMLInputElement;

      if (montoInput) montoInput.value = '';
      if (monto2Input) monto2Input.value = '';
    }
  }
  // ▲▲▲ --- FIN DE NUEVOS MÉTODOS --- ▲▲▲
}