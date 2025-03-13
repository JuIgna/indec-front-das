import { TestBed } from '@angular/core/testing';

import { ObtenerProvinciasService } from './obtener-provincias.service';

describe('ObtenerProvinciasService', () => {
  let service: ObtenerProvinciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObtenerProvinciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
