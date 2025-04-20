import { Component, computed, inject, signal, Signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { TaskService } from '../../services/task.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Role, Task } from '../../interfaces/task-interface';
import { TaskTableComponent } from '../task-table/task-table.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatSnackBarModule,
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    MatCard,
    TaskTableComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  loggedinUserDetails = this.authService.getUserDetail();
  form!: FormGroup;
  tableData = signal<Task[]>([]);
  sendTaskList= signal<Task[]>([]);
  filterType = signal<string>('');
  isEdit = signal(false);
  isUserDisabled = signal(true);
  isSecondAccordionOpen = signal(false);
  rowData: any = '';
  userList: Role[] = [];
  selectedRoleId!: Role;
  minDate: string = '';
  statusOptions = ['Pending', 'InProgress', 'Done'];

  tableHeaders: (keyof Task)[] = [
    'title',
    'description',
    'status',
    'dueDate',
    'assigneeName',
  ];


  constructor(private fb: FormBuilder,private snackBar: MatSnackBar) {}

  ngOnInit() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.getAllTask();
    this.getUserList();

    this.form = this.fb.group({
      title: ['', Validators.required],
      discription: ['', Validators.required],
      dueDate: ['', Validators.required],
      status: ['', Validators.required],
      assignTo: [
        {
          value: this.getDefaultAssignedUser(),
          disabled: this.isUserDisabled(),
        },
        Validators.required,
      ],
    });

  }

  get title() {
    return this.form.get('title');
  }
  
  receiveTaskForAction=(task?: Task,action?:string) => {
    console.log("received from child",task, action);
    if(action == 'edit'){
      this.editRow(task);
    }
    if(action =='delete'){
      this.deleteRow(task);
    }
    if(action =='add'){
      this.isSecondAccordionOpen.set(true);
    }
  }

  getDefaultAssignedUser(): any {
    if (this.loggedinUserDetails?.role !== 'Admin') {
      return (
        this.userList.find((x) => x.id === this.loggedinUserDetails?.id) || null
      );
    }
    return null;
  }

  getAllTask() {
    let id = '';
    if (this.loggedinUserDetails?.role !== 'Admin') {
      id = this.loggedinUserDetails?.id;
      this.isUserDisabled.set(true);
    } else {
      this.isUserDisabled.set(false);
    }

    this.taskService.getAllTask(id).subscribe({
      next: (taskList) => {
        this.tableData.set(taskList);
        this.sendTaskList.set(taskList);
      },
      error: (error) => {},
    });
  }

  getUserList() {
    this.authService.getUserList().subscribe({
      next: (users) => {
        this.userList = users;
        this.form.patchValue({
          assignTo: this.userList.find(
            (x) => x.id === this.loggedinUserDetails?.id
          )?.id,
        });
      },
      error: () => {},
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const isUser = this.loggedinUserDetails?.role === 'User';
      const payload: any = {
        title: this.form.value.title,
        description: this.form.value.discription,
        status: this.form.value.status,
        dueDate: this.form.value.dueDate,
        assignedTo: isUser
          ? this.loggedinUserDetails?.id
          : this.form.value.assignTo,
        assignedBy: this.loggedinUserDetails?.id,
        assigneeName: isUser
          ? this.loggedinUserDetails?.fullName
          : this.userList.find((x) => x.id === this.form.value.assignTo)
              ?.userName,
      };

      if (!this.isEdit()) {
        this.taskService.addTask(payload).subscribe({
          next: () => {
            this.snackBar.open('Record saved successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.isSecondAccordionOpen.set(false);
            this.getAllTask();
            this.isEdit.set(false);
            this.form.reset();
            this.form.patchValue({
              assignTo: this.userList.find(
                (x) => x.id === this.loggedinUserDetails?.id
              )?.id,
            });
          },
          error(err) {
            
          },
        });
      } else {
        payload.id = this.rowData.id;
        this.taskService.updateTask(this.rowData.id, payload).subscribe({
          next: () => {
            this.snackBar.open('Record Updated successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.isSecondAccordionOpen.set(false);
            this.getAllTask();
            this.isEdit.set(false);
            this.form.reset();
          },
        });
      }
    }
  }

  editRow(row: any) {
    this.isEdit.set(true);
    this.rowData = row;
    this.isSecondAccordionOpen.set(true);
    this.selectedRoleId = this.userList.find((x) => x.id === row.assignedTo)!;
    this.form.patchValue({
      title: row.title,
      discription: row.description,
      status: row.status,
      dueDate: row.dueDate,
      assignTo: row.assignedTo,
      assignedBy: row?.assignedBy,
      assigneeName: row.assigneeName,
    });
  }

  onCancel() {
    this.isSecondAccordionOpen.set(false);
  }

  deleteRow(row: any) {
    this.taskService.deleteTask(row.id).subscribe({
      next: (data) => {
        this.snackBar.open('Record Deleted successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.getAllTask()
      },
      error(err) {
        
      },
    });
  }
}


