import { Routes } from '@angular/router';

// Importa los componentes que quieres mostrar en cada sección
import { GastoFormComponent } from './components/gasto-form/gasto-form';
import { GastoListComponent } from './components/gasto-list/gasto-list';
import { ExcelImporterComponent } from './components/excel-importer/excel-importer';
import { ReportGeneratorComponent } from './components/report-generator/report-generator';
import { PicMetadataFormComponent } from './components/pic-metadata-form/pic-metadata-form';

export const routes: Routes = [
  // Redirección por defecto: si entran a la raíz, llévalos a la lista de gastos
  { path: '', redirectTo: '/gastos', pathMatch: 'full' },
  
  // Define la ruta para cada sección
  { path: 'registrar', component: GastoFormComponent },
  { path: 'gastos', component: GastoListComponent },
  { path: 'importar', component: ExcelImporterComponent },
  { path: 'reportes', component: ReportGeneratorComponent },
  
  { path: 'configurar-pic', component: PicMetadataFormComponent },
  // Una ruta "catch-all" por si el usuario navega a una URL que no existe
  { path: '**', redirectTo: '/gastos' } 
];