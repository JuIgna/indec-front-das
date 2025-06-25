import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ObtenerPaisesService } from '../../services/lugares/paises/obtener-paises.service';
import { ObtenerProvinciasService } from '../../services/lugares/provincias/obtener-provincias.service';
import { ObtenerLocalidadesService } from '../../services/lugares/localidades/obtener-localidades.service';
import { ObtenerSucursalesService } from '../../services/lugares/sucursales/obtener-sucursales.service';
import { ObtenerIdiomasService } from '../../services/idioma/obtenerIdiomas/obtener-idiomas.service'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { SupermercadosService } from '../../services/supermercados/supermercados.service';
import { SupermercadoInterface } from '../../components/interfaces/supermercado';

@Component({
  selector: 'app-buscador-sucursales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  templateUrl: './buscador-sucursales.component.html',
  styleUrls: ['./buscador-sucursales.component.css']
})
export class BuscadorSucursalesComponent implements OnInit {
  selectedPais: string | null = null;
  selectedProvincia: string | null = null;
  selectedLocalidad: string | null = null;  
  isSidebarOpen = false;
  isLoading = false;
  showSucursales = false;

  paises: any[] = [];
  provincias: any[] = [];
  localidades: any[] = [];
  supermercados: SupermercadoInterface[] = []
  sucursales: any[] = [];

  cod_pais = 'AR';
  cod_provincia: string | undefined;
  nro_localidad: string | undefined;
  nro_supermercado: string | undefined;

  selectedLanguage: string = "";
  selectedLanguageName: string = "";
  idiomas: any[] = [];

  constructor(
    private buscadorService: ObtenerPaisesService,
    private obtenerProvinciasService: ObtenerProvinciasService,
    private obtenerLocalidadesService: ObtenerLocalidadesService,
    private obtenerSucursalesService: ObtenerSucursalesService,
    private supermercadosService: SupermercadosService,
    private router: Router,
    private obtenerIdiomasService: ObtenerIdiomasService,
  ) {}

  ngOnInit(): void {
    this.obtenerProvinciasService.getProvincias(this.cod_pais).subscribe(
      (data) => {
        this.provincias = data;// Reiniciar selección de localidad
        console.log(this.provincias);
        this.selectedProvincia = null; // Reiniciar selección de provincia
        this.selectedLocalidad = null; // Reiniciar selección de localidad
      },
      (error) => {
        console.error('Error al obtener las provincias:', error);
        alert('No se pudo obtener la lista de provincias. Verifique la consola para más detalles.');
      }
    );

    this.obtenerIdiomasService.getIdiomas().subscribe(
      (data) => {
        this.idiomas = data;  // Guardar idiomas en la lista
        console.log('Idiomas cargados:', this.idiomas);

        
          const idioma = this.idiomas.find(lang => lang.cod_idioma === this.selectedLanguage);
          if (idioma) {
            this.selectedLanguageName = idioma.nom_idioma;
          }
        
      },
      (error) => {
        console.error('Error al obtener idiomas:', error);
        alert('No se pudo obtener la lista de idiomas.');
      }
    );

    this.supermercadosService.getSupermercados().subscribe(
      (data: SupermercadoInterface[]) => {
        this.supermercados = data;
        console.log('Supermercados cargados:', this.supermercados);
      },
      (error) => {
        console.error('Error al obtener supermercados:', error);
        alert('No se pudo obtener la lista de supermercados.');
      }

    )



    this.detectLanguage();
  }

  detectLanguage(): void {
    const currentPort = window.location.port;
    this.selectedLanguage = currentPort === '4201' ? 'en' : 'es-AR';
    console.log(this.selectedLanguage);
  }


  // Cambia el idioma de la aplicación y redirige al puerto correspondiente
  changeLanguage(language: string): void {
    this.selectedLanguage = language;

    // Determina el puerto según el idioma
    const currentHost = window.location.hostname;
    const newPort = language === 'en' ? '4201' : '4200';

    if (window.location.port !== newPort) {
      window.location.href = `${window.location.protocol}//${currentHost}:${newPort}`;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeMenus() {
    this.isSidebarOpen = false;
  }

  goToHome() { // Oculta el contenedor
    this.isSidebarOpen = !this.isSidebarOpen;
    this.router.navigate(['/home']);
  }
goToBranches() {// Oculta el contenedor
  this.isSidebarOpen = !this.isSidebarOpen;
  this.router.navigate(['/home/buscador-sucursales']);
}

goToPriceComparator() {
  this.isSidebarOpen = !this.isSidebarOpen;
  this.router.navigate(['/home/comparador-productos']);
}

  onProvinciaChange(event: MatSelectChange) {
    console.log('Provincia seleccionada:', event.value);
    this.cod_provincia = event.value;
    console.log(this.cod_provincia);

    if (this.cod_pais && this.cod_provincia) {
      this.obtenerLocalidadesService.getLocalidades(this.cod_pais, this.cod_provincia).subscribe(
      (data) => {
        this.localidades = data;
        this.selectedProvincia = event.value;
        this.selectedLocalidad = null; // Reiniciar selección de localidad
        console.log(this.localidades);
      },
      (error) => {
        console.error('Error al obtener las localidades:', error);
        alert('No se pudo obtener la lista de localidades. Verifique la consola para más detalles.');
      }
      );
    } else {
      console.error('El código de país o provincia no está definido');
    }
  }

  onLocalidadChange(event: MatSelectChange) {
    this.nro_localidad = event.value;
    console.log(this.nro_localidad);
    this.selectedLocalidad = event.value;
  }

  onSupermercadoChange(event: MatSelectChange) {
    this.nro_supermercado = event.value;
    console.log(this.nro_supermercado);
  } 

  sucursalesAgrupadas: { [key: string]: any[] } = {};

  mostrarSucursales() {
    this.isLoading = true;
    
    if (this.nro_localidad) {
        this.obtenerSucursalesService.getSucursales(this.nro_localidad).subscribe(
            (data) => {
                // Agrupar sucursales por supermercado
                this.sucursalesAgrupadas = data.reduce((acc, sucursal) => {
                    const nombreSupermercado = sucursal.nom_supermercado;
                    
                    if (!acc[nombreSupermercado]) {
                        acc[nombreSupermercado] = [];
                    }

                    acc[nombreSupermercado].push({
                        ...sucursal,
                        showMore: false // Agregamos el flag para expandir info
                    });

                    return acc;
                }, {});

                this.showSucursales = true;
                this.isLoading = false;
                console.log(this.sucursalesAgrupadas);
            },
            (error) => {
                console.error('Error al obtener las sucursales:', error);
                alert('No se pudo obtener la lista de sucursales. Verifique la consola para más detalles.');
                this.isLoading = false;
            }
        );
    } else {
        alert('El nro de localidad es inválido');
    }
}


  toggleInfo(sucursal: any): void {
    sucursal.showMore = !sucursal.showMore;
}

formatHorario(horario: string): string[] {
  if (!horario) return [];

  const diasOrdenados = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return horario
      .split(',')
      .map(h => h.trim()) // Limpia espacios
      .sort((a, b) => {
          const diaA = diasOrdenados.indexOf(a.split(':')[0]);
          const diaB = diasOrdenados.indexOf(b.split(':')[0]);
          return diaA - diaB;
      });
}

}
