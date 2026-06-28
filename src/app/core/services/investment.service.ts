import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Investment } from '../models/investment.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InvestmentService {
  private readonly api = inject(ApiService);

  list(investorId?: string, projectId?: string): Observable<Investment[]> {
    let params = new HttpParams();
    if (investorId) {
      params = params.set('investorId', investorId);
    }
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    return this.api.get<Investment[]>('/investments', params);
  }

  create(data: Partial<Investment>): Observable<Investment> {
    return this.api.post<Investment>('/investments', data);
  }

  update(id: string, data: Partial<Investment>): Observable<Investment> {
    return this.api.patch<Investment>(`/investments/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/investments/${id}`);
  }
}
