import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup} from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCard
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService)
  hide = true;
  form!: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.authService.login(this.form.value).subscribe({
        next: (response) => {
          this.router.navigate(['home/dashboard'])
        },
        error:(error)=>{
        }
      });
    }
  }
}
