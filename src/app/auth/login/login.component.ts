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
    this.authService.login(userName, password).subscribe(users => {
      if (users.length > 0) {
        const userToStore = {
          _id: users[0]._id,  // Ensure ID is saved
          userName: users[0].userName,
          name: users[0].name
        };
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
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