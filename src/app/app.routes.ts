import { Routes } from '@angular/router';
import { ComparadorProductosPreciosComponent } from './pages/comparador-productos-precios/comparador-productos-precios.component';
import { BuscadorSucursalesComponent } from './pages/buscador-sucursales/buscador-sucursales.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ResultadosComparadorComponent } from './pages/resultados-comparador/resultados-comparador.component';

export const routes: Routes = [
    {path: 'home', component: HomePageComponent,
        children: [
            {path: 'comparador-productos', component: ComparadorProductosPreciosComponent, children: [
                {path: 'resultados-comparador', component: ResultadosComparadorComponent}
            ]},
            {path: 'buscador-sucursales',component: BuscadorSucursalesComponent},
        ]
    },
    {path: '**', redirectTo:'home'}
];
