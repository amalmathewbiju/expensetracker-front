import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users'; 
  private currentUserSubject = new BehaviorSubject<any>(null);
  private inactivityTimeout: any;
  private readonly timeoutDuration = 3600000;

  constructor(private http: HttpClient, private router: Router) {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
    this.startInactivityTimer();
  }

  get currentUser$(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  startInactivityTimer() {
    this.resetInactivityTimer();
    window.addEventListener('mousemove', this.resetInactivityTimer.bind(this));
    window.addEventListener('keydown', this.resetInactivityTimer.bind(this));
  }

  private resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => this.autoLogout(), this.timeoutDuration);
  }

  private autoLogout() {
    this.logout();
    alert('You have been logged out due to inactivity.');
  }

  updateLocalStorageUser(updatedUser: any): void {
    const { password, ...safeData } = updatedUser;
    localStorage.setItem('currentUser', JSON.stringify(safeData));
    this.currentUserSubject.next(safeData);
  }
  updateProfile(_id: string, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${_id}`, profileData);
}

  deleteAccount(_id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${_id}`);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('isLoggedIn');
  }

  register(user: any): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  login(userName: string, password: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userName=${userName}`).pipe(
      map(users => {
        const user = users.find(u => u.password === password);
        if (user) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.resetInactivityTimer();
          return [user];
        } else {
          return [];
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
    clearTimeout(this.inactivityTimeout);
  }

  checkuserNameUnique(userName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userName=${userName}`).pipe(
      map(users => users.filter(user => user.userName === userName))
    );
  }
  getUserByuserName(userName: string): Observable<any | null> {
    return this.http.get<any[]>(`${this.apiUrl}?userName=${userName}`).pipe(
      map(users => users.length > 0 ? users[0] : null)  
    );
  }

 
}
