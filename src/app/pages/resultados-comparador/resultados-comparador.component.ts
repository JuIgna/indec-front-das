import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ProductosComparadosService } from '../../services/productos/productosComparados/productos-comparados.service';
import { CommonModule } from '@angular/common';
import { ObtenerLocalidadesService } from '../../services/lugares/localidades/obtener-localidades.service';
import { ObtenerProvinciasService } from '../../services/lugares/provincias/obtener-provincias.service';
import { CompararPreciosService } from '../../services/productos/compararPrecios/comparar-precios.service';
import { Router } from '@angular/router';
import { Producto } from '../../components/interfaces/producto';


@Component({
  selector: 'app-resultados-comparador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultados-comparador.component.html',
  styleUrl: './resultados-comparador.component.css'
})
export class ResultadosComparadorComponent implements OnInit {

  constructor(
    private obtenerProvinciasService: ObtenerProvinciasService,
    private obtenerLocalidadesService: ObtenerLocalidadesService,
    private comparadorService: CompararPreciosService,
    private productosComparadosService: ProductosComparadosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSeleccionGuardada();

    // Nos suscribimos al observable del servicio para obtener los productos comparados
    this.productosComparadosService.getProductosComparados().subscribe(
      (productos) => {
        this.productosRecibidos = productos; // Aquí se guarda lo que recibimos del servicio
        console.log('Productos comparados recibidos:', this.productosRecibidos); // Asegúrate de que se están recibiendo los datos correctamente
        this.abrirModal();
      },
      (error) => {
        console.error('Error al obtener productos comparados:', error);
      }
    );
  }

  @Output() cerrar = new EventEmitter<void>();

  mostrarComparacion: boolean = false;
  provincias: any[] = [];
  localidades: any[] = [];
  supermercados: string[] = [];
  productosComparados: any[] = [];
  productosRecibidos: Producto[] = [];
  totalesSupermercado: any = {};
  supermercadoMasBarato: string = "";
  cod_pais: string = "AR";
  showLocalidades = false;

  cod_provincia: string | undefined;
  nro_localidad: string | undefined;

  abrirModal() {
    this.mostrarComparacion = true;
    this.obtenerProvinciasService.getProvincias(this.cod_pais).subscribe(
      (data) => {
        this.provincias = data;

        // Si ya había una provincia guardada, seleccionarla automáticamente
        if (this.cod_provincia) {
          setTimeout(() => {
            this.onProvinciaChange({ target: { value: this.cod_provincia } } as any);
          }, 100);
        }
      },
      (error) => {
        console.error('Error al obtener provincias:', error);
        alert('No se pudo obtener la lista de provincias.');
      }
    );
  }

  closeModal() {
    this.router.navigate(['/home/comparador-productos']);
  }

  onProvinciaChange(event: Event) {
    this.cod_provincia = (event.target as HTMLSelectElement).value;
    sessionStorage.setItem('cod_provincia', this.cod_provincia); // Guardar en sessionStorage

    if (this.cod_provincia) {
      this.obtenerLocalidadesService.getLocalidades(this.cod_pais, this.cod_provincia).subscribe(
        (data) => {
          this.localidades = data;
          this.showLocalidades = true;

          // Si había una localidad guardada, seleccionarla automáticamente
          if (this.nro_localidad) {
            setTimeout(() => {
              this.onLocalidadChange({ target: { value: this.nro_localidad } } as any);
            }, 100);
          }
        },
        (error) => console.error('Error al obtener localidades:', error)
      );
    }
  }

  onLocalidadChange(event: Event) {
    this.nro_localidad = (event.target as HTMLSelectElement).value;
    sessionStorage.setItem('nro_localidad', this.nro_localidad); // Guardar en sessionStorage
    this.compararProductos();
  }

  cargarSeleccionGuardada() {
    const provinciaGuardada = sessionStorage.getItem('cod_provincia');
    const localidadGuardada = sessionStorage.getItem('nro_localidad');

    if (provinciaGuardada) {
      this.cod_provincia = provinciaGuardada;
      this.showLocalidades = true;
    }
    if (localidadGuardada) {
      this.nro_localidad = localidadGuardada;
    }
  }

  compararProductos() {
    if (!this.nro_localidad) {
        alert("Debe seleccionar una localidad antes de comparar precios.");
        return;
    }

    const codigosBarra = this.productosRecibidos.map(item => item.cod_barra);
    console.log("Comparando Productos con códigos de barra:", codigosBarra, "y localidad:", this.nro_localidad);

    this.comparadorService.getCompararPrecios(codigosBarra, this.nro_localidad).subscribe(
        (data) => {
            if (!data || data.length === 0) {
                alert('No se encontraron estos productos en esta localidad.');
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
                productosMap.get(producto.cod_barra).precios[producto.razon_social] = producto.mejor_precio;
            });
            
            this.productosComparados = Array.from(productosMap.values());

            console.log(this.productosComparados);

            // Extraer supermercados únicos
            this.supermercados = Array.from(new Set(data.map(producto => producto.razon_social)));

            // Calcular totales por supermercado
            this.calcularTotales();
        },
        (error) => {
            console.error('Error al comparar los productos:', error);
            alert('No se pudo obtener la lista de productos comparados. Verifique la consola.');
        }
    );
}


  
  calcularTotales() {
    this.totalesSupermercado = {};

    this.supermercados.forEach(supermercado => {
        this.totalesSupermercado[supermercado] = 0;
    });

    this.productosComparados.forEach(producto => {
        this.supermercados.forEach(supermercado => {
            if (producto.precios[supermercado] !== undefined) {
                this.totalesSupermercado[supermercado] += producto.precios[supermercado];
            }
        });
    });

    // Determinar el supermercado más barato
    this.supermercadoMasBarato = Object.keys(this.totalesSupermercado).reduce((a, b) =>
        this.totalesSupermercado[a] < this.totalesSupermercado[b] ? a : b
    );
  }

  obtenerPrecioMasBajo(producto: any): number | undefined {
    let precios = Object.values(producto.precios)
        .filter(precio => typeof precio === "number") as number[]; // Filtramos solo números

    return precios.length > 0 ? Math.min(...precios) : undefined;
  }


  esPrecioMasBajo(precio: number, producto: any): boolean {
    const precios = Object.values(producto.precios).map(p => Number(p));
    return precio === Math.min(...precios);
  }
}
