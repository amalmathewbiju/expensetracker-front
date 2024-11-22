import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExpensesService } from '../expenses.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.css']
})
export class ExpensesListComponent implements OnInit {
  @ViewChild('barCanvas') barCanvas!: ElementRef;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef;
  @ViewChild('monthlyBarCanvas') monthlyBarCanvas!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'amount', 'date', 'payment', 'category', 'description', 'delete'];

  dataSource = new MatTableDataSource<any>();
  private barChart: any;
  private pieChart: any;
  private monthlyBarChart: any;
  expenses: any[] = [];
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();

  constructor(
    private expensesService: ExpensesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchExpenses(); // Initial data load
  }
  fetchExpenses() {
   
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
    this.expensesService.getExpenses().subscribe(data => {

       if (!data || data.length === 0) {
      
      console.log('Expense User IDs:', data.map(expense => expense.userId));
        console.warn('No expenses data received from the service.');
        return; // Early exit if no data is returned
       }
    //////
    
    

// Step 4: Filter the expenses based on userId and currentUser._id
this.expenses = data.filter(expense => {
  // Log the value of expense.userId and its type for debugging
 
  // Convert both expense.userId and currentUser._id to string for comparison
  const isMatching = String(expense.userId) === String(currentUser._id);


  return isMatching;
});



// Step 6: Check if no expenses found
if (this.expenses.length === 0) {
  console.warn('No expenses found for the current user.');
  return; // Early exit if no expenses for the current user
}
    
    
       this.dataSource.data = this.expenses;
       this.dataSource.paginator = this.paginator;
       this.dataSource.sort = this.sort;
    
    
       this.initializeYears();
       this.createCharts();
       this.createMonthlyBarChart();
      });
     }
    
    
     initializeYears() {
      if (!this.expenses.length) return; // If no expenses, don't proceed
    
    
      const yearsSet = new Set(this.expenses.map(expense => new Date(expense.date).getFullYear()));
      this.years = Array.from(yearsSet).sort((a, b) => b - a);
    
    
      if (!this.selectedYear || !this.years.includes(this.selectedYear)) {
       this.selectedYear = this.years[0]; // Default to the latest year if the current selection is invalid
      }
    
    
     }
    
    
     onYearChange() {
      // Convert selectedYear to number since it might be coming as string from select
      this.selectedYear = Number(this.selectedYear);
      
      // Clear existing chart before creating new one
      if (this.monthlyBarChart) {
       this.monthlyBarChart.destroy();
      }
     
      // Create new chart with updated data
      this.createMonthlyBarChart();
      
      // Force view update
      this.cdr.detectChanges();
     }
     
     applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
     }
    
    
     createCharts() {
      if (this.barChart) this.barChart.destroy();
      if (this.pieChart) this.pieChart.destroy();
    
    
      if (!this.expenses.length) return; // Ensure expenses data exists before creating charts
    
    
      const categoryTotals = this.expenses.reduce((totals: any, expense: any) => {
       totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
       return totals;
      }, {});
    
    
      const categories = Object.keys(categoryTotals);
      const amounts = Object.values(categoryTotals);
    
    
      // Bar Chart
      this.barChart = new Chart(this.barCanvas.nativeElement, {
       type: 'bar',
       data: {
        labels: categories,
        datasets: [{
         label: 'Expense Amounts by Category',
         data: amounts,
         backgroundColor: 'rgba(75, 192, 192, 0.6)',
         borderColor: 'rgba(75, 192, 192, 1)',
         borderWidth: 1
        }]
       },
       options: {
        responsive: true,
        plugins: {
         legend: {
          position: 'top',
         }
        }
       }
      });
    
    
      // Pie Chart
      this.pieChart = new Chart(this.pieCanvas.nativeElement, {
       type: 'pie',
       data: {
        labels: categories,
        datasets: [{
         data: amounts,
         backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#68ff66', '#f90000', '#9966FF', '#d4e410', '#66fffa'],
        }]
       },
       options: {
        responsive: true,
        plugins: {
         legend: {
          position: 'top',
         }
        }
       }
      });
     }
     createMonthlyBarChart(): void {
      if (!this.expenses.length) return;
     
      const filteredExpenses = this.expenses.filter(expense => {
       const expenseDate = new Date(expense.date);
       const isValidDate = expense.date && !isNaN(expenseDate.getTime());
       
       if (!isValidDate) {
        console.warn('Invalid or missing date:', expense.date);
        return false;
       }
       
       return expenseDate.getFullYear() === this.selectedYear;
      });
      const monthlyTotals = new Array(12).fill(0);
      
      filteredExpenses.forEach(expense => {
       const month = new Date(expense.date).getMonth();
       monthlyTotals[month] += expense.amount;
      });
     
      if (this.monthlyBarChart) {
       this.monthlyBarChart.destroy();
      }
     
      const chartConfig = {
       type: 'bar' as const,
       data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
        datasets: [{
         label: `Monthly Expenses for ${this.selectedYear}`,
         data: monthlyTotals,
         backgroundColor: 'rgba(54, 162, 235, 0.6)',
         borderColor: 'rgba(54, 162, 235, 1)',
         borderWidth: 1
        }]
       },
       options: {
        responsive: true,
        plugins: {
         legend: { position: 'top' as const }
        },
        scales: {
         x: { 
          title: { 
           display: true, 
           text: 'Month' 
          } 
         },
         y: { 
          title: { 
           display: true, 
           text: 'Amount ($)' 
          }, 
          beginAtZero: true 
         }
        }
       }
      };
     
      this.monthlyBarChart = new Chart(this.monthlyBarCanvas.nativeElement, chartConfig);
     }

     onDeleteExpense(expense: any): void {
      const confirmDelete = confirm(`Are you sure you want to delete the expense: ${expense.name}?`);
      if (confirmDelete) {
        this.expensesService.deleteExpense(expense._id).subscribe(
          () => {
            console.log('Expense deleted successfully');
            this.fetchExpenses(); // Refresh the list after deletion
          },
          (error) => {
            console.error('Error deleting expense:', error);
          }
        );
      }
    }
    
    }
    