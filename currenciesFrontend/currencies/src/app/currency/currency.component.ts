// currency.component.ts
import { Component, OnInit } from '@angular/core';
import { CurrencyRate, CurrencyService } from '../currency.service';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';


@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.css',

  standalone: true,
  imports: [FormsModule, NgIf, NgFor, DecimalPipe, DatePipe]

})
export class CurrencyComponent implements OnInit {
  rates: CurrencyRate[] = [];
  filteredRates: CurrencyRate[] = [];
  selectedDate: string = '';
  currencies: { code: string; rate: number; currency: string }[] = [];

  constructor(private currencyService: CurrencyService) { }

  ngOnInit() {
    this.loadAllRates();
  }

  loadAllRates() {
    this.currencyService.getAllFromDb().subscribe(data => {
      this.rates = data;
      this.filteredRates = data;
    });
  }

  onDateChange() {
    if (this.selectedDate) {
      this.currencyService.getCurrenciesByDate(this.selectedDate).subscribe(data => {
        this.filteredRates = data;
      });
    } else {
      this.filteredRates = this.rates;
    }
  }

}
