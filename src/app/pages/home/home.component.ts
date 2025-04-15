import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    MatCard,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'], 
})
export class HomeComponent {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  loggedinUserDetails = this.authService.getUserDetail();
  form!: FormGroup;
  isEdit: boolean = false;
  rowData: any = '';
  isUserDisabled = true;
  tableData = [
  ];
  isSecondAccordionOpen = false;
  userList:Role[] = [];
  selectedRoleId!:Role;
  tableHeaders: (keyof (typeof this.tableData)[number])[] = [
    'title',
    'description',
    'status',
    'dueDate',
    'assigneeName',
  ];

  statusOptions= ['Pending' , 'InProgress' , 'Done']
  filters: string[] = ['', '', ''];

  filteredData = [...this.tableData];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.filteredData = this.tableData;
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
          disabled: this.isUserDisabled
        },
        Validators.required
      ]  
    });
  this.filters = new Array(this.tableHeaders.length).fill('');

  }
  panelState = {
    taskList: true,
    addEditTask: false,
  };
  getDefaultAssignedUser(): any {
    this.getUserList();
    if (this.loggedinUserDetails?.role !== 'Admin') {
      return this.userList.find(x => x.id === this.loggedinUserDetails?.id) || null;
    }
    return null;
  }
  getAllTask() {
    this.filteredData= [];
    var id = '';
    if(this.loggedinUserDetails?.role != 'Admin'){
      id = this.loggedinUserDetails?.id;
      this.isUserDisabled = true;
    }else{
      this.isUserDisabled = false;
    }
    
    this.taskService.getAllTask(id).subscribe({
      next: (taskList) => {
        this.tableData = taskList;
        console.log('task List', taskList,this.tableData);
        this.filteredData = [...this.tableData];

      },
      error: (error) => {},
    });
  }

  getUserList(){
    this.authService.getUserList().subscribe({
      next: (users) =>{
        this.userList = users;
        this.form.patchValue({
            "assignTo": this.userList.filter(x => x.id === this.loggedinUserDetails?.id)[0].id,
          })
        console.log('user lisr',this.userList)
      },
      error: (error) => {

      }
    })
  }
  onSubmit(): void {
    this.isSecondAccordionOpen = false;
    if (this.form.valid) {
      const payload = {
        "title": this.form.value.title,
        "description": this.form.value.discription,
        "status": this.form.value.status,
        "dueDate": this.form.value.dueDate,
        "assignedTo": this.loggedinUserDetails?.role == 'User' ? this.loggedinUserDetails.id : this.form.value.assignTo,
        "assignedBy": this.loggedinUserDetails?.id,
        "assigneeName": this.loggedinUserDetails?.role == 'User' ? this.loggedinUserDetails.fullName : this.userList?.filter((x) => x.id == this.form.value.assignTo)[0].userName
      }
      if( !this.isEdit){
      this.taskService.addTask(payload).subscribe({
        next: (response) => {
          console.log('logged in details', response);
          this.getAllTask();
          this.isEdit = false;
          this.isSecondAccordionOpen = false;
          this.form.reset();
          this.form.patchValue({
            "assignTo": this.userList.filter(x => x.id === this.loggedinUserDetails?.id)[0].id,
          })
        },
        error: (error) => {},
      });
    }else {
      const payload = {
        "title": this.form.value.title,
        "description": this.form.value.discription,
        "status": this.form.value.status,
        "dueDate": this.form.value.dueDate,
        "assignedTo": this.loggedinUserDetails?.role == 'User' ? this.loggedinUserDetails.id : this.form.value.assignTo,
        "assignedBy": this.loggedinUserDetails?.id,
        "assigneeName": this.loggedinUserDetails?.role == 'User' ? this.loggedinUserDetails.fullName : this.userList?.filter((x) => x.id == this.form.value.assignTo)[0].userName,
        "id": this.rowData.id,
      }
      this.taskService.updateTask(this.rowData.id,payload).subscribe({
        next: (response) => {
          this.getAllTask();
          this.isEdit = false;
          this.isSecondAccordionOpen = false;
          this.form.reset();
        },
        error: (error) => {},
      });
    }
      const credentials = this.form.value;

      console.log('Login Credentials:', credentials);
    }
  }
  openAddPanel() {
    this.panelState.taskList = false;
    this.panelState.addEditTask = true;
  }

  applyFilter() {
    const hasFilter = this.filters.some(f => f && f.trim() !== '');
  
    if (!hasFilter) {
      this.filteredData = [...this.tableData];
      return;
    }
  
    this.filteredData = this.tableData.filter(row => {
      return this.tableHeaders.every((header, i) => {
        const filterValue = this.filters[i]?.toLowerCase().trim() || '';
        const rowValue = row[header] ? String(row[header]).toLowerCase() : '';
        return !filterValue || rowValue.includes(filterValue);
      });
    });
  }

  editRow(row: any) {
    this.isEdit = true;
    this.rowData = row;
    this.isSecondAccordionOpen = true;
    this.selectedRoleId = this.userList.filter((x)=>x.id == row.assignedTo)[0];
    this.form.patchValue({
      "title": row.title,
      "discription": row.description,
      "status": row.status,
      "dueDate": row.dueDate,
      "assignTo": row.assignedTo,
      "assignedBy": row?.assignedBy,
      "assigneeName": row.assigneeName
    })
  }
  addTask() {
    this.isSecondAccordionOpen = true;
    console.log('Edit row:');
  }
  onCancel() {
    this.isSecondAccordionOpen = false;
  }
  deleteRow(row: any) {
    this.taskService.deleteTask(row.id).subscribe({
      next: (response) => {
        this.getAllTask();
      },
      error: (error) => {},
    });
  }
}
interface Role {
  id: string;
  userName: string;
}