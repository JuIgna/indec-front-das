import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SupermercadoInterface } from '../../components/interfaces/supermercado';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class SupermercadosService {
  private apiUrl = environment.apiUrl
  private username =  environment.user;
  private password = environment.password;

  constructor(private http: HttpClient) {}

  getSupermercados(): Observable<SupermercadoInterface[]> {
    const authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
    const headers = new HttpHeaders({
      Authorization: authHeader,
      'Content-Type': 'application/json',
    });

    return this.http.get<SupermercadoInterface[]>(this.apiUrl + 'productos/obtenerSupermercados', { headers });
  }


}
