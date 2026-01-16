// src/app/services/api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // <-- AÑADIR

// ... (La interfaz Gasto no cambia) ...
export interface Gasto {
  id: number;
  tipoDocumento?: string;
  numeroDocumento?: string;
  siaf?: string;
  aNombreDe?: string;
  concepto?: string;
  monto?: number;
  especifica?: string;
  monto2?: number;
  especifica2?: string;
  ff?: string;
  mes?: string;
  fechaDevengado?: Date;
  proyecto?: string;
  meta?: string;
  certificacionViatico?: string;
  destino?: string;
  fechaSalida?: Date;
  fechaRetorno?: Date;
}

export interface GastoAnoAnterior {
  year: number;
  bienesCorrientes: number | null;
  bienesCapital: number | null;
  servicios: number | null;
  subvencion: number | null;
  viaticos: number | null;
  encargoInterno: number | null;
}

// ▼▼▼ AÑADIR ESTAS DOS NUEVAS INTERFACES ▼▼▼
export interface IngresoPic {
  descripcion: string;
  monto: number | null;
}

export interface PicMetadataDto {
  projectName: string;
  investigador?: string;
  tesista?: string;
  asesor?: string;
  duracion?: string;
  facultad?: string;
  resolucion?: string;
  tituloProyecto?: string;
  codigoProyecto?: string;
  presupuestoTotal?: number | null;
  ingresos?: IngresoPic[];
  gastosAnosAnteriores?: GastoAnoAnterior[]; // Reutilizamos la interfaz que ya tenías
}
// ▲▲▲ FIN DE LAS NUEVAS INTERFACES ▲▲▲

// ▼▼▼ AÑADIR ESTA INTERFAZ ▼▼▼
// Define la estructura de los metadatos opcionales
export interface ReportMetadata {
  tituloProyecto?: string;
  codigoProyecto?: string;
  investigador?: string;
  rr_investigador?: string;
  fechaInicio?: string;
  duracion?: string;
  fechaCulminacion?: Date;
  anio?: number;
  ingresos?: {
  descripcion: string;
  monto: number;
  }[];

  // ▼▼▼ --- MODIFICACIÓN AQUÍ --- ▼▼▼
  // Se añade el nuevo array dinámico
  presupuestoEntidades?: {
    nombreEntidad: string;
    aporteNoMonetario: number | null;
    aporteMonetario: number | null;
  }[];
  // ▲▲▲ --- FIN DE LA MODIFICACIÓN --- ▲▲▲
  
  // 2. Modificamos esta propiedad para que sea un array
  gastosAnosAnteriores?: GastoAnoAnterior[]; // Cambiado de 'gastosAnoAnterior' (singular) a 'gastosAnosAnteriores' (plural) y tipo array


}
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

@Injectable({
  providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // --- MÉTODOS EXISTENTES (sin cambios) ---
    getGastos(): Observable<Gasto[]> {
      return this.http.get<Gasto[]>(`${this.apiUrl}/gastos`);
    }

    crearGasto(gasto: Partial<Gasto>): Observable<Gasto> {
      return this.http.post<Gasto>(`${this.apiUrl}/gastos`, gasto);
    }

    importarGastos(gastos: Partial<Gasto>[]): Observable<any> {
      return this.http.post(`${this.apiUrl}/gastos/import`, gastos);
    }

    // --- MÉTODOS DE PROYECTOS (MODIFICADOS) ---
  
  /**
   * (Obsoleto, pero lo dejamos)
   * Obtiene TODOS los proyectos
   */
  getProjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projects`);
  }

  /**
   * NUEVO: Obtiene solo proyectos CONTRATO
   */
  getContratoProjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projects/contrato`);
  }

  /**
   * NUEVO: Obtiene la lista maestra de TODOS los PICs (de mapaModalidadesPIC).
   */
  getMasterPicProjectList(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projects/pic-master-list`);
  }
  
  /**
   * NUEVO: Obtiene solo proyectos PIC
   */
  getPicProjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projects/pic`);
  }

    // --- MÉTODO MODIFICADO: DESCARGAR REPORTE ---
    // ▼▼▼ MODIFICACIÓN AQUÍ ▼▼▼
    downloadContratoReport(
      projectName: string,
      metadata: ReportMetadata,
    ): Observable<Blob> {
      // Creamos el cuerpo de la solicitud
      const body = {
        projectName: projectName,
        metadata: metadata,
      };

      

      // Cambiamos de GET a POST y enviamos el 'body'
      return this.http.post(`${this.apiUrl}/reports/contrato`, body, {
        responseType: 'blob', // ¡Esto sigue siendo muy importante!
      });
    }
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  /**
   * NUEVO
   * Descarga el reporte para un GRUPO PIC
   */
  downloadPicReport(
    modalityName: string, // Ahora es el nombre de la modalidad
    // ¡Ya no hay metadata!
  ): Observable<Blob> {
    const body = {
      modalityName: modalityName, // El backend debe esperar 'modalityName'
    };
    // Llama al nuevo endpoint específico
    return this.http.post(`${this.apiUrl}/reports/pic`, body, {
      responseType: 'blob',
    });
  }

  // ▼▼▼ AÑADIR ESTE NUEVO MÉTODO ▼▼▼
  /**
   * Genera un reporte global con todos los gastos agrupados por Meta.
   */
  downloadReportByMeta(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/by-meta`, {
      responseType: 'blob', // ¡Muy importante!
    });
  }
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲


  /**
   * Obtiene la metadata guardada para un proyecto PIC específico.
   */
  getPicMetadata(projectName: string): Observable<PicMetadataDto | null> {
    // Codificamos el nombre del proyecto para que sea seguro en una URL
    const encodedProjectName = encodeURIComponent(projectName);
    return this.http.get<PicMetadataDto | null>(
      `${this.apiUrl}/pic-metadata/${encodedProjectName}`,
    );
  }

  /**
   * Guarda o actualiza la metadata para un proyecto PIC específico.
   */
  savePicMetadata(
    projectName: string,
    data: PicMetadataDto,
  ): Observable<PicMetadataDto> {
    const encodedProjectName = encodeURIComponent(projectName);
    return this.http.post<PicMetadataDto>(
      `${this.apiUrl}/pic-metadata/${encodedProjectName}`,
      data,
    );
  }
// ▲▲▲ FIN DE LAS NUEVAS FUNCIONES ▲▲▲

/**
   * Actualiza un gasto existente.
   */
  updateGasto(id: number, gasto: Gasto): Observable<Gasto> {
    return this.http.put<Gasto>(`${this.apiUrl}/gastos/${id}`, gasto);
  }

  /**
   * Elimina un gasto por su ID.
   */
  deleteGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/gastos/${id}`);
  }

  /**
   * Elimina TODOS los gastos.
   */
  deleteAllGastos(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/gastos/all`);
  }

  
    /**
 * Descarga reporte de un proyecto para un mes específico
 */
downloadProjectMonthReport(
  projectName: string,
  month: string,
  year?: number,
): Observable<Blob> {
  const body = {
    projectName: projectName,
    month: month,
    year: year || 2025,
  };

  return this.http.post(`${this.apiUrl}/reports/project-month`, body, {
    responseType: 'blob',
  });
}

/**
 * Descarga reporte anual de un proyecto (12 hojas mensuales)
 */
downloadProjectAnnualReport(
  projectName: string,
  year?: number,
): Observable<Blob> {
  const body = {
    projectName: projectName,
    year: year || 2025,
  };

  return this.http.post(`${this.apiUrl}/reports/project-annual`, body, {
    responseType: 'blob',
  });
}

}