// src/app/components/report-metadata-dialog/report-metadata-dialog.ts
import { Component, Inject, OnInit } from '@angular/core'; // Añadir OnInit
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms'; // Añadir Validators
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core'; // Importar si no está (aunque app.config ya lo provee)

@Component({
  selector: 'app-report-metadata-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule, // <-- Asegurarse de que esté aquí también
  ],
  templateUrl: './report-metadata-dialog.html',
  styleUrls: ['./report-metadata-dialog.css'],
})
export class ReportMetadataDialogComponent implements OnInit { // Implementar OnInit
  metadataForm: FormGroup;
  reportType: 'contrato' | 'pic' = 'contrato'; // Tipo de reporte
   // ▼▼▼ AÑADIR ESTE FORMATEADOR DE MONEDA ▼▼▼
  private formatter = new Intl.NumberFormat('es-PE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  constructor(
    public dialogRef: MatDialogRef<ReportMetadataDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, // Datos opcionales si se pasan
  ) {

    // ▼▼▼ AÑADIR ESTA LÓGICA ▼▼▼
    if (data && data.reportType === 'pic') {
      this.reportType = 'pic';
    }
    // ▲▲▲ FIN DE LA LÓGICA ▲▲▲

    this.metadataForm = this.fb.group({
      anio: [2025, [Validators.required]],
      tituloProyecto: [''], 
      codigoProyecto: [''],
      investigador: [''],
      rr_investigador: [''], // Para la "R.R. Nº..."
      fechaInicio: [''],
      duracion: [''],
      fechaCulminacion: [null],
      
      // ▼▼▼ NUEVOS CAMPOS PARA DESCRIPCION DE PRESUPUESTO ▼▼▼
      presupuestoEntidades: this.fb.array([]),
      // ▲▲▲ FIN NUEVOS CAMPOS PRESUPUESTO ▲▲▲

      // --- Campos Fijos para PIC ---
      presupuestoTotalPic: [null as number | null],

      ingresos: this.fb.array([]),

      // ▼▼▼ NUEVOS CAMPOS PARA EJECUCIÓN DE GASTOS - AÑO ANTERIOR ▼▼▼
      gastosAnosAnteriores: this.fb.array([]),
      // ▲▲▲ FIN NUEVOS CAMPOS GASTOS AÑO ANTERIOR ▲▲▲
    });
  }


  
  ngOnInit(): void {
    // Para asegurarnos de que haya al menos una fila de ingreso al iniciar

    if (this.data && this.data.metadata && this.data.metadata.ingresos) {
      this.data.metadata.ingresos.forEach((ingreso: any) => {
        this.ingresos.push(this.nuevoIngreso(ingreso));
      });
    }
    if (this.ingresos.length === 0) {
      this.agregarIngreso(); // Añadir una fila de ingreso por defecto
    }


    // ▼▼▼ CÓDIGO NUEVO AQUÍ ▼▼▼
    // Lógica para cargar los gastos de años anteriores si existen
    if (this.data && this.data.metadata && this.data.metadata.gastosAnosAnteriores) {
      this.data.metadata.gastosAnosAnteriores.forEach((gasto: any) => {
        this.gastosAnosAnteriores.push(this.nuevoGastoAnoAnteriorGroup(gasto));
      });
    }

    // Si el FormArray sigue vacío, añadimos una fila por defecto
    if (this.gastosAnosAnteriores.length === 0) {
      this.agregarGastoAnoAnterior();
    }
    // ▲▲▲ FIN DE CÓDIGO NUEVO ▲▲▲

    // ▼▼▼ --- NUEVA LÓGICA PARA PRESUPUESTO DINÁMICO --- ▼▼▼
    if (this.reportType === 'contrato') {
    if (this.data && this.data.metadata && this.data.metadata.presupuestoEntidades) {
      // Si vienen datos, los cargamos
      this.data.metadata.presupuestoEntidades.forEach((entidad: any) => {
        this.presupuestoEntidades.push(this.nuevoEntidadPresupuesto(entidad.nombreEntidad));
      });
    }
    
    // Si el array está vacío, añadimos las 3 filas por defecto
    if (this.presupuestoEntidades.length === 0) {
      this.agregarEntidadPresupuesto('PROCIENCIA');
      this.agregarEntidadPresupuesto('Entidad Ejecutora');
      this.agregarEntidadPresupuesto('Entidad Asociada');
    }
    } else {
      // Cargar presupuesto fijo (si es PIC)
      if (this.data && this.data.metadata && this.data.metadata.presupuestoTotalPic) {
        this.metadataForm.get('presupuestoTotalPic')?.setValue(this.data.metadata.presupuestoTotalPic);
      }
    }
    // ▲▲▲ --- FIN DE LA NUEVA LÓGICA --- ▲▲▲
  }

  // Helper para acceder al FormArray de ingresos
  get ingresos(): FormArray {
    return this.metadataForm.get('ingresos') as FormArray;
  }

  // Añade un nuevo grupo de ingreso (descripción + monto)
  nuevoIngreso(ingreso?: any): FormGroup {
    return this.fb.group({
      descripcion: [ingreso?.descripcion || ''],
      monto: [ingreso?.monto || null],
    });
  }

  agregarIngreso(): void {
    this.ingresos.push(this.nuevoIngreso());
  }

  // Elimina un ingreso por su índice
  eliminarIngreso(index: number): void {
    this.ingresos.removeAt(index);
  }
  

  // ▼▼▼ CÓDIGO NUEVO AQUÍ (Añadir estos 4 métodos) ▼▼▼

  /**
   * Helper para acceder al FormArray de gastosAnosAnteriores
   */
  get gastosAnosAnteriores(): FormArray {
    return this.metadataForm.get('gastosAnosAnteriores') as FormArray;
  }

  /**
   * Crea un FormGroup para una fila de gasto de año anterior
   */
  nuevoGastoAnoAnteriorGroup(gasto?: any): FormGroup {
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

  /**
   * Añade una nueva fila de gasto de año anterior al FormArray
   */
  agregarGastoAnoAnterior(): void {
    this.gastosAnosAnteriores.push(this.nuevoGastoAnoAnteriorGroup());
  }

  /**
   * Elimina una fila de gasto de año anterior por su índice
   */
  eliminarGastoAnoAnterior(index: number): void {
    // Solo permite eliminar si hay más de una fila
    if (this.gastosAnosAnteriores.length > 1) {
      this.gastosAnosAnteriores.removeAt(index);
    }
  }
  // ▲▲▲ FIN DE CÓDIGO NUEVO ▲▲▲

  // ▼▼▼ --- NUEVOS HELPERS PARA PRESUPUESTO DINÁMICO --- ▼▼▼
  get presupuestoEntidades(): FormArray {
    return this.metadataForm.get('presupuestoEntidades') as FormArray;
  }

  nuevoEntidadPresupuesto(nombre: string = ''): FormGroup {
    return this.fb.group({
      nombreEntidad: [nombre, Validators.required],
      aporteNoMonetario: [null as number | null],
      aporteMonetario: [null as number | null],
    });
  }

  agregarEntidadPresupuesto(nombre: string = ''): void {
    this.presupuestoEntidades.push(this.nuevoEntidadPresupuesto(nombre));
  }

  eliminarEntidadPresupuesto(index: number): void {
    this.presupuestoEntidades.removeAt(index);
  }
  // ▲▲▲ --- FIN DE NUEVOS HELPERS --- ▲▲▲


  onGenerar(): void {
    // Antes de cerrar, asegurarnos de que los montos sean números (si no son null)
    const formValue = this.metadataForm.value;

    formValue.anio = Number(formValue.anio) || 2025;
    // Convertir strings vacíos a null para campos numéricos
    for (const key in formValue) {
      if (typeof formValue[key] === 'string' && formValue[key] === '') {
        formValue[key] = null;
      }
    }

    // Procesar los ingresos
    if (formValue.ingresos) {
      formValue.ingresos = formValue.ingresos
        .filter((ing: any) => ing.descripcion || ing.monto !== null) // Filtra filas completamente vacías
        .map((ing: any) => ({
          descripcion: ing.descripcion,
          monto: ing.monto !== '' ? Number(ing.monto) : null,
        }));
    }

    // ▼▼▼ MODIFICACIÓN AQUÍ ▼▼▼
    // Procesar gastos del año anterior (ahora es un array)
    if (formValue.gastosAnosAnteriores) {
      formValue.gastosAnosAnteriores = formValue.gastosAnosAnteriores
        .map((gasto: any) => {
          // Limpiamos los valores de la fila
          const filaLimpia: any = { year: Number(gasto.year) || new Date().getFullYear() - 1 };
          for (const key in gasto) {
            if (key !== 'year') {
              if (gasto[key] === '' || gasto[key] === null || gasto[key] === undefined) {
                filaLimpia[key] = null;
              } else {
                filaLimpia[key] = Number(gasto[key]);
              }
            }
          }
          return filaLimpia;
        })
        // Filtramos filas que podrían estar vacías (aunque siempre tendrán un año)
        .filter((gasto: any) => gasto.year);
    }
    // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

    // ▼▼▼ --- NUEVA LÓGICA PARA PROCESAR PRESUPUESTO DINÁMICO --- ▼▼▼
    if (this.reportType === 'contrato') {
    if (formValue.presupuestoEntidades) {
      formValue.presupuestoEntidades = formValue.presupuestoEntidades
          .filter(
            (ent: any) =>
              ent.nombreEntidad || ent.aporteNoMonetario !== null || ent.aporteMonetario !== null
          )
          .map((ent: any) => ({
            nombreEntidad: ent.nombreEntidad,
            aporteNoMonetario:
              ent.aporteNoMonetario !== null ? Number(ent.aporteNoMonetario) : null,
            aporteMonetario: ent.aporteMonetario !== null ? Number(ent.aporteMonetario) : null,
        }));
    }
    // Borrar el campo de PIC
      delete formValue.presupuestoTotalPic;
    // ▲▲▲ --- FIN DE LA NUEVA LÓGICA --- ▲▲▲

    } else {
      // Procesar presupuesto FIJO (PIC)
      formValue.presupuestoTotalPic = formValue.presupuestoTotalPic !== null ? Number(formValue.presupuestoTotalPic) : null; // Borrar el campo de Contrato
      delete formValue.presupuestoEntidades;
    }

    this.dialogRef.close(formValue);
  }

  onOmitir(): void {
    this.dialogRef.close({}); 
  }

  /**
   * Al entrar (focus) a un campo de moneda, muestra el número simple.
   * Ej: "23,500.00" -> "23500.00"
   */
  onCurrencyFocus(event: FocusEvent, control: AbstractControl | null): void {
    if (!control) return;
    
    const input = event.target as HTMLInputElement;
    if (control.value !== null) {
      input.value = Number(control.value).toFixed(2);
      input.select();
    }
  }

  /**
   * CORREGIDO: Ahora acepta el AbstractControl específico del FormArray
   */
  onCurrencyBlur(event: FocusEvent, control: AbstractControl | null): void {
    if (!control) return;

    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/,/g, '');
    const numValue = parseFloat(rawValue);

    if (!isNaN(numValue)) {
      control.setValue(numValue); // Guarda el número limpio
      input.value = this.formatter.format(numValue); // Muestra formateado
    } else {
      control.setValue(null); // Borra si no es un número
      input.value = '';
    }
  }
  // ▲▲▲ --- FIN DE LA CORRECCIÓN DE BUG --- ▲▲▲

  
}