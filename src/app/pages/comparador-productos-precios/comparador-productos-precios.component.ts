import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/productos/obtenerProductos/product.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CompararPreciosService } from '../../services/productos/compararPrecios/comparar-precios.service';
import { ProductosComparadosService } from '../../services/productos/productosComparados/productos-comparados.service';
import { FormsModule } from '@angular/forms';
import { ObtenerProvinciasService } from '../../services/lugares/provincias/obtener-provincias.service';
import { ObtenerLocalidadesService } from '../../services/lugares/localidades/obtener-localidades.service';
import { BuscadorProductosPipe } from '../../components/pipes/buscador-productos.pipe';
import {
  Producto,
  productosComparados,
} from '../../components/interfaces/producto';
import { ObtenerIdiomasService } from '../../services/idioma/obtenerIdiomas/obtener-idiomas.service';
import { ObtenerTraduccionService } from '../../services/idioma/obtenerTraduccion/obtener-traduccion.service';
import { SupermercadoInterface } from '../../components/interfaces/supermercado';

// Importaciones de Angular Material
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

@Component({
  selector: 'app-comparador-productos-precios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BuscadorProductosPipe,
    // Angular Material Modules
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
  styleUrl: './comparador-productos-precios.component.css',
})
export class ComparadorProductosPreciosComponent implements OnInit {
  supermercados: SupermercadoInterface[] = [];
  supermercadoMasBarato: string = '';
  totalesSupermercado: any = {};
  paisBase: string = 'ARG';
  provinciaSelected: string | null = null;
  localidadSelected: string | null = null;
  isSidebarOpen = false;
  isCartOpen = false;
  cartItems: Producto[] = [];
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  isLoading = true;
  mostrarComparacion: boolean = false;
  showLocalidades: boolean = false;
  provincias: provincia[] = [];
  localidades: localidades[] = [];
  searchTerm: string = '';

  productosComparados: productosComparados[] = [];

  // Listas de filtros dinámicos
  categoriasDisponibles: string[] = [];
  marcasDisponibles: string[] = [];
  rubrosDisponibles: string[] = [];
  tiposDisponibles: string[] = [];

  // Valores seleccionados
  filtroSeleccionado = {
    categoria: '',
    marca: '',
    rubro: '',
    tipo: '',
  };

  selectedLanguage: string = '';
  selectedLanguageName: string = '';
  idiomas: any[] = [];

  // Columnas de la tabla comparador de precios
  displayedColumns: string[] = ['producto'];

  dataSource = new MatTableDataSource(this.productosComparados);

  constructor(
    private productService: ProductService,
    private router: Router,
    private productosComparadosService: ProductosComparadosService,
    private obtenerIdiomasService: ObtenerIdiomasService,
    private obtenerTraduccionService: ObtenerTraduccionService,
    private obtenerProvinciasService: ObtenerProvinciasService,
    private obtenerLocalidadesService: ObtenerLocalidadesService,
    private compararPreciosService: CompararPreciosService
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe(
      (data) => {
        this.products = data;
        this.filteredProducts = this.products;
        console.log(this.products);
        this.actualizarOpcionesFiltro();
        setTimeout(() => {
          this.isLoading = false;
        }, 2000);
      },
      (error) => {
        console.error('Error al obtener productos:', error);
        alert('No se pudo obtener la lista de productos.');
        this.isLoading = false;
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
          if (this.selectedLanguage === 'en') {
            this.cargarTraducciones(this.selectedLanguage);
          }
        }
      },
      (error) => {
        console.error('Error al obtener idiomas:', error);
        alert('No se pudo obtener la lista de idiomas.');
      }
    );

    this.obtenerProvinciasService.getProvincias(this.paisBase).subscribe(
      (data) => {
        this.provincias = data;
        console.log('Provincias cargadas', this.provincias);
      },
      (error) => {
        console.error('No se pudo obtener las provincias ', error);
        alert('No se pudo obtener la lista de provincias');
      }
    );

