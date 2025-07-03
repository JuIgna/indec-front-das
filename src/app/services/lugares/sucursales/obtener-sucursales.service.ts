import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // Importa el entorno para obtener la URL de la API
import { SucursalInterface } from '../../../components/interfaces/sucursal';

@Injectable({
  providedIn: 'root'
})
export class ObtenerSucursalesService {

  private apiUrl = environment.apiUrl;
  private username = environment.user;
  private password = environment.password;
  private authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
  private headers = new HttpHeaders({
    'Authorization': this.authHeader,
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getSucursales(nro_localidad: string, lista_supermercados: string[]): Observable<any[]> {
    const body = { nro_localidad, lista_supermercados };
    console.log('Cuerpo de la solicitud:', body); // Para depuración
    return this.http.post<any[]>(this.apiUrl + 'ubicaciones/obtenerSucursalesLocalidad', body, { headers: this.headers });
  }


}
