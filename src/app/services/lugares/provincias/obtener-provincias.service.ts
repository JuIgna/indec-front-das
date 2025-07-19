import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { provincia } from '../../../components/interfaces/provincia';

@Injectable({
  providedIn: 'root'
})
export class ObtenerProvinciasService {

  private apiUrl = 'http://localhost:8084/api/v1/indec/ubicaciones/obtenerProvincias';
  private username = 'indec123';
  private password = 'indec123';

  constructor(private http: HttpClient) {}

  getProvincias(cod_pais: string): Observable<provincia[]> {
    const authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
    const headers = new HttpHeaders({
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    });

    const body = { cod_pais };

    return this.http.post<provincia[]>(this.apiUrl, body, { headers });
  }
}
