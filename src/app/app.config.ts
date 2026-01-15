// src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Para la API
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Para Material
import { routes } from './app.routes';
// ▼▼▼ AÑADIR ESTAS IMPORTACIONES ▼▼▼
// ▼▼▼ AÑADIR/MODIFICAR ESTAS IMPORTACIONES ▼▼▼
import { MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲
import { provideNativeDateAdapter } from '@angular/material/core';
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲
import { Injectable } from '@angular/core';
// ▼▼▼ AÑADIR ESTAS IMPORTACIONES ▼▼▼
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { NativeDateAdapter } from '@angular/material/core';
import { APP_BASE_HREF, HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import localeEsPE from '@angular/common/locales/es-PE';
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

// ▼▼▼ AÑADIR ESTA LÓGICA ▼▼▼

// 1. Registrar el locale 'es-PE' globalmente
registerLocaleData(localeEsPE);

/**
 * Adaptador de Fecha Personalizado
 * Esto le dice a Angular Material CÓMO MOSTRAR la fecha en el input
 * Sobrescribimos el método 'format' para forzar 'DD/MM/YYYY'.
 */
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: object): string {
    // Forzar el formato DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    
  {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    { provide: APP_BASE_HREF, useValue: './' },
    // ▼▼▼ REEMPLAZAR EL 'provideNativeDateAdapter()' QUE PUEDA EXISTIR ▼▼▼
    
    // 3. Proveer el locale 'es-PE' a toda la app
    { provide: LOCALE_ID, useValue: 'es-PE' },
    
    // 4. Proveer el locale a Angular Material (para el calendario popup)
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    
    // 5. Proveer nuestro adaptador personalizado (para el input)
    { provide: DateAdapter, useClass: CustomDateAdapter },
    
    // Ya no necesitamos provideNativeDateAdapter()
    
    // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

    // 6. ▼▼▼ AÑADIR ESTE PROVEEDOR QUE FALTA ▼▼▼
    // Esto es necesario para que el componente <mat-datepicker> sepa CÓMO
    // renderizar el calendario (los formatos nativos DD/MM/YYYY).
    // El error "No provider found for MAT_DATE_FORMATS" se debe a que esto falta.
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
    // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲


  ]
};