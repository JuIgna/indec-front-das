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
import { Producto } from '../../components/interfaces/producto';
import { ObtenerIdiomasService } from '../../services/idioma/obtenerIdiomas/obtener-idiomas.service'; 
import { ObtenerTraduccionService } from '../../services/idioma/obtenerTraduccion/obtener-traduccion.service';

@Component({
  selector: 'app-comparador-productos-precios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BuscadorProductosPipe],
  providers: [ProductService],
  templateUrl: './comparador-productos-precios.component.html',
  styleUrl: './comparador-productos-precios.component.css',
})
export class ComparadorProductosPreciosComponent implements OnInit {
  isSidebarOpen = false;
  isCartOpen = false;
  cartItems: Producto[] = [];
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  isLoading = true;
  searchTerm: string = '';

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
      tipo: ''
  };

  selectedLanguage: string = "";
  selectedLanguageName: string = "";
  idiomas: any[] = [];
  
  
  

  constructor(
    private productService: ProductService,
    private router: Router,
    private productosComparadosService: ProductosComparadosService,
    private obtenerIdiomasService: ObtenerIdiomasService,
    private obtenerTraduccionService: ObtenerTraduccionService,
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
        this.idiomas = data;  // Guardar idiomas en la lista
        console.log('Idiomas cargados:', this.idiomas);

        
          const idioma = this.idiomas.find(lang => lang.cod_idioma === this.selectedLanguage);
          if (idioma) {
            this.selectedLanguageName = idioma.nom_idioma;
            if(this.selectedLanguage === 'en'){
              this.cargarTraducciones(this.selectedLanguage);
            }
          }
        
      },
      (error) => {
        console.error('Error al obtener idiomas:', error);
        alert('No se pudo obtener la lista de idiomas.');
      }
    );

    // Cargar carrito desde sessionStorage al iniciar
    const storedCart = sessionStorage.getItem('cartItems');
    if (storedCart) {
      this.cartItems = JSON.parse(storedCart);
    }

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
    console.log(this.selectedLanguage);
    // Determina el puerto según el idioma
    const currentHost = window.location.hostname;
    const newPort = language === 'en' ? '4201' : '4200';
    console.log('Nueva dirección:', `${window.location.protocol}//${currentHost}:${newPort}${window.location.pathname}`);

    // Vaciar el carrito antes de cambiar el idioma
    this.limpiarCarritoSinPregunta();

    if (window.location.port !== newPort) {
      window.location.href = `${window.location.protocol}//${currentHost}:${newPort}`;
    }
  }


  traducciones:any = {};

  cargarTraducciones(lang: string) {
    this.selectedLanguage = lang;
    localStorage.setItem('lang', lang);

    this.obtenerTraduccionService.getTraducciones(lang).subscribe(
      (data) => {
        
        this.traducciones = data; // Guardamos las traducciones
        console.log('Traducción cargada:', this.traducciones);
        this.products = this.products.map(product => {
          return {
            ...product,
            nom_categoria: this.traducciones.categorias.find((cat: { nro_categoria: number; }) => cat.nro_categoria === product.nro_categoria)?.nom_categoria || product.nom_categoria,
            nom_rubro: this.traducciones.rubros.find((rubro: { nro_rubro: number; }) => rubro.nro_rubro === product.nro_rubro)?.nom_rubro || product.nom_rubro,
            nom_tipo_producto: this.traducciones.tipos_productos.find((tipo: { nro_tipo_producto: number; }) => tipo.nro_tipo_producto === product.nro_tipo_producto)?.nom_tipo_producto || product.nom_tipo_producto
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
    const confirmDelete = window.confirm(`¿Seguro que quieres eliminar "${product.nom_producto}" del carrito?`);
    if (confirmDelete) {
      this.cartItems = this.cartItems.filter(item => item.cod_barra !== product.cod_barra);
      this.guardarCarritoEnCache();
      console.log('Carrito actualizado:', this.cartItems);
    }
  }

  limpiarCarrito() {
    const confirmClear = window.confirm('¿Seguro que quieres limpiar todo el carrito?');
    if (confirmClear) {
      this.cartItems = []; // Vaciar el carrito
      this.guardarCarritoEnCache(); // Guardar el carrito vacío en sessionStorage
      console.log('Carrito limpio:', this.cartItems);
    }
  }

  limpiarCarritoSinPregunta(){
    this.cartItems = []; // Vaciar el carrito
    this.guardarCarritoEnCache(); // Guardar el carrito vacío en sessionStorage
    console.log('Carrito limpio:', this.cartItems);
  }

  

  actualizarOpcionesFiltro() {
    this.categoriasDisponibles = [...new Set(this.products.map(p => p.nom_categoria))];
    this.marcasDisponibles = [...new Set(this.products.map(p => p.nom_marca))];
    this.rubrosDisponibles = [...new Set(this.products.map(p => p.nom_rubro))];
    this.tiposDisponibles = [...new Set(this.products.map(p => p.nom_tipo_producto))];
  }

  filtrarProductos() {
    let filtrados = [...this.products];

    // Aplicar filtros según lo seleccionado
    if (this.filtroSeleccionado.categoria) {
        filtrados = filtrados.filter(p => p.nom_categoria === this.filtroSeleccionado.categoria);
    }
    if (this.filtroSeleccionado.marca) {
        filtrados = filtrados.filter(p => p.nom_marca === this.filtroSeleccionado.marca);
    }
    if (this.filtroSeleccionado.rubro) {
        filtrados = filtrados.filter(p => p.nom_rubro === this.filtroSeleccionado.rubro);
    }
    if (this.filtroSeleccionado.tipo) {
        filtrados = filtrados.filter(p => p.nom_tipo_producto === this.filtroSeleccionado.tipo);
    }

    // Actualizar productos filtrados
    this.filteredProducts = filtrados;

    // Actualizar opciones de los selects basadas en los productos filtrados
    this.categoriasDisponibles = [...new Set(filtrados.map(p => p.nom_categoria))];
    this.marcasDisponibles = [...new Set(filtrados.map(p => p.nom_marca))];
    this.rubrosDisponibles = [...new Set(filtrados.map(p => p.nom_rubro))];
    this.tiposDisponibles = [...new Set(filtrados.map(p => p.nom_tipo_producto))];
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) this.isCartOpen = false;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) this.isSidebarOpen = false;
    console.log("Carrito actual en HeaderComponent:", this.cartItems);
  }

  closeMenus() {
    this.isSidebarOpen = false;
    this.isCartOpen = false;
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.nom_producto.toLowerCase().includes(searchTerm)
    );
  }

  productoEnCarrito(product: any): boolean {
    return this.cartItems.some(item => item.cod_barra === product.cod_barra);
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
  goToBranches() {// Oculta el contenedor
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
}
