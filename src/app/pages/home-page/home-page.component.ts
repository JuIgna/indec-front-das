import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  showSplash: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
      // Solo redirigir si la ruta actual es exactamente '/home'
      if (this.router.url === '/home') {
        this.goToPriceComparator();
      }
    }, 2000); // 2 segundos de splash
  }

  goToPriceComparator() {
    console.log('Redirigiendo a Comparador de Productos...');
    this.router.navigate(['/home/comparador-productos']);
  }
}
