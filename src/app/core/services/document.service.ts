import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly api = inject(ApiService);

  list(investorId?: string, investmentId?: string): Observable<Document[]> {
    let params = new HttpParams();
    if (investorId) {
      params = params.set('investorId', investorId);
    }
    if (investmentId) {
      params = params.set('investmentId', investmentId);
    }
    return this.api.get<Document[]>('/documents', params);
  }

  upload(formData: FormData): Observable<Document> {
    return this.api.postFormData<Document>('/documents', formData);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/documents/${id}`);
  }
}
