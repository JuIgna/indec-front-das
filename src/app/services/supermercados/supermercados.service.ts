import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { supermercado } from '../../components/interfaces/supermercado';

@Injectable({
  providedIn: 'root',
})
export class SupermercadosService {
  private apiUrl = 'http://localhost:8084/api/v1/indec/obtenerSupermercados';
  private username = 'indec123';
  private password = 'indec123';

  constructor(private http: HttpClient) {}

  getSupermercados(): Observable<supermercado[]> {
    const authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
    const headers = new HttpHeaders({
      Authorization: authHeader,
      'Content-Type': 'application/json',
    });

    return this.http.get<supermercado[]>(this.apiUrl, { headers });
  }


}
