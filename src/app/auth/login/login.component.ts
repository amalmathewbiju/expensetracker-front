import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  loginFailed: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  onSubmit() {
     const { userName, password } = this.loginForm.value;
    
     this.authService.login(userName, password).subscribe(response => {
      if (response.token) {
       const userToStore = {
        _id: response.user._id, // Ensure ID is saved
        userName: response.user.userName,
        name: response.user.name,
        token: response.token // Store the token
       };
    
       localStorage.setItem('currentUser', JSON.stringify(userToStore));
       localStorage.setItem('isLoggedIn', 'true'); // Set login status
       this.router.navigate(['/dashboard/dashboard']);
      } else {
       this.loginFailed = true;
      }
     }, error => {
      console.error('Login error:', error);
      this.loginFailed = true;
     });
    }
    
}  