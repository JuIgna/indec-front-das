import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'buscadorProductos',
  standalone: true
})
export class BuscadorProductosPipe implements PipeTransform {

  transform(products: any[], searchTerm: string): any[] {
    if (!products || !searchTerm) {
      return products; // Devuelve todos si no hay búsqueda
    }

    searchTerm = searchTerm.toLowerCase();
    return products.filter(product =>
      product.nom_producto.toLowerCase().includes(searchTerm)
    );
  }
}
