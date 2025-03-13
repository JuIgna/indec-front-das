import { TestBed } from '@angular/core/testing';

import { ProductosComparadosService } from './productos-comparados.service';

describe('ProductosComparadosService', () => {
  let service: ProductosComparadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosComparadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
