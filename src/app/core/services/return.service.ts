import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Return, ReturnStatus } from '../models/return.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReturnService {
  private readonly api = inject(ApiService);

  list(investmentId?: string, status?: ReturnStatus | ''): Observable<Return[]> {
    let params = new HttpParams();
    if (investmentId) {
      params = params.set('investmentId', investmentId);
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.api.get<Return[]>('/returns', params);
  }

  create(data: Partial<Return>): Observable<Return> {
    return this.api.post<Return>('/returns', data);
  }

  update(id: string, data: Partial<Return>): Observable<Return> {
    return this.api.patch<Return>(`/returns/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/returns/${id}`);
  }
}
