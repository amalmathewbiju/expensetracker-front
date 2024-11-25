// profile.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
 selector: 'app-profile',
 templateUrl: './profile.component.html',
 styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
 profileForm!: FormGroup;
 isEditMode: boolean = false;
 currentUser: any;

 constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

 ngOnInit(): void {
 this.authService.currentUser$.subscribe(user => {
  this.currentUser = user;
  if (this.currentUser) {
  this.initializeForm();
  }
 });
 }

 initializeForm() {
 this.profileForm = this.fb.group({
  userName: [{ value: this.currentUser.userName, disabled: true }],
  name: [this.currentUser.name, ],
  email: [this.currentUser.email, [Validators.email]],
  password: [this.currentUser.password, [ Validators.minLength(6)]]
 });
 }

 toggleEditMode() {
 this.isEditMode = !this.isEditMode;
 if (!this.isEditMode) {
  this.initializeForm(); // Reset form if edit mode is canceled
 }
 }

onSaveChanges() {

  
   if (this.profileForm.valid) {
    const formValues = this.profileForm.getRawValue();
 
    const updatedProfile = {
    ...this.currentUser,
    name: formValues.name,
    email: formValues.email,
    // Only include password if it has been changed
    password: formValues.password ? formValues.password : this.currentUser.password
  
    };
  
  
  
    this.authService.updateProfile(this.currentUser._id, updatedProfile).subscribe({
    next: response => {
     
     alert('Profile updated successfully.');
     this.isEditMode = false; // Exit edit mode
     const { password, ...safeData } = updatedProfile;
     this.authService.updateLocalStorageUser(safeData);
    },
    error: err => {
     console.error('Error updating profile:', err);
     alert('Failed to update profile.');
    }
    });
   } else {
    
    alert("fill all fields")
   }
  }
  

 onDeleteAccount() {
 if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  this.authService.deleteAccount(currentUser._id).subscribe(response => {
  alert('Your account has been deleted.');
  localStorage.removeItem('currentUser');
  this.router.navigate(['/auth/register']);
  }, error => {
  alert('Failed to delete account. Please try again.');
  });
 }
 }
}
