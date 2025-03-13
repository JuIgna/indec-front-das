import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompararPreciosService {

  private apiUrl = 'http://localhost:8084/api/v1/indec/compararPrecios';
  private username = 'indec123';
  private password = 'indec123';

  constructor(private http: HttpClient) {}

  getCompararPrecios(codigos_barras: any[], nro_localidad: string): Observable<any[]> {
  if (!codigos_barras || codigos_barras.length === 0) {
    console.error('No hay códigos de barra para comparar.');
    return new Observable(observer => {
      observer.error('No hay códigos de barra para comparar.');
    });
  }

  const authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
  const headers = new HttpHeaders({
    'Authorization': authHeader,
    'Content-Type': 'application/json'
  });

  const body = { codigos_barras, nro_localidad };

  return this.http.post<any[]>(this.apiUrl, body, { headers });
}

}
