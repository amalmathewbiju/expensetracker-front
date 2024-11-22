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
  name: [this.currentUser.name, [Validators.required]],
  email: [this.currentUser.email, [Validators.required, Validators.email]],
  password: [this.currentUser.password, [Validators.required, Validators.minLength(6)]]
 });
 }

 toggleEditMode() {
 this.isEditMode = !this.isEditMode;
 if (!this.isEditMode) {
  this.initializeForm(); // Reset form if edit mode is canceled
 }
 }

// onSaveChanges() {
//   console.log('Save Changes button clicked'); // Debug log
//   console.log('Form Valid:', this.profileForm.valid); // Check form validity
//   console.log('Form Value:', this.profileForm.value); // Log form values

//   if (this.profileForm.valid) {
//     const updatedProfile = {
//       ...this.currentUser,
//       ...this.profileForm.getRawValue()
//     };
//     console.log('Updated Profile:', updatedProfile); // Log updated profile

//     this.authService.updateProfile(this.currentUser._id, updatedProfile).subscribe({
//       next: response => {
//         console.log('Profile updated successfully:', response);
//         alert('Profile updated successfully.');
//         this.isEditMode = false; // Exit edit mode
//         const { password, ...safeData } = updatedProfile;
//         this.authService.updateLocalStorageUser(safeData);
//       },
//       error: err => {
//         console.error('Error updating profile:', err);
//         alert('Failed to update profile.');
//       }
//     });
//   } else {
//     console.log('Form is invalid'); // Log if the form is invalid
//   }
// }
onSaveChanges() {
 console.log('Save Changes button clicked');
  alert('Profile updated successfully.');
 console.log('Form Valid:', this.profileForm.valid);
   console.log('Form Value:', this.profileForm.value);
  
   if (this.profileForm.valid) {
    const formValues = this.profileForm.getRawValue();
 
    const updatedProfile = {
    ...this.currentUser,
    name: formValues.name,
    email: formValues.email,
    // Only include password if it has been changed
    password: formValues.password ? formValues.password : this.currentUser.password
  
    };
  
  
    console.log('Updated Profile:', updatedProfile);
  
    this.authService.updateProfile(this.currentUser._id, updatedProfile).subscribe({
    next: response => {
     console.log('Profile updated successfully:', response);
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
    console.log('Form is invalid');
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
