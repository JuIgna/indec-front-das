import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductosComparadosService {

  private productosComparadosSubject = new BehaviorSubject<any[]>([]); // Almacena el estado de los productos comparados
  productosComparados$ = this.productosComparadosSubject.asObservable(); // Observable para que los componentes se suscriban

  constructor() {}

  // Método para setear los productos comparados
  setProductosComparados(productos: any[]) {
    this.productosComparadosSubject.next(productos); // Actualiza el valor del Subject
  }

  // Método para obtener los productos comparados
  getProductosComparados() {
    return this.productosComparados$;
  }
}
