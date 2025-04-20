import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-maincomponent',
  standalone: true,
  imports: [ 
    RouterModule,
 ],
  templateUrl: './maincomponent.component.html',
  styleUrl: './maincomponent.component.css'
})
export class MaincomponentComponent {
 authService = inject(AuthService);
 themeService = inject(ThemeService);

 constructor( private router: Router){}
 
 toggleTheme(): void {
   this.themeService.toggleTheme();
 }
 logout(){
  this.authService.logout();
  localStorage.removeItem('token');
  this.router.navigate(['login'])
 }
}
