import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/productos/obtenerProductos/product.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CompararPreciosService } from '../../services/productos/compararPrecios/comparar-precios.service';
import { FormsModule } from '@angular/forms';
import { ObtenerProvinciasService } from '../../services/lugares/provincias/obtener-provincias.service';
import { ObtenerLocalidadesService } from '../../services/lugares/localidades/obtener-localidades.service';
import { BuscadorProductosPipe } from '../../components/pipes/buscador-productos.pipe';
import { EstadoProducto, Producto, productosComparados } from '../../components/interfaces/producto';
import { ObtenerIdiomasService } from '../../services/idioma/obtenerIdiomas/obtener-idiomas.service';
import { ObtenerTraduccionService } from '../../services/idioma/obtenerTraduccion/obtener-traduccion.service';
import { SupermercadoInterface } from '../../components/interfaces/supermercado';
import { SupermercadosService } from '../../services/supermercados/supermercados.service';
import { ObtenerSucursalesService } from '../../services/lugares/sucursales/obtener-sucursales.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { provincia } from '../../components/interfaces/provincia';
import { localidades } from '../../components/interfaces/localidades';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filtrosSucursal, SucursalInterface } from '../../components/interfaces/sucursal';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { alertContent } from '../../components/interfaces/mensajes';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-comparador-productos-precios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BuscadorProductosPipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatChipsModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  providers: [ProductService],
  templateUrl: './comparador-productos-precios.component.html',
  styleUrls: ['./comparador-productos-precios.component.css'],
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
export class ComparadorProductosPreciosComponent implements OnInit {
  // flags de control
  isLoadingProductos: boolean = false;
  isLoadingComparacion: boolean = false;
  isLoadingSucursales: boolean = false; // nuevo: para cargando de sucursales
  isSupermercadoGanador: boolean = false;
  mostrarComparacion: boolean = false;
  seCompararonProductos: boolean = false;
  showLocalidades: boolean = false;
  showSucursales: boolean = false;
  mostrarModal: boolean = false;
  isSidebarOpen: boolean = false;
  isCartOpen: boolean = false;

  supermercados: string[] = [];
  todosSupermercados: SupermercadoInterface[] = [];
  supermercadoMasBarato: string = '';
  totalesSupermercado: any = {};
  paisBase: string = 'AR';
  provinciaSelected: string | null = null;
  provincias: provincia[] = [];
  localidadSelected: number | null = null;
  localidadGanador: string = '';
  nrosSupermercadoGanador: string[] = [];
  sucursales: SucursalInterface[] = [];

  cartItems: Producto[] = [];
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  localidades: localidades[] = [];
  searchTerm: string = '';
  productosComparados: productosComparados[] = [];
  categoriasDisponibles: string[] = [];
  marcasDisponibles: string[] = [];
  rubrosDisponibles: string[] = [];
  tiposDisponibles: string[] = [];
  filtroSeleccionado = { categoria: '', marca: '', rubro: '', tipo: '', };
  selectedLanguage: string = '';
  selectedLanguageName: string = '';
  idiomas: any[] = [];
  productoSeleccionado: any = null;

  alertContent: alertContent = { title: '', text: '' };
  private mensajeConfig: SweetAlertOptions = {
    width: '320px',
    heightAuto: false,
    padding: '0px',
    customClass: {
      popup: 'swal2-small-modal swal2-square-modal',
    },
    confirmButtonText: 'OK', // valor default que si necesitamos lo cambiamos por traducciones
  };
  // variables para tablas
  tablaComparadoraColumns: string[] = ['producto'];
  productosComparadosSource = new MatTableDataSource(this.productosComparados);
  sucursalesColumns: string[] = ['nom_supermercado', 'nom_localidad', 'nom_sucursal', 'ubicacion', 'expand'];
  sucursalExpanded: SucursalInterface | null = null;
  sucursalesSource = new MatTableDataSource<SucursalInterface>();
  // paginator: opcional


