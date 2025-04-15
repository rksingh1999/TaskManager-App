import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { LoginRequest } from '../interfaces/login-request';
import { AuthResponse } from '../interfaces/auth-response';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = environment.apiUrl;
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}api/Auth/login`, data).pipe(
      map((response) => {
        if (response.isSuccess) {
          localStorage.setItem(this.tokenKey, response.token);
          const userData = this.getUserDetail();
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        return response;
      })
    );
  }

  getUserList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}api/Auth/users`);
  }
 
   getUserDetail() {
    const token = this.getToken();
    if (!token) return null;

    const decoded: any = jwtDecode(token);

    return {
      id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      fullName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
    };
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const decoded: any = jwtDecode(token);
    const isExpired = Date.now() >= decoded['exp'] * 1000;

    if (isExpired) this.logout();
    return isExpired;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
