import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/productos/obtenerProductos/product.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CompararPreciosService } from '../../services/productos/compararPrecios/comparar-precios.service';
import { FormsModule } from '@angular/forms';
import { ObtenerProvinciasService } from '../../services/lugares/provincias/obtener-provincias.service';
import { ObtenerLocalidadesService } from '../../services/lugares/localidades/obtener-localidades.service';
import { BuscadorProductosPipe } from '../../components/pipes/buscador-productos.pipe';
import {
  EstadoProducto,
  Producto,
  productosComparados,
} from '../../components/interfaces/producto';
import { ObtenerIdiomasService } from '../../services/idioma/obtenerIdiomas/obtener-idiomas.service';
import { ObtenerTraduccionService } from '../../services/idioma/obtenerTraduccion/obtener-traduccion.service';
import { SupermercadoInterface } from '../../components/interfaces/supermercado';
import { SupermercadosService } from '../../services/supermercados/supermercados.service';
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
import { filtrosSucursal } from '../../components/interfaces/sucursal';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { alertContent } from '../../components/interfaces/mensajes';

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
  ],
  providers: [ProductService],
  templateUrl: './comparador-productos-precios.component.html',
  styleUrls: ['./comparador-productos-precios.component.css'],
})
export class ComparadorProductosPreciosComponent implements OnInit {
  supermercados: string[] = [];
  todosSupermercados: SupermercadoInterface[] = [];
  supermercadoMasBarato: string = '';
  totalesSupermercado: any = {};
  paisBase: string = 'AR';
  provinciaSelected: string | null = null;
  provincias: provincia[] = [];
  localidadSelected: string | null = null;
  isSidebarOpen = false;
  isCartOpen = false;
  cartItems: Producto[] = [];
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  isLoadingProductos: boolean = false;
  isLoadingComparacion: boolean = false;
  isSupermercadoGanador: boolean = false;
  mostrarComparacion: boolean = false;
  seCompararonProductos: boolean = false;
  showLocalidades: boolean = false;
  localidades: localidades[] = [];
  searchTerm: string = '';
  productosComparados: productosComparados[] = [];
  categoriasDisponibles: string[] = [];
  marcasDisponibles: string[] = [];
  rubrosDisponibles: string[] = [];
  tiposDisponibles: string[] = [];
  filtroSeleccionado = {
    categoria: '',
    marca: '',
    rubro: '',
    tipo: '',
  };
  selectedLanguage: string = '';
  selectedLanguageName: string = '';
  idiomas: any[] = [];
  displayedColumns: string[] = ['producto'];
  dataSource = new MatTableDataSource(this.productosComparados);
  mostrarModal: boolean = false;
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

