import { TestBed } from '@angular/core/testing';

import { ObtenerPaisesService } from './obtener-paises.service';

describe('ObtenerPaisesService', () => {
  let service: ObtenerPaisesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObtenerPaisesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
