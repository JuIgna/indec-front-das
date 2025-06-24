import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministradorSupermercadosComponent } from './administrador-supermercados.component';

describe('AdministradorSupermercadosComponent', () => {
  let component: AdministradorSupermercadosComponent;
  let fixture: ComponentFixture<AdministradorSupermercadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorSupermercadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministradorSupermercadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
