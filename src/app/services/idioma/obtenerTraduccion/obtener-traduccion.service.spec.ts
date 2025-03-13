import { TestBed } from '@angular/core/testing';

import { ObtenerTraduccionService } from './obtener-traduccion.service';

describe('ObtenerTraduccionService', () => {
  let service: ObtenerTraduccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObtenerTraduccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
