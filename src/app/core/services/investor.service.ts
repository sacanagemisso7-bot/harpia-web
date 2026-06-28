import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Investor, InvestorStatus } from '../models/investor.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InvestorService {
  private readonly api = inject(ApiService);

  list(status?: InvestorStatus | '', search?: string): Observable<Investor[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.api.get<Investor[]>('/investors', params);
  }

  getById(id: string): Observable<Investor> {
    return this.api.get<Investor>(`/investors/${id}`);
  }

  create(data: Partial<Investor>): Observable<Investor> {
    return this.api.post<Investor>('/investors', data);
  }

  update(id: string, data: Partial<Investor>): Observable<Investor> {
    return this.api.patch<Investor>(`/investors/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/investors/${id}`);
  }
}
