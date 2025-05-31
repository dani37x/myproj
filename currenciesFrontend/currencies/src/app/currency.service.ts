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


  // GET /currencies
  getCurrencyCodes(): Observable<any> {
    return this.http.get(`${this.API_URL}/currencies`);
  }

  // GET /currencies/{date}
  getCurrenciesByDate(date: string): Observable<any> {
    return this.http.get(`${this.API_URL}/currencies/${date}`);
  }

  // POST /currencies/fetch
  fetchAndStore(): Observable<any> {
    return this.http.post(`${this.API_URL}/currencies/fetch`, {});
  }

  // ✅ Corrected endpoint: GET /currencies/db
  getAllFromDb(): Observable<any> {
    return this.http.get(`${this.API_URL}/currenciess/db`);
  }
}
