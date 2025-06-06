import { Routes } from '@angular/router';
import { MaincomponentComponent } from './pages/maincomponent/maincomponent.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { TaskTableComponent } from './pages/task-table/task-table.component';

export const routes: Routes = [
  {
    path: 'home',
    component: MaincomponentComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HomeComponent ,canActivate: [AuthGuard],},
      { path: 'taskTable', component: TaskTableComponent,canActivate: [AuthGuard],}
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
