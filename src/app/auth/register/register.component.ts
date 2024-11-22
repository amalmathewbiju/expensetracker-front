import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  userNameExists: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService,private router: Router) {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email:['',Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
      
    });
  }
  onSubmit() {
    const userName = this.registerForm.value.userName;
  
    this.authService.checkuserNameUnique(userName).subscribe(users => {
      if (users.length > 0) {
        this.userNameExists = true;
      } else {
        this.authService.register(this.registerForm.value).subscribe(response => {
          console.log('User registered successfully', response);
          alert("Successfully registered");
          this.router.navigate(['/auth/login']);
        });
      }
    }, error => {
      console.error('Error checking username:', error); // Log any errors
    });
  }
}  