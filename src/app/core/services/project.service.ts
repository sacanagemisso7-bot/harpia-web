import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Project, ProjectStatus } from '../models/project.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly api = inject(ApiService);

  list(status?: ProjectStatus | ''): Observable<Project[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.api.get<Project[]>('/projects', params);
  }

  getById(id: string): Observable<Project> {
    return this.api.get<Project>(`/projects/${id}`);
  }

  create(data: Partial<Project>): Observable<Project> {
    return this.api.post<Project>('/projects', data);
  }

  update(id: string, data: Partial<Project>): Observable<Project> {
    return this.api.patch<Project>(`/projects/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/projects/${id}`);
  }
}
