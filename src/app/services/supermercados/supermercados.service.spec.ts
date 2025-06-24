import { TestBed } from '@angular/core/testing';

import { SupermercadosService } from './supermercados.service';

describe('SupermercadosService', () => {
  let service: SupermercadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupermercadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
