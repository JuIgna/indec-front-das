import { TestBed } from '@angular/core/testing';

import { ObtenerSucursalesService } from './obtener-sucursales.service';

describe('ObtenerSucursalesService', () => {
  let service: ObtenerSucursalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObtenerSucursalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