  constructor(
    private productService: ProductService,
    private router: Router,
    private obtenerIdiomasService: ObtenerIdiomasService,
    private obtenerTraduccionService: ObtenerTraduccionService,
    private obtenerProvinciasService: ObtenerProvinciasService,
    private obtenerLocalidadesService: ObtenerLocalidadesService,
    private compararPreciosService: CompararPreciosService,
    private supermercadosService: SupermercadosService
  ) {}

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
  }

  getSupermercados(): void {
    this.supermercadosService.getSupermercados().subscribe(
      (data) => {
        this.todosSupermercados = data;
        console.log('Supermercados Cargados', this.todosSupermercados);
      },
      () => {
          if (this.selectedLanguage == 'en') this.alertContent = {text: 'Cannot get supermarket list', title: 'Error'};
          else this.alertContent = { text: 'No se pudo obtener la lista de supermercados', title: 'Error'};

          Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
          });
      }
    );    

  }

  getIdiomas(): void{
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
        if (this.selectedLanguage == 'en') this.alertContent = {text: 'Cannot get languages list', title: 'Error'};
          else this.alertContent = { text: 'No se pudo obtener la lista de idiomas', title: 'Error'};

          Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
          });
      }
    );

  }

  getProductos(): void{
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
        if (this.selectedLanguage == 'en') this.alertContent = {text: 'Cannot get products list', title: 'Error'};
          else this.alertContent = { text: 'No se pudo obtener la lista de productos', title: 'Error'};

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
          if (this.selectedLanguage == 'en') this.alertContent = {text: 'Cannot get province list', title: 'Error'};
          else this.alertContent = { text: 'No se pudo obtener la lista de provincias', title: 'Error'};

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
            this.localidadSelected = null;
            // sessionStorage.removeItem('nro_localidad');
            console.log('Localidades cargadas:', this.localidades);
          },
          (error) => {
          if (this.selectedLanguage == 'en') this.alertContent = {text: 'Cannot get cities list', title: 'Error'};
            else this.alertContent = { text: 'No se pudo obtener la lista de localidades', title: 'Error'};

            Swal.fire({
            ...this.mensajeConfig,
            title: this.alertContent.title,
            text: this.alertContent.text,
            icon: 'error',
            });
            }
          );
    } else {
        if (this.selectedLanguage == 'en') this.alertContent = {text: 'No esta definida la provincia', title: 'Error'};
          else this.alertContent = { text: 'Province not defined', title: 'Error'};

          Swal.fire({
          ...this.mensajeConfig,
          title: this.alertContent.title,
          text: this.alertContent.text,
          icon: 'error',
          });
        }
  }

  isCartEmpty(): boolean {
        if (this.cartItems.length === 0) {
        if (this.selectedLanguage == 'en') this.alertContent = {text: 'Cannot do comparison, cart is empty', title: 'Attention'};
          else this.alertContent = { text: 'Debe agregar productos al carrito', title: 'Atención'};

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

    this.isCartOpen = false;

    this.mostrarComparacion = true;
    this.showLocalidades = false;
    this.productosComparados = [];
    this.supermercados = [];
    this.totalesSupermercado = {};
    this.supermercadoMasBarato = '';
    this.provinciaSelected = null;
    this.localidadSelected = null;
    this.cargarSeleccionGuardada();
  }

  volverAProductos(): void {
    this.mostrarComparacion = false;
    this.showLocalidades = false;
    this.productosComparados = [];
    this.supermercados = [];
    this.totalesSupermercado = {};
    this.supermercadoMasBarato = '';
    this.displayedColumns = ['producto'];
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
    const localidadGuardada = sessionStorage.getItem('nro_localidad');
    if (provinciaGuardada) {
      this.provinciaSelected = provinciaGuardada;

      this.getLocalidades();

      this.showLocalidades = true;
    }
    if (localidadGuardada) {
      this.localidadSelected = localidadGuardada;
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
        if (this.selectedLanguage == 'en') this.alertContent = {text: 'Cannot get translation', title: 'Error'};
          else this.alertContent = { text: 'No se pudo obtener la traducción', title: 'Error'};

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
        else this.alertContent = {text: 'Este producto ya está en el carrito', title: 'Atención' };
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
    this.provinciaSelected = event.value;
    sessionStorage.setItem('cod_provincia', this.provinciaSelected || '');
    console.log('Provincia seleccionada:', this.provinciaSelected);
    if (this.paisBase && this.provinciaSelected) {
      this.getLocalidades();
    }
  }

  onLocalidadChange(event: MatSelectChange): void {
    this.localidadSelected = event.value;
    sessionStorage.setItem('nro_localidad', this.localidadSelected || '');
    console.log('Localidad seleccionada:', this.localidadSelected);
    // if (this.localidadSelected) {
    //   this.compararProductos();
    // }
  }

  compararProductos(): void {
    if (this.isCartEmpty()) return; 

    if (!this.localidadSelected) {
      if (this.selectedLanguage == 'en') this.alertContent = { text: 'You must select a city before compare prices', title: 'Attention' };
        else this.alertContent = {text: 'Debe seleccionar una localidad antes de comparar precios', title: 'Atención' };
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

    this.compararPreciosService
      .getCompararPrecios(codigosBarra, this.localidadSelected)
      .subscribe(
        (data) => {
          if (!data || data.length === 0) {
            this.seCompararonProductos = true;
            if (this.selectedLanguage == 'en') this.alertContent = { text: 'No products found on this city', title: 'Attention' };
              else this.alertContent = {text: 'No se encontraron estos productos en esta localidad', title: 'Atención' };
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
          this.displayedColumns = ['producto', ...this.supermercados];
          this.calcularTotales();
          this.dataSource.data = this.productosComparados;
          this.isLoadingComparacion = false;
        },
        () => {
        if (this.selectedLanguage == 'en') this.alertContent = {text: 'Cannot get products comparison table', title: 'Error'};
          else this.alertContent = { text: 'No se pudo obtener la tabla de comparación de productos', title: 'Error'};
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
    // - sin_precio: boolean
    // - sin_precio_actual: boolean
    // - mejor_precio: number (puede ser null)

    // Prioridad: Sin stock > Sin precio > Sin precio actual > Con precio
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

    this.productosComparados.forEach((producto) => {
      this.supermercados.forEach((supermercado) => {
        const estadoProducto = producto.precios[supermercado];
        if (estadoProducto && estadoProducto.precio !== undefined) {
          this.totalesSupermercado[supermercado] += estadoProducto.precio;
        }
      });
    });

    const supermercadosConPrecios = Object.keys(
      this.totalesSupermercado
    ).filter((supermercado) => this.totalesSupermercado[supermercado] > 0);

    if (supermercadosConPrecios.length > 0) {
      this.supermercadoMasBarato = supermercadosConPrecios.reduce((a, b) =>
        this.totalesSupermercado[a] < this.totalesSupermercado[b] ? a : b
      );
      this.isSupermercadoGanador = true;
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
  verSucursales(filtros: filtrosSucursal): void {
    const base64params = btoa(JSON.stringify(filtros));

    console.log('filtros ', filtros);

    const url = `/home/buscador-sucursales?data=${encodeURIComponent(
      base64params
    )}`;

    window.open(url, '_blank');
  }

  getNroSupermercado(nombre: string): number | null {
    console.log('NOMBRE ', nombre);
    const supermercado = this.todosSupermercados.find(
      (s) => s.razon_social === nombre
    );
    console.log('supermercado ', supermercado);
    return supermercado ? supermercado.nro_supermercado : null;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
  }

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
