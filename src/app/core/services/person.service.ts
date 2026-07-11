import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatePersonInput, Person, PersonDetail, PersonRoleType } from '../models/person.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private readonly api = inject(ApiService);

  list(role?: PersonRoleType | '', search?: string): Observable<Person[]> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.api.get<Person[]>('/people', params);
  }

  getById(id: string): Observable<PersonDetail> {
    return this.api.get<PersonDetail>(`/people/${id}`);
  }

  create(data: CreatePersonInput): Observable<Person> {
    return this.api.post<Person>('/people', data);
  }

  update(id: string, data: Partial<Person>): Observable<Person> {
    return this.api.patch<Person>(`/people/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/people/${id}`);
  }

  addRole(id: string, role: PersonRoleType): Observable<Person> {
    return this.api.post<Person>(`/people/${id}/roles`, { role });
  }

  removeRole(id: string, role: PersonRoleType): Observable<void> {
    return this.api.delete<void>(`/people/${id}/roles/${role}`);
  }
}
