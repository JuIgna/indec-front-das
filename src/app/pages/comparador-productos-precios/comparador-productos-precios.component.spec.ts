import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparadorProductosPreciosComponent } from './comparador-productos-precios.component';

describe('ComparadorProductosPreciosComponent', () => {
  let component: ComparadorProductosPreciosComponent;
  let fixture: ComponentFixture<ComparadorProductosPreciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparadorProductosPreciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparadorProductosPreciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
