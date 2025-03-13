import { TestBed } from '@angular/core/testing';

import { ObtenerLocalidadesService } from './obtener-localidades.service';

describe('ObtenerLocalidadesService', () => {
  let service: ObtenerLocalidadesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObtenerLocalidadesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
