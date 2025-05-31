import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyService, CurrencyRate } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyService]
    });

    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Sprawdza, czy nie zostały żadne nieobsłużone requesty
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch currency codes (GET /currencies)', () => {
    const mockResponse = ['USD', 'EUR', 'PLN'];

    service.getCurrencyCodes().subscribe(codes => {
      expect(codes).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/currencies');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch currencies by date (GET /currencies/{date})', () => {
    const mockDate = '2025-05-31';
    const mockResponse: CurrencyRate[] = [
      { id: 1, code: 'USD', rate: 4.12, currency: 'dollar', effective_date: mockDate }
    ];

    service.getCurrenciesByDate(mockDate).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`http://localhost:8000/currencies/${mockDate}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch and store currencies (POST /currencies/fetch)', () => {
    const mockResponse = { success: true };

    service.fetchAndStore().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/currencies/fetch');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('should fetch all currencies from DB (GET /currenciess/db)', () => {
    const mockResponse: CurrencyRate[] = [
      { id: 1, code: 'EUR', rate: 4.50, currency: 'euro', effective_date: '2025-05-31' }
    ];

    service.getAllFromDb().subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/currenciess/db');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
