import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObtenerIdiomasService {

  private apiUrl = 'http://localhost:8084/api/v1/indec/regionalizacion/obtenerIdiomas';
  private username = 'indec123';
  private password = 'indec123';

  constructor(private http: HttpClient) {}

  getIdiomas(): Observable<any[]> {
    const authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
    const headers = new HttpHeaders({
      'Authorization': authHeader
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }
}
