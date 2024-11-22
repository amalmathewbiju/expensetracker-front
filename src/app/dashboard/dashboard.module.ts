import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { ExpensesModule } from '../expenses/expenses.module';  // Import ExpensesModule
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DashboardComponent,
    ProfileComponent,
    
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    RouterModule,
    ExpensesModule,FormsModule,ReactiveFormsModule,NgxCsvParserModule
   
  ],
  exports: [
    DashboardComponent,
  ]
})
export class DashboardModule { }
