// currency.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CurrencyRate {
  id?: number;
  currency: string;
  code: string;
  rate: number;
  effective_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private API_URL = 'http://localhost:8000';

  constructor(private http: HttpClient) { }



  getCurrencyCodes(): Observable<any> {
    return this.http.get(`${this.API_URL}/currencies`);
  }

  getCurrenciesByDate(date: string): Observable<any> {
    return this.http.get(`${this.API_URL}/currencies/${date}`);
  }


  fetchAndStore(): Observable<any> {
    return this.http.post(`${this.API_URL}/currencies/fetch`, {});
  }


  getAllFromDb(): Observable<any> {
    return this.http.get(`${this.API_URL}/currenciess/db`);
  }
}
