// components/add-expense.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ExpensesService } from '../expenses.service';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css'],
})
export class AddExpenseComponent implements OnInit {
  @Output() expenseAdded = new EventEmitter<void>();

  expenseForm: FormGroup;
  categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Other'];
  selectedCategory: string | null = null;
  dropdownOpen = false;
  currentUser: any = null;
  importedExpenses: any[] = [];
  isCSVValid = false;
  isReadMoreVisible = false; // Keeps track of whether the "Read More" section is visible

  constructor(
    private fb: FormBuilder,
    private expensesService: ExpensesService,
    private ngxCsvParser: NgxCsvParser
  ) {
    this.expenseForm = this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      date: ['', Validators.required],
      payment: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Fetch logged-in user from localStorage
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  toggleReadMore(): void {
    this.isReadMoreVisible = !this.isReadMoreVisible;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.expenseForm.controls['category'].setValue(category);
    this.dropdownOpen = false;
  }

  addCategory(): void {
    const newCategory = prompt('Enter new category:');
    if (newCategory && !this.categories.includes(newCategory.trim())) {
      this.categories.push(newCategory.trim());
    } else if (newCategory) {
      alert('This category already exists.');
    }
  }

  editCategory(index: number): void {
    const updatedCategory = prompt('Edit category:', this.categories[index]);
    if (
      updatedCategory &&
      !this.categories.includes(updatedCategory.trim())
    ) {
      this.categories[index] = updatedCategory.trim();
    } else if (updatedCategory) {
      alert('This category already exists.');
    }
  }

  deleteCategory(index: number): void {
    if (confirm(`Are you sure you want to delete "${this.categories[index]}"?`)) {
      this.categories.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const expenseData = {
        ...this.expenseForm.value,
        userId: this.currentUser?._id, // Ensure the expense is associated with the current user
      };

      this.expensesService.addExpense(expenseData).subscribe({
        next: () => {
          alert('Expense added successfully!');
          this.expenseForm.reset();
          this.expenseAdded.emit();
        },
        error: (error) => {
          console.error('Error adding expense:', error);
          alert('Failed to add expense. Please try again.');
        },
      });
    } else {
      alert('Please fill in all fields correctly.');
    }
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.ngxCsvParser.parse(file, { header: true, delimiter: ',' }).subscribe({
        next: (result: any[] | NgxCSVParserError) => {
          if (Array.isArray(result)) {
            // Transform CSV data to match the required expense format
            const transformedExpenses = result.map((expense) => ({
              name: expense.name || '',
              amount: parseFloat(expense.amount) || 0,
              date: expense.date || new Date().toISOString(),
              payment: expense.payment || '',
              category: expense.category || 'Uncategorized',
              description: expense.description || '',
            }));
  
            // Send transformed expenses to the mock JSON server
            this.expensesService.addMultipleExpenses(transformedExpenses).subscribe({
              next: () => {
                alert('Expenses imported successfully!');
                this.expenseAdded.emit(); // Notify parent component to update the list
                event.target.value = ''; // Reset the file input field
              },
              error: (error) => {
                console.error('Error adding expenses:', error);
                alert('Failed to import expenses. Please try again.');
              },
            });
          } else {
            console.error('Error parsing CSV:', result.message);
            alert('Failed to parse CSV file. Please ensure it is correctly formatted.');
          }
        },
        error: (error: NgxCSVParserError) => {
          console.error('Error parsing CSV:', error);
          alert('An error occurred while parsing the CSV file.');
        },
      });
    }
  }
  


  importExpenses(): void {
    if (this.importedExpenses.length === 0) {
      alert('No expenses to import. Please upload a valid CSV file.');
      return;
    }

    this.importedExpenses.forEach((expense) => {
      // Validate and process each expense
      if (
        expense.name &&
        expense.amount &&
        expense.date &&
        expense.payment &&
        expense.category &&
        expense.description
      ) {
        this.expensesService.addExpense(expense).subscribe({
          next: () => {
            console.log('Expense imported:', expense);
          },
          error: (error) => {
            console.error('Error adding expense from CSV:', error);
          }
        });
      } else {
        console.warn('Invalid expense data:', expense);
      }
    });

    alert('Expenses imported successfully!');
    this.expenseAdded.emit(); // Notify parent component
    this.importedExpenses = []; // Clear imported expenses
  }
}