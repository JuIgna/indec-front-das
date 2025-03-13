import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObtenerLocalidadesService {

  private apiUrl = 'http://localhost:8084/api/v1/indec/obtenerLocalidades';
  private username = 'indec123';
  private password = 'indec123';

  constructor(private http: HttpClient) {}

  getLocalidades(cod_pais: string, cod_provincia: string): Observable<any[]> {
    const authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
    const headers = new HttpHeaders({
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    });

    const body = { cod_pais, cod_provincia }; // JSON con cod_pais y cod_provincia

    return this.http.post<any[]>(this.apiUrl, body, { headers });
  }
}
