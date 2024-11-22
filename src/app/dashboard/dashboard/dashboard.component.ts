import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser:any = null;
  ngOnInit(): void {
    const userData = localStorage.getItem('currentUser');
    this.authService.currentUser$.subscribe(user =>{
      this.currentUser = user;
    });
    if(userData){
      this.currentUser = JSON.parse(userData);
    }
    this.authService.startInactivityTimer();
  }


  constructor(private authService:AuthService,private router:Router){}
 

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
