import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosComparadorComponent } from './resultados-comparador.component';

describe('ResultadosComparadorComponent', () => {
  let component: ResultadosComparadorComponent;
  let fixture: ComponentFixture<ResultadosComparadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosComparadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadosComparadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
