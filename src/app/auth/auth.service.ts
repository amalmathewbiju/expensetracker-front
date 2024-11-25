import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
 providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://expensetracker-back.onrender.com/api/users';

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

login(userName: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { userName, password }).pipe(
      map(response => {
        if (response.token) {
          localStorage.setItem('isLoggedIn', 'true');
          // Ensure you're saving the complete user object
          localStorage.setItem('currentUser', JSON.stringify(response.user)); 
          this.currentUserSubject.next(response.user); // Update the current user
          this.resetInactivityTimer();
          return response; // Return the full response
        } else {
          return null; // No token means login failed
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
