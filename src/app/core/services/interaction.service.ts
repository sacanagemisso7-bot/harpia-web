import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Interaction } from '../models/interaction.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InteractionService {
  private readonly api = inject(ApiService);

  list(investorId?: string): Observable<Interaction[]> {
    let params = new HttpParams();
    if (investorId) {
      params = params.set('investorId', investorId);
    }
    return this.api.get<Interaction[]>('/interactions', params);
  }

  create(data: Partial<Interaction>): Observable<Interaction> {
    return this.api.post<Interaction>('/interactions', data);
  }

  update(id: string, data: Partial<Interaction>): Observable<Interaction> {
    return this.api.patch<Interaction>(`/interactions/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/interactions/${id}`);
  }
}
