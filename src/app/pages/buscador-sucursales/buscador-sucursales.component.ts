import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ObtenerPaisesService } from '../../services/lugares/paises/obtener-paises.service';
import { ObtenerProvinciasService } from '../../services/lugares/provincias/obtener-provincias.service';
import { ObtenerLocalidadesService } from '../../services/lugares/localidades/obtener-localidades.service';
import { ObtenerSucursalesService } from '../../services/lugares/sucursales/obtener-sucursales.service';
import { ObtenerIdiomasService } from '../../services/idioma/obtenerIdiomas/obtener-idiomas.service';
import { SupermercadosService } from '../../services/supermercados/supermercados.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  MatSelect,
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { SupermercadoInterface } from '../../components/interfaces/supermercado';
import {
  filtrosSucursal,
  SucursalInterface,
} from '../../components/interfaces/sucursal';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { alertContent } from '../../components/interfaces/mensajes';

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
    MatMenuModule,
    MatTableModule,
    MatPaginator,
  ],
  templateUrl: './buscador-sucursales.component.html',
  styleUrls: ['./buscador-sucursales.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
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
  supermercados: SupermercadoInterface[] = [];
  sucursales: SucursalInterface[] = [];

  cod_pais = 'AR';
  cod_provincia: string | undefined;
  nro_localidad: string = '';
  nro_supermercado: string[] = [];

  selectedLanguage: string = '';
  selectedLanguageName: string = '';
  idiomas: any[] = [];
  filtrosRuta?: filtrosSucursal;
  alertContent: alertContent = { title: '', text: '' };

  private mensajeConfig: SweetAlertOptions = {
    width: '320px',
    heightAuto: true,
    padding: '0px',
    customClass: {
      popup: 'swal2-small-modal swal2-square-modal',
    },
    confirmButtonText: 'OK', // Valor por defecto, puede ser sobrescrito por traducciones
  };
  

  // Columnas de la tabla
  displayedColumns: string[] = [
    'nom_supermercado',
    'nom_localidad',
    'nom_sucursal',
    'ubicacion',
    'expand',
  ];
  expandedElement: SucursalInterface | null = null;
  dataSource = new MatTableDataSource<SucursalInterface>();
  paginatorVisible: boolean = false;

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator | null) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private buscadorService: ObtenerPaisesService,
    private obtenerProvinciasService: ObtenerProvinciasService,
    private obtenerLocalidadesService: ObtenerLocalidadesService,
    private obtenerSucursalesService: ObtenerSucursalesService,
    private supermercadosService: SupermercadosService,
    private router: Router,
    private route: ActivatedRoute,
    private obtenerIdiomasService: ObtenerIdiomasService
  ) {}

  ngOnInit(): void {
    this.obtenerProvinciasService.getProvincias(this.cod_pais).subscribe(
      (data) => {
        this.provincias = data;
        console.log(this.provincias);
        this.selectedProvincia = null;
        this.selectedLocalidad = null;
      },
      () => {
        if (this.selectedLanguage == 'en')
          this.alertContent = {
            text: 'Cannot get province list',
            title: 'Error',
          };
        else
          this.alertContent = {
            text: 'No se pudo obtener la lista de provincias',
            title: 'Error',
          };

        Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
        });
      }
    );

    this.obtenerIdiomasService.getIdiomas().subscribe(
      (data) => {
        this.idiomas = data;
        console.log('Idiomas cargados:', this.idiomas);
        const idioma = this.idiomas.find(
          (lang) => lang.cod_idioma === this.selectedLanguage
        );
        if (idioma) {
          this.selectedLanguageName = idioma.nom_idioma;
        }
      },
      () => {
        if (this.selectedLanguage == 'en')
          this.alertContent = {
            text: 'Cannot get language list',
            title: 'Error',
          };
        else
          this.alertContent = {
            text: 'No se pudo obtener la lista de idiomas',
            title: 'Error',
          };
        Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
        });
      }
    );

    this.supermercadosService.getSupermercados().subscribe(
      (data: SupermercadoInterface[]) => {
        this.supermercados = data;
        console.log('Supermercados cargados:', this.supermercados);
      },
      () => {
        if (this.selectedLanguage == 'en')
          this.alertContent = {
            text: 'Cannot get supermarket list',
            title: 'Error',
          };
        else
          this.alertContent = {
            text: 'No se pudo obtener la lista de supermercados',
            title: 'Error',
          };
        Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
        });
      }
    );

    const params = this.route.snapshot.queryParams;
    const encodedData = params['data'];

    console.log(encodedData);
    if (encodedData) {
      try {
        const decoded = JSON.parse(atob(encodedData));
        const { cod_pais, cod_provincia, nro_localidad, nro_supermercado } =
          decoded;

        if (cod_pais && cod_provincia && nro_localidad && nro_supermercado) {
          this.nro_localidad = nro_localidad;
          this.selectedLocalidad = nro_localidad;
          this.selectedProvincia = cod_provincia;
          this.cod_provincia = cod_provincia;
          this.nro_supermercado = [String(nro_supermercado)];

          this.getSucursales();
        }
      } catch (error) {
        console.error(
          'Error al decodificar los parametros de las sucursales ',
          error
        );
      }
    }

    this.detectLanguage();
  }

  ngAfterViewInit() {}

  detectLanguage(): void {
    const currentPort = window.location.port;
    this.selectedLanguage = currentPort === '4201' ? 'en' : 'es-AR';
    console.log(this.selectedLanguage);
  }

  changeLanguage(language: string): void {
    this.selectedLanguage = language;
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

  goToHome() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.router.navigate(['/home']);
  }

  goToBranches() {
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
      this.obtenerLocalidadesService
        .getLocalidades(this.cod_pais, this.cod_provincia)
        .subscribe(
          (data) => {
            this.localidades = data;
            this.selectedProvincia = event.value;
            this.selectedLocalidad = null;
            console.log(this.localidades);
          },
          () => {
            if (this.selectedLanguage == 'en')
              this.alertContent = {
                text: 'Cannot get cities list',
                title: 'Error',
              };
            else
              this.alertContent = {
                text: 'No se pudo obtener la lista de localidades',
                title: 'Error',
              };
            Swal.fire({
              ...this.mensajeConfig,
              title: this.alertContent.title,
              text: this.alertContent.text,
              icon: 'error',
            });
          }
        );
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

  saveSucursales() {
    this.isLoading = true;
    this.showSucursales = false;
    this.sucursales = [];

    if (this.nro_supermercado.length === 0) {
      this.isLoading = false;

      if (this.selectedLanguage == 'en') {
        this.alertContent = {
          text: 'You must select a supermarket before search branches',
          title: 'Attention',
        };
      } else
        this.alertContent = {
          text: 'Debe seleccionar un supermercado antes de buscar sucursales',
          title: 'Atención',
        };

      Swal.fire({
        ...this.mensajeConfig,
        title: this.alertContent.title,
        text: this.alertContent.text,
        icon: 'warning',
      });
      return;
    }

    this.getSucursales();
  }

  getSucursales() {
    this.obtenerSucursalesService
      .getSucursales(this.nro_localidad, this.nro_supermercado)
      .subscribe(
        (data: SucursalInterface[]) => {
          this.sucursales = data;
          this.dataSource.data = this.sucursales;
          this.showSucursales = true;
          this.isLoading = false;

          //this.actualizarPaginator();
          // console.log('Sucursales obtenidas:', this.sucursales);
        },
        () => {
          if (this.selectedLanguage == 'en')
            this.alertContent = {
              text: 'Cannot get branches list',
              title: 'Error',
            };
          else
            this.alertContent = {
              text: 'No se pudo obtener la lista de sucursales',
              title: 'Error',
            };
          Swal.fire({
            ...this.mensajeConfig,
            title: this.alertContent.title,
            text: this.alertContent.text,
            icon: 'error',
          });
        }
      );
  }

  formatHorario(horario: string): string[] {
    if (!horario) return [];

    const diasOrdenados = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];

    return horario
      .split(',')
      .map((h) => h.trim())
      .sort((a, b) => {
        const diaA = diasOrdenados.indexOf(a.split(':')[0]);
        const diaB = diasOrdenados.indexOf(b.split(':')[0]);
        return diaA - diaB;
      });
  }
}
