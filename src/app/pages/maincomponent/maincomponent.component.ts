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

 constructor( private router: Router,public themeService: ThemeService){}
 
 toggleTheme(): void {
   this.themeService.toggleTheme();
 }
 logout(){
  this.authService.logout();
  this.router.navigate(['login'])
 }
}
