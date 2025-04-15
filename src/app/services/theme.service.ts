import { Injectable } from '@angular/core';
 
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDark = false;
 
  toggleTheme(): void {
    this.isDark = !this.isDark;
    const body = document.body;
    if (this.isDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
 
  isDarkTheme(): boolean {
    return this.isDark;
  }
}
 