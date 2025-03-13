import { TestBed } from '@angular/core/testing';

import { CompararPreciosService } from './comparar-precios.service';

describe('CompararPreciosService', () => {
  let service: CompararPreciosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompararPreciosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
