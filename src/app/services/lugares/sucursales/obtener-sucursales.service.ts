import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObtenerSucursalesService {

  private apiUrl = 'http://localhost:8084/api/v1/indec/ubicaciones/obtenerSucursalesLocalidad';
  private username = 'indec123';
  private password = 'indec123';

  constructor(private http: HttpClient) {}

  getSucursales(nro_localidad: string): Observable<any[]> {
    const authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
    const headers = new HttpHeaders({
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    });

    const body = { nro_localidad };

    return this.http.post<any[]>(this.apiUrl, body, { headers });
  }
}
