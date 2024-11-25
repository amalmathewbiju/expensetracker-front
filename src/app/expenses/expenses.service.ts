import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  private apiUrl = 'https://expensetracker-back.onrender.com/api/expenses';
  ; // URL to the backend for expenses

  constructor(private http: HttpClient) {}

  // Fetch all expenses
  getExpenses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Add a new expense
  addExpense(expense: any): Observable<any> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    expense.userId = currentUser._id; // Link expense to current user
    return this.http.post<any>(this.apiUrl, expense);
  }

  // Add multiple expenses from CSV import
  addMultipleExpenses(expenses: any[]): Observable<any[]> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Assign userId and generate unique IDs for each expense
    const requests = expenses.map((expense) => {
      
      expense.userId = currentUser._id;
      return this.http.post(this.apiUrl, expense);
    });

    // Send all POST requests concurrently
    return forkJoin(requests);
  }
  deleteExpense(_id: number) {
    return this.http.delete(`${this.apiUrl}/${_id}`); // Replace with your actual API endpoint
  }
  
}