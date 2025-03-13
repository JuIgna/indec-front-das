import { TestBed } from '@angular/core/testing';

import { ObtenerIdiomasService } from './obtener-idiomas.service';

describe('ObtenerIdiomasService', () => {
  let service: ObtenerIdiomasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObtenerIdiomasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