    // Cargar carrito desde sessionStorage al iniciar
    const storedCart = sessionStorage.getItem('cartItems');
    if (storedCart) {
      this.cartItems = JSON.parse(storedCart);
    }

    this.detectLanguage();
  }

  iniciarComparacion(): void {
    if (this.cartItems.length === 0) {
      alert('Debe agregar productos al carrito antes de comparar precios.');
      return;
    }

    this.mostrarComparacion = true;
    this.showLocalidades = false;
    this.productosComparados = [];
    this.supermercados = [];
    this.totalesSupermercado = {};
    this.supermercadoMasBarato = '';

    // Resetear selecciones si es necesario
    this.provinciaSelected = null;
    this.localidadSelected = null;

    // Cargar selección guardada si existe
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
  }

  esPrecioMasBajo(precio: number, producto: any): boolean {
    if (precio === undefined || precio === null) return false;

    const precios = Object.values(producto.precios)
      .filter((p) => p !== undefined && p !== null)
      .map((p) => Number(p));

    return precios.length > 0 && precio === Math.min(...precios);
  }

  cargarSeleccionGuardada(): void {
    const provinciaGuardada = sessionStorage.getItem('cod_provincia');
    const localidadGuardada = sessionStorage.getItem('nro_localidad');

    if (provinciaGuardada) {
      this.provinciaSelected = provinciaGuardada;
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

  // Cambia el idioma de la aplicación y redirige al puerto correspondiente
  changeLanguage(language: string): void {
    this.selectedLanguage = language;
    console.log(this.selectedLanguage);
    // Determina el puerto según el idioma
    const currentHost = window.location.hostname;
    const newPort = language === 'en' ? '4201' : '4200';
    console.log(
      'Nueva dirección:',
      `${window.location.protocol}//${currentHost}:${newPort}${window.location.pathname}`
    );

    // Vaciar el carrito antes de cambiar el idioma
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
      (error) => {
        console.error('Error al obtener traducción:', error);
        alert('No se pudo obtener la traducción.');
      }
    );
  }

  private guardarCarritoEnCache() {
    sessionStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  // Agregar producto al carrito y guardarlo en sessionStorage
  agregarAlCarrito(product: any) {
    if (!this.productoEnCarrito(product)) {
      this.cartItems = [...this.cartItems, product];
      this.guardarCarritoEnCache();
      console.log('Producto agregado al carrito:', product);
    } else {
      alert('Este producto ya está en el carrito.');
    }
  }

  borrarDelCarrito(product: any) {
    const confirmDelete = window.confirm(
      `¿Seguro que quieres eliminar "${product.nom_producto}" del carrito?`
    );
    if (confirmDelete) {
      this.cartItems = this.cartItems.filter(
        (item) => item.cod_barra !== product.cod_barra
      );
      this.guardarCarritoEnCache();
      console.log('Carrito actualizado:', this.cartItems);
    }
  }

  limpiarCarrito() {
    const confirmClear = window.confirm(
      '¿Seguro que quieres limpiar todo el carrito?'
    );
    if (confirmClear) {
      this.cartItems = [];
      this.guardarCarritoEnCache();
      console.log('Carrito limpio:', this.cartItems);
    }
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
      this.obtenerLocalidadesService
        .getLocalidades(this.paisBase, this.provinciaSelected)
        .subscribe(
          (data) => {
            this.localidades = data;
            this.showLocalidades = true;
            this.localidadSelected = null; // Reset localidad
            sessionStorage.removeItem('nro_localidad');
            console.log('Localidades cargadas:', this.localidades);
          },
          (error) => {
            console.error('Error al obtener las localidades:', error);
            alert(
              'No se pudo obtener la lista de localidades. Verifique la consola para más detalles.'
            );
          }
        );
    } else {
      console.error('El código de país o provincia no está definido');
    }
  }

  onLocalidadChange(event: MatSelectChange): void {
    this.localidadSelected = event.value;
    sessionStorage.setItem('nro_localidad', this.localidadSelected || '');

    console.log('Localidad seleccionada:', this.localidadSelected);

    if (this.localidadSelected) {
      this.compararProductos();
    }
  }
compararProductos(): void {
  if (!this.localidadSelected) {
    alert("Debe seleccionar una localidad antes de comparar precios.");
    return;
  }

  const codigosBarra = this.cartItems.map(item => item.cod_barra);
  console.log("Comparando Productos con códigos de barra:", codigosBarra, "y localidad:", this.localidadSelected);

  // Usar el servicio correcto
  this.compararPreciosService.getCompararPrecios(codigosBarra, this.localidadSelected).subscribe(
    (data) => {
      if (!data || data.length === 0) {
        alert('No se encontraron estos productos en esta localidad.');
        this.productosComparados = [];
        return;
      }

      console.log("Datos recibidos:", data);

      // Agrupar productos por código de barra
      const productosMap = new Map<string, any>();

      data.forEach(producto => {
        if (!productosMap.has(producto.cod_barra)) {
          productosMap.set(producto.cod_barra, {
            nom_producto: producto.nom_producto,
            imagen: producto.imagen,
            precios: {},
            vigente: producto.vigente
          });
        }
        productosMap.get(producto.cod_barra)!.precios[producto.razon_social] = producto.mejor_precio;
      });
      
      this.productosComparados = Array.from(productosMap.values());
      console.log('Productos comparados:', this.productosComparados);

      // Extraer supermercados únicos
      this.supermercados = Array.from(new Set(data.map(producto => producto.razon_social)));
      
      // Actualizar columnas de la tabla
      this.displayedColumns = ['producto', ...this.supermercados];

      // Calcular totales por supermercado
      this.calcularTotales();

      // Actualizar dataSource para la tabla
      this.dataSource.data = this.productosComparados;
    },
    (error) => {
      console.error('Error al comparar los productos:', error);
      alert('No se pudo obtener la lista de productos comparados. Verifique la consola.');
    }
  );
}

  calcularTotales(): void {
    this.totalesSupermercado = {};

    // Inicializar totales en 0
    this.supermercados.forEach((supermercado) => {
      this.totalesSupermercado[supermercado] = 0;
    });

    // Sumar precios por supermercado
    this.productosComparados.forEach((producto) => {
      this.supermercados.forEach((supermercado) => {
        if (producto.mejor_precio[supermercado] !== undefined) {
          this.totalesSupermercado[supermercado] +=
            producto.mejor_precio[supermercado];
        }
      });
    });

    // Determinar el supermercado más barato
    const supermercadosConPrecios = Object.keys(
      this.totalesSupermercado
    ).filter((supermercado) => this.totalesSupermercado[supermercado] > 0);

    if (supermercadosConPrecios.length > 0) {
      this.supermercadoMasBarato = supermercadosConPrecios.reduce((a, b) =>
        this.totalesSupermercado[a] < this.totalesSupermercado[b] ? a : b
      );
    }

    console.log('Totales por supermercado:', this.totalesSupermercado);
    console.log('Supermercado más barato:', this.supermercadoMasBarato);
  }

  obtenerPrecioMasBajo(producto: any): number | undefined {
    const precios = Object.values(producto.precios).filter(
      (precio) => typeof precio === 'number'
    ) as number[];

    return precios.length > 0 ? Math.min(...precios) : undefined;
  }

  productoEnCarrito(product: any): boolean {
    return this.cartItems.some((item) => item.cod_barra === product.cod_barra);
  }

  // Función para ver los detalles del producto
  mostrarModal: boolean = false;
  productoSeleccionado: any = null;

  verDetalles(producto: any) {
    this.productoSeleccionado = producto;
    this.mostrarModal = true;
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

  goToComparador() {
    this.closeMenus();
    this.productosComparadosService.setProductosComparados(this.cartItems);
    this.router.navigate(['/home/comparador-productos/resultados-comparador']);
  }

  goToAdminSupermercados() {
    this.router.navigate(['/home/administrador-supermercados']);
  }
}
