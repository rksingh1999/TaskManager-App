import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllTask(id:string): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}api/ManageTask/GetAllTask?userId=${id}`);
  }

  addTask(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}api/ManageTask/CreateTask`, data);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}api/ManageTask/DeleteTaskById/${id}`);
  }

  updateTask(taskId: string, taskData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}api/ManageTask/UpdateTaskById/${taskId}`, taskData);
  }

  getTaskById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}api/TaskItems/GetTaskItemById/${id}`);
  }
}