  constructor(
    private productService: ProductService,
    private router: Router,
    private obtenerIdiomasService: ObtenerIdiomasService,
    private obtenerTraduccionService: ObtenerTraduccionService,
    private obtenerProvinciasService: ObtenerProvinciasService,
    private obtenerLocalidadesService: ObtenerLocalidadesService,
    private compararPreciosService: CompararPreciosService,
    private supermercadosService: SupermercadosService,
    private sucursalesService: ObtenerSucursalesService
  ) { }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.getProductos();
    this.getIdiomas();
    this.getProvincias();
    this.getSupermercados();
    this.detectLanguage();

    const storedCart = sessionStorage.getItem('cartItems');
    if (storedCart) {
      this.cartItems = JSON.parse(storedCart);
    }

    const provinciaSession = sessionStorage.getItem('cod_provincia');
    if (provinciaSession) {
      this.provinciaSelected = provinciaSession;
      this.getLocalidades();
    }
  }

  getSupermercados(): void {
    this.supermercadosService.getSupermercados().subscribe(
      (data) => {
        this.todosSupermercados = data;
        console.log('Supermercados Cargados', this.todosSupermercados);
      },
      () => {
        if (this.selectedLanguage == 'en') this.alertContent = { text: 'Cannot get supermarket list', title: 'Error' };
        else this.alertContent = { text: 'No se pudo obtener la lista de supermercados', title: 'Error' };

        Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
        });
      }
    );

  }
  getProductos(): void {
    this.isLoadingProductos = true;
    this.productService.getProducts().subscribe(
      (data) => {
        this.products = data;
        this.filteredProducts = this.products;
        console.log(this.products);
        this.actualizarOpcionesFiltro();
        // this.isLoadingProductos = false;
        setTimeout(() => {
          this.isLoadingProductos = false;
        }, 1200);
        this.cargarTraducciones(this.selectedLanguage);
      },
      () => {
        if (this.selectedLanguage == 'en') this.alertContent = { text: 'Cannot get products list', title: 'Error' };
        else this.alertContent = { text: 'No se pudo obtener la lista de productos', title: 'Error' };

        Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
        });
        this.isLoadingProductos = false;
      }
    );
  }

  getProvincias(): void {
    this.obtenerProvinciasService.getProvincias(this.paisBase).subscribe(
      (data) => {
        this.provincias = data;
        console.log('Provincias cargadas', this.provincias);
      },
      () => {
        if (this.selectedLanguage == 'en') this.alertContent = { text: 'Cannot get province list', title: 'Error' };
        else this.alertContent = { text: 'No se pudo obtener la lista de provincias', title: 'Error' };

        Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
        });
      }
    );
  }

  getLocalidades(): void {
    if (this.provinciaSelected) {
      this.obtenerLocalidadesService
        .getLocalidades(this.paisBase, this.provinciaSelected)
        .subscribe(
          (data) => {
            this.localidades = data;
            this.showLocalidades = true;
            // this.localidadSelected = null;
            // sessionStorage.removeItem('nro_localidad');
            console.log('Localidades cargadas:', this.localidades);
            const localidadSession = sessionStorage.getItem('nro_localidad');

            if (localidadSession) {
              // Verificamos que la localidad guardada exista en las localidades cargadas
              const localidadNumero = parseInt(localidadSession);

              const localidadExiste = this.localidades.some(
                loc => loc.nro_localidad === localidadNumero
              );

              if (localidadExiste) {
                this.localidadSelected = localidadNumero;
                console.log('Localidad restaurada desde cache (número):', this.localidadSelected);
              } else {
                // Si la localidad guardada no existe en la nueva provincia, la limpiamos
                this.localidadSelected = null;
                sessionStorage.removeItem('nro_localidad');
              }
            } else {
              this.localidadSelected = null;
            }

            console.log('Localidades cargadas:', this.localidades);
            console.log('Localidad restaurada desde cache:', this.localidadSelected);
            console.log("provincia guardada cache", sessionStorage.getItem('cod_provincia'));
          },
          (error) => {
            if (this.selectedLanguage == 'en') this.alertContent = { text: 'Cannot get cities list', title: 'Error' };
            else this.alertContent = { text: 'No se pudo obtener la lista de localidades', title: 'Error' };

            Swal.fire({
              ...this.mensajeConfig,
              title: this.alertContent.title,
              text: this.alertContent.text,
              icon: 'error',
            });
          }
        );
    } else {
      if (this.selectedLanguage == 'en') this.alertContent = { text: 'No esta definida la provincia', title: 'Error' };
      else this.alertContent = { text: 'Province not defined', title: 'Error' };

      Swal.fire({
        ...this.mensajeConfig,
        title: this.alertContent.title,
        text: this.alertContent.text,
        icon: 'error',
      });
    }
  }

  getSucursales() {
    this.localidadGanador = this.localidadSelected?.toString() ?? '';
    let nroSupermercadoGanador: string[] = [];
    nroSupermercadoGanador.push(this.supermercadoMasBarato);

    this.isLoadingSucursales = true; // Mostrar loading

    this.sucursalesService
      .getSucursales(this.localidadGanador, this.nrosSupermercadoGanador)
      .subscribe(
        (data: SucursalInterface[]) => {
          this.sucursales = data;
          this.sucursalesSource.data = this.sucursales;
          this.showSucursales = true;
          if (this.paginator) {
            this.sucursalesSource.paginator = this.paginator;
          }
          this.isLoadingSucursales = false;
        },
        (error) => {
          console.error('Error al obtener sucursales:', error);
          if (this.selectedLanguage == 'en') {
            this.alertContent = {
              text: 'Cannot get branches list',
              title: 'Error'
            };
          } else {
            this.alertContent = {
              text: 'No se pudo obtener la lista de sucursales',
              title: 'Error'
            };
          }
          Swal.fire({
            ...this.mensajeConfig,
            title: this.alertContent.title,
            text: this.alertContent.text,
            icon: 'error'
          });
          this.isLoadingSucursales = false;
        }
      );
  }

  // Método para alternar la expansión de sucursales
  toggleSucursal(sucursal: SucursalInterface) {
    this.sucursalExpanded = this.sucursalExpanded === sucursal ? null : sucursal;
  }

  getIdiomas(): void {
    this.obtenerIdiomasService.getIdiomas().subscribe(
      (data) => {
        this.idiomas = data;
        // console.log('Idiomas cargados:', this.idiomas);
        const idioma = this.idiomas.find(
          (lang) => lang.cod_idioma === this.selectedLanguage
        );
        if (idioma) {
          this.selectedLanguageName = idioma.nom_idioma;
          if (this.selectedLanguage === 'en') {
            this.cargarTraducciones(this.selectedLanguage);
          }
        }
      },
      () => {
        if (this.selectedLanguage == 'en') this.alertContent = { text: 'Cannot get languages list', title: 'Error' };
        else this.alertContent = { text: 'No se pudo obtener la lista de idiomas', title: 'Error' };

        Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
        });
      }
    );

  }



  isCartEmpty(): boolean {
    if (this.cartItems.length === 0) {
      if (this.selectedLanguage == 'en') this.alertContent = { text: 'Cannot do comparison, cart is empty', title: 'Attention' };
      else this.alertContent = { text: 'Debe agregar productos al carrito', title: 'Atención' };

      Swal.fire({
        ...this.mensajeConfig,
        title: this.alertContent.title,
        text: this.alertContent.text,
        icon: 'warning',
      });
      return true;
    }
    return false;
  }

  iniciarComparacion(): void {
    if (this.isCartEmpty()) return;

    this.vaciarTablaSucursales();
    this.isCartOpen = false;
    this.mostrarComparacion = true;
    this.showLocalidades = false;
    this.productosComparados = [];
    this.supermercados = [];
    this.totalesSupermercado = {};
    this.supermercadoMasBarato = '';
    // this.provinciaSelected = null;
    // this.localidadSelected = null;

    this.provinciaSelected = sessionStorage.getItem('cod_provincia');
    if (this.provinciaSelected) this.getLocalidades();

    // this.cargarSeleccionGuardada();
  }

  volverAProductos(): void {
    this.mostrarComparacion = false;
    this.showLocalidades = false;
    this.productosComparados = [];
    this.supermercados = [];
    this.totalesSupermercado = {};
    this.supermercadoMasBarato = '';
    this.tablaComparadoraColumns = ['producto'];
    this.getProductos();
  }

  // Método auxiliar para determinar si es el precio más bajo
  esPrecioMasBajo(
    estadoProducto: EstadoProducto,
    producto: productosComparados
  ): boolean {
    if (!estadoProducto || estadoProducto.precio === undefined) {
      return false;
    }

    const precioMasBajo = this.obtenerPrecioMasBajo(producto);
    return (
      precioMasBajo !== undefined && estadoProducto.precio === precioMasBajo
    );
  }

  cargarSeleccionGuardada(): void {
    const provinciaGuardada = sessionStorage.getItem('cod_provincia');
    if (provinciaGuardada) {
      this.provinciaSelected = provinciaGuardada;
      this.getLocalidades();
      this.showLocalidades = true;
    }
  }

  detectLanguage(): void {
    const currentPort = window.location.port;
    this.selectedLanguage = currentPort === '4201' ? 'en' : 'es-AR';
    console.log(this.selectedLanguage);
  }

  changeLanguage(language: string): void {
    this.selectedLanguage = language;
    console.log(this.selectedLanguage);
    const currentHost = window.location.hostname;
    const newPort = language === 'en' ? '4201' : '4200';
    console.log(
      'Nueva dirección:',
      `${window.location.protocol}//${currentHost}:${newPort}${window.location.pathname}`
    );
    this.limpiarCarritoSinPregunta();
    if (window.location.port !== newPort) {
      window.location.href = `${window.location.protocol}//${currentHost}:${newPort}`;
    }
  }

  traducciones: any = {};

  cargarTraducciones(lang: string) {
    this.selectedLanguage = lang;
    localStorage.setItem('lang', lang);
    this.obtenerTraduccionService.getTraducciones(lang).subscribe(
      (data) => {
        this.traducciones = data;
        console.log('Traducción cargada:', this.traducciones);
        this.products = this.products.map((product) => {
          return {
            ...product,
            nom_categoria:
              this.traducciones.categorias.find(
                (cat: { nro_categoria: number }) =>
                  cat.nro_categoria === product.nro_categoria
              )?.nom_categoria || product.nom_categoria,
            nom_rubro:
              this.traducciones.rubros.find(
                (rubro: { nro_rubro: number }) =>
                  rubro.nro_rubro === product.nro_rubro
              )?.nom_rubro || product.nom_rubro,
            nom_tipo_producto:
              this.traducciones.tipos_productos.find(
                (tipo: { nro_tipo_producto: number }) =>
                  tipo.nro_tipo_producto === product.nro_tipo_producto
              )?.nom_tipo_producto || product.nom_tipo_producto,
          };
        });
        this.actualizarOpcionesFiltro();
      },
      () => {
        if (this.selectedLanguage == 'en') this.alertContent = { text: 'Cannot get translation', title: 'Error' };
        else this.alertContent = { text: 'No se pudo obtener la traducción', title: 'Error' };

        Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
        });

      }
    );
  }

  private guardarCarritoEnCache() {
    sessionStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  agregarAlCarrito(product: any) {
    if (!this.productoEnCarrito(product)) {
      this.cartItems = [...this.cartItems, product];
      this.guardarCarritoEnCache();
      console.log('Producto agregado al carrito:', product);
    } else {
      if (this.selectedLanguage == 'en') this.alertContent = { text: 'This product is in the cart', title: 'Attention' };
      else this.alertContent = { text: 'Este producto ya está en el carrito', title: 'Atención' };
      Swal.fire({
        ...this.mensajeConfig,
        title: this.alertContent.title,
        text: this.alertContent.text,
        icon: 'info',
      });
    }
  }

  borrarDelCarrito(product: any) {
    if (this.selectedLanguage == 'en') this.alertContent = { text: 'Are you sure you want to remove ' + product.nom_producto + ' from the cart?', title: 'Attention' };
    else this.alertContent = { text: '¿Seguro que quieres eliminar ' + product.nom_producto + ' del carrito?', title: 'Atención' };
    Swal.fire({
      ...this.mensajeConfig,
      title: this.alertContent.title,
      text: this.alertContent.text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.selectedLanguage == 'en' ? 'Yes, remove' : 'Sí, quitar',
      cancelButtonText: this.selectedLanguage == 'en' ? 'Cancel' : 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartItems = this.cartItems.filter(
          (item) => item.cod_barra !== product.cod_barra
        );
        this.guardarCarritoEnCache();
        console.log('Carrito Actualizado:', this.cartItems);
      }
    });

  }

  limpiarCarrito() {
    if (this.selectedLanguage == 'en') this.alertContent = { text: 'Are you sure you want to clear the cart?', title: 'Attention' };
    else this.alertContent = { text: '¿Seguro que quieres limpiar todo el carrito?', title: 'Atención' };
    Swal.fire({
      ...this.mensajeConfig,
      title: this.alertContent.title,
      text: this.alertContent.text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.selectedLanguage == 'en' ? 'Yes, clear' : 'Sí, limpiar',
      cancelButtonText: this.selectedLanguage == 'en' ? 'Cancel' : 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartItems = [];
        this.guardarCarritoEnCache();
        console.log('Carrito limpio:', this.cartItems);
      }
    });
  }

  limpiarCarritoSinPregunta() {
    this.cartItems = [];
    this.guardarCarritoEnCache();
    console.log('Carrito limpio:', this.cartItems);
  }

  actualizarOpcionesFiltro() {
    this.categoriasDisponibles = [
      ...new Set(this.products.map((p) => p.nom_categoria)),
    ];
    this.marcasDisponibles = [
      ...new Set(this.products.map((p) => p.nom_marca)),
    ];
    this.rubrosDisponibles = [
      ...new Set(this.products.map((p) => p.nom_rubro)),
    ];
    this.tiposDisponibles = [
      ...new Set(this.products.map((p) => p.nom_tipo_producto)),
    ];
  }

  filtrarProductos() {
    let filtrados = [...this.products];
    if (this.filtroSeleccionado.categoria) {
      filtrados = filtrados.filter(
        (p) => p.nom_categoria === this.filtroSeleccionado.categoria
      );
    }
    if (this.filtroSeleccionado.marca) {
      filtrados = filtrados.filter(
        (p) => p.nom_marca === this.filtroSeleccionado.marca
      );
    }
    if (this.filtroSeleccionado.rubro) {
      filtrados = filtrados.filter(
        (p) => p.nom_rubro === this.filtroSeleccionado.rubro
      );
    }
    if (this.filtroSeleccionado.tipo) {
      filtrados = filtrados.filter(
        (p) => p.nom_tipo_producto === this.filtroSeleccionado.tipo
      );
    }
    this.filteredProducts = filtrados;
    this.categoriasDisponibles = [
      ...new Set(filtrados.map((p) => p.nom_categoria)),
    ];
    this.marcasDisponibles = [...new Set(filtrados.map((p) => p.nom_marca))];
    this.rubrosDisponibles = [...new Set(filtrados.map((p) => p.nom_rubro))];
    this.tiposDisponibles = [
      ...new Set(filtrados.map((p) => p.nom_tipo_producto)),
    ];
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) this.isCartOpen = false;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) this.isSidebarOpen = false;
    console.log('Carrito actual en HeaderComponent:', this.cartItems);
  }

  closeMenus() {
    this.isSidebarOpen = false;
    this.isCartOpen = false;
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.products.filter((product) =>
      product.nom_producto.toLowerCase().includes(searchTerm)
    );
  }

  onProvinciaChange(event: MatSelectChange): void {
    const nuevaProvincia = event.value;

    // Si cambió la provincia, limpiar la localidad
    if (this.provinciaSelected !== nuevaProvincia) {
      this.localidadSelected = null;
      sessionStorage.removeItem('nro_localidad');
    }

    this.provinciaSelected = nuevaProvincia;
    sessionStorage.setItem('cod_provincia', this.provinciaSelected || '');
    this.productosComparados = [];
    this.vaciarTablaSucursales();
    this.seCompararonProductos = false;

    console.log('Provincia seleccionada:', this.provinciaSelected);
    if (this.paisBase && this.provinciaSelected) {
      this.getLocalidades();
    }
  }

  onLocalidadChange(event: MatSelectChange): void {
    this.localidadSelected = event.value;
    sessionStorage.setItem('nro_localidad', this.localidadSelected?.toString() || '');
    console.log('Localidad seleccionada:', this.localidadSelected);
    this.productosComparados = [];
    this.seCompararonProductos = false;
    this.vaciarTablaSucursales();
    // if (this.localidadSelected) {
    //   this.compararProductos();
    // }
  }

  compararProductos(): void {
    if (this.isCartEmpty()) return;

    if (!this.localidadSelected) {
      if (this.selectedLanguage == 'en') this.alertContent = { text: 'You must select a city before compare prices', title: 'Attention' };
      else this.alertContent = { text: 'Debe seleccionar una localidad antes de comparar precios', title: 'Atención' };
      Swal.fire({
        ...this.mensajeConfig,
        title: this.alertContent.title,
        text: this.alertContent.text,
        icon: 'info',
      });
      return;
    }

    this.isLoadingComparacion = true;
    this.supermercadoMasBarato = '';
    this.isSupermercadoGanador = false;

    const codigosBarra = this.cartItems.map((item) => item.cod_barra);
    console.log(
      'Comparando Productos con códigos de barra:',
      codigosBarra,
      'y localidad:',
      this.localidadSelected
    );

    const localidadParaAPI = this.localidadSelected.toString();

    this.compararPreciosService
      .getCompararPrecios(codigosBarra, localidadParaAPI)
      .subscribe(
        (data) => {
          if (!data || data.length === 0) {
            this.seCompararonProductos = true;
            if (this.selectedLanguage == 'en') this.alertContent = { text: 'No products found on this city', title: 'Attention' };
            else this.alertContent = { text: 'No se encontraron estos productos en esta localidad', title: 'Atención' };
            Swal.fire({
              ...this.mensajeConfig,
              title: this.alertContent.title,
              text: this.alertContent.text,
              icon: 'info',
            });

            this.productosComparados = [];
            return;
          }

          console.log('Datos recibidos:', data);
          this.productosComparados = this.mapearProductosComparados(data);
          console.log('Productos comparados:', this.productosComparados);

          this.supermercados = Array.from(
            new Set(data.map((producto) => producto.razon_social))
          );
          this.tablaComparadoraColumns = ['producto', ...this.supermercados];
          this.calcularTotales();
          this.productosComparadosSource.data = this.productosComparados;
          this.isLoadingComparacion = false;
        },
        () => {
          if (this.selectedLanguage == 'en') this.alertContent = { text: 'Cannot get products comparison table', title: 'Error' };
          else this.alertContent = { text: 'No se pudo obtener la tabla de comparación de productos', title: 'Error' };
          Swal.fire({
            ...this.mensajeConfig,
            title: this.alertContent.title,
            text: this.alertContent.text,
            icon: 'error',
          });

          this.seCompararonProductos = false;
          this.isLoadingComparacion = false;
        }
      );
  }

  private mapearProductosComparados(data: any[]): productosComparados[] {
    const productosMap = new Map<string, productosComparados>();

    data.forEach((producto) => {
      if (!productosMap.has(producto.cod_barra)) {
        productosMap.set(producto.cod_barra, {
          cod_barra: producto.cod_barra,
          nom_producto: producto.nom_producto,
          imagen: producto.imagen,
          precios: {},
        });
      }

      const productoActual = productosMap.get(producto.cod_barra)!;
      const estadoProducto = this.determinarEstadoProducto(producto);

      productoActual.precios[producto.razon_social] = estadoProducto;
    });

    return Array.from(productosMap.values());
  }

  private determinarEstadoProducto(producto: any): EstadoProducto {
    // Campos del SP:
    // - sin_stock: boolean
    // nuevo con_promocion: precios que tienen el campo = 1 en el sp
    // - sin_precio: boolean
    // - sin_precio_actual: boolean
    // - mejor_precio: number (puede ser null)

    // Prioridad: Sin stock > Sin precio > Sin precio actual > Con precio
    
    if (producto.con_promocion){
      return {
        estado: 'con_promocion',
        mensaje_tooltip: this.selectedLanguage === 'en' ? 'Offer Price Until: '+ producto.fecha_fin_promocion : 'Precio en Oferta Hasta: ' + producto.fecha_fin_promocion,
        precio: producto.mejor_precio,
        precio_promocion: producto.mejor_precio_promocion
      }
    }

    if (producto.sin_stock) {
      return {
        estado: 'sin_stock',
        mensaje_tooltip: this.selectedLanguage == 'en' ? 'Product out of stock in this location' : 'Producto sin stock en esta localidad',
      };
    }

    if (producto.sin_precio) {
      return {
        estado: 'sin_precio',
        mensaje_tooltip: this.selectedLanguage == 'en' ? 'There is no price available for this product' : 'No hay precio disponible para este producto',
      };
    }

    if (producto.sin_precio_actual) {
      return {
        estado: 'sin_precio_actual',
        mensaje_tooltip: this.selectedLanguage == 'en' ? 'There is no updated price for this product' : 'No hay precio actualizado para la fecha actual',
      };
    }

    return {
      precio: producto.mejor_precio,
      estado: 'con_precio',
      mensaje_tooltip: '',
    };
  }

  // Actualizar el método calcularTotales para trabajar con el nuevo formato
  calcularTotales(): void {
    this.totalesSupermercado = {};
    this.supermercados.forEach((supermercado) => {
      this.totalesSupermercado[supermercado] = 0;
    });

    // Supermercados que tienen precio para TODOS los productos
    const supermercadosValidos: string[] = this.supermercados.filter((supermercado) =>
      this.productosComparados.every((producto) => {
        const estadoProducto = producto.precios[supermercado];
        return estadoProducto && estadoProducto.estado === 'con_precio' || estadoProducto.estado === 'con_promocion' && estadoProducto.precio !== undefined;
      })
    );

    // Calcular totales solo para supermercados válidos
    supermercadosValidos.forEach((supermercado) => {
      this.totalesSupermercado[supermercado] = this.productosComparados.reduce((total, producto) => {
        const estadoProducto = producto.precios[supermercado];
        if (estadoProducto.precio_promocion){
          return total + (estadoProducto && estadoProducto.precio_promocion !== undefined ? estadoProducto.precio_promocion : 0);
        } else {  return total + (estadoProducto && estadoProducto.precio !== undefined ? estadoProducto.precio : 0); }

      }, 0);
    });

    if (supermercadosValidos.length > 0) {
      this.supermercadoMasBarato = supermercadosValidos.reduce((a, b) =>
        this.totalesSupermercado[a] < this.totalesSupermercado[b] ? a : b
      );
      this.isSupermercadoGanador = true;
      const nroGanador = this.getNroSupermercado(this.supermercadoMasBarato);
      this.nrosSupermercadoGanador = nroGanador !== null ? [nroGanador.toString()] : [];

    } else {
      this.supermercadoMasBarato = '';
      this.isSupermercadoGanador = false;
    }

    console.log('Totales por supermercado:', this.totalesSupermercado);
    console.log('Supermercado más barato:', this.supermercadoMasBarato);
  }

  // Actualizar el método obtenerPrecioMasBajo
  obtenerPrecioMasBajo(producto: productosComparados): number | undefined {
    const precios = Object.values(producto.precios)
      .filter((estadoProducto) => estadoProducto.precio !== undefined)
      .map((estadoProducto) => estadoProducto.precio!) as number[];

    return precios.length > 0 ? Math.min(...precios) : undefined;
  }

  productoEnCarrito(product: any): boolean {
    return this.cartItems.some((item) => item.cod_barra === product.cod_barra);
  }

  verDetalles(producto: any) {
    // Si el idioma es inglés, busca los valores traducidos
    if (this.selectedLanguage === 'en' && this.traducciones && producto) {
      this.mostrarModal = true;
      this.productoSeleccionado = {
        ...producto,
        nom_categoria:
          this.traducciones.categorias?.find(
            (cat: { nro_categoria: number }) => cat.nro_categoria === producto.nro_categoria
          )?.nom_categoria || producto.nom_categoria,
        nom_rubro:
          this.traducciones.rubros?.find(
            (rubro: { nro_rubro: number }) => rubro.nro_rubro === producto.nro_rubro
          )?.nom_rubro || producto.nom_rubro,
        nom_tipo_producto:
          this.traducciones.tipos_productos?.find(
            (tipo: { nro_tipo_producto: number }) => tipo.nro_tipo_producto === producto.nro_tipo_producto
          )?.nom_tipo_producto || producto.nom_tipo_producto,
      };
    } else {
      this.productoSeleccionado = producto;
    }
    this.mostrarModal = true;
  }
  // mandamos al usuario a la pantalla de sucursales
  verSucursales(): void {
    // const base64params = btoa(JSON.stringify(filtros));
    // const url = `/home/buscador-sucursales?data=${encodeURIComponent(
    //   base64params
    // )}`;
    // window.open(url, '_blank');
    this.isLoadingSucursales = true;
    if (this.showSucursales) {
      this.vaciarTablaSucursales();
      this.isLoadingSucursales = false;
    } else {
      this.getSucursales();
      this.showSucursales = true;
    }
  }

  getNroSupermercado(nombre: string): number | null {
    console.log('NOMBRE ', nombre);
    const supermercado = this.todosSupermercados.find(
      (s) => s.razon_social === nombre
    );
    console.log('supermercado ', supermercado);
    return supermercado ? supermercado.nro_supermercado : null;
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
  vaciarTablaSucursales(): void {
    this.sucursalesSource.data = [];
    this.showSucursales = false;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
  }

  getMensajeSinPrecio(): string {
    return this.selectedLanguage === 'en' ? 'No prices for all products' : 'Faltan precios de productos';
  }
  getMsgVerSucursales (): string { return this.selectedLanguage === 'en' ? 'View Branches' : 'Ver Sucursales'}
  getMsgOcultarSucursales(): string { return this.selectedLanguage === 'en' ? 'Hide Branches' : 'Ocultar Sucursales'}
  
  goToBranches() {
    this.router.navigate(['/home/buscador-sucursales']);
  }

  goToPriceComparator() {
    this.router.navigate(['/home/comparador-productos']);
  }

  goToAdminSupermercados() {
    this.router.navigate(['/home/administrador-supermercados']);
  }

}
