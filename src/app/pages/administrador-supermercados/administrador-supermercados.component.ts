import { Component } from '@angular/core';
import { SupermercadoInterface } from '../../components/interfaces/supermercado';
import { SupermercadosService } from '../../services/supermercados/supermercados.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-administrador-supermercados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './administrador-supermercados.component.html',
  styleUrl: './administrador-supermercados.component.css'
})
export class AdministradorSupermercadosComponent {
  supermercados: SupermercadoInterface[] = [];
  acciones: String[] = ['Sucursales', 'Productos', 'Precios']

  constructor (
    private supermercadoService: SupermercadosService
  ) {}

  ngOnInit(): void{
    this.supermercadoService.getSupermercados().subscribe(data =>{
      this.supermercados = data;
    })
  }
}
