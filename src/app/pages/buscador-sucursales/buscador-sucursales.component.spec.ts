import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorSucursalesComponent } from './buscador-sucursales.component';

describe('BuscadorSucursalesComponent', () => {
  let component: BuscadorSucursalesComponent;
  let fixture: ComponentFixture<BuscadorSucursalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorSucursalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscadorSucursalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
