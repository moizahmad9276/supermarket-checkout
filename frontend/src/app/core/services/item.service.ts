import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Item, ItemRequest } from '../models/checkout.models';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/items`;

  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(this.baseUrl);
  }

  getById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/${id}`);
  }

  create(request: ItemRequest): Observable<Item> {
    return this.http.post<Item>(this.baseUrl, request);
  }

  update(id: number, request: ItemRequest): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
