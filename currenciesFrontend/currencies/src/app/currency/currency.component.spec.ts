import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyComponent } from './currency.component';
import { of } from 'rxjs';
import { CurrencyService, CurrencyRate } from '../currency.service';
import { By } from '@angular/platform-browser';

// Mock CurrencyService
class MockCurrencyService {
  getAllFromDb() {
    const mockRates: CurrencyRate[] = [
      { code: 'USD', rate: 4.12, currency: 'Dollar', effective_date: '2025-05-31' },
      { code: 'EUR', rate: 4.50, currency: 'Euro', effective_date: '2025-05-31' }
    ];
    return of(mockRates);
  }

  getCurrenciesByDate(date: string) {
    const filteredRates: CurrencyRate[] = [
      { code: 'USD', rate: 4.10, currency: 'Dollar', effective_date: date }
    ];
    return of(filteredRates);
  }
}

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;
  let currencyService: CurrencyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyComponent],
      providers: [
        { provide: CurrencyService, useClass: MockCurrencyService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load all rates on init', () => {
    spyOn(currencyService, 'getAllFromDb').and.callThrough();
    component.ngOnInit();
    expect(currencyService.getAllFromDb).toHaveBeenCalled();
    expect(component.rates.length).toBe(2);
    expect(component.filteredRates.length).toBe(2);
  });

  it('should filter rates when selectedDate is set', () => {
    spyOn(currencyService, 'getCurrenciesByDate').and.callThrough();

    component.selectedDate = '2025-05-31';
    component.onDateChange();

    expect(currencyService.getCurrenciesByDate).toHaveBeenCalledWith('2025-05-31');
    expect(component.filteredRates.length).toBe(1);
    expect(component.filteredRates[0].code).toBe('USD');
  });

  it('should reset filteredRates to all rates when selectedDate is empty', () => {
    component.rates = [
      { code: 'USD', rate: 4.12, currency: 'Dollar', effective_date: '2025-05-31' },
      { code: 'EUR', rate: 4.50, currency: 'Euro', effective_date: '2025-05-31' }
    ];
    component.selectedDate = '';
    component.filteredRates = []; // pusty przed wywołaniem metody

    component.onDateChange();

    expect(component.filteredRates.length).toBe(2);
  });
});
