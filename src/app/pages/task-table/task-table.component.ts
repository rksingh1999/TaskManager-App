import {
  Component,
  computed,
  effect,
  inject,
  Input,
  signal,
} from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../interfaces/task-interface';
import { NgForOf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgForOf],
  templateUrl: './task-table.component.html',
  styleUrl: './task-table.component.css'
})
export class TaskTableComponent {
 authService = inject(AuthService);
  taskService = inject(TaskService);
  @Input() taskList= signal<Task[]>([]);
  @Input() sendToParent!: (task?: Task, action?: string) => void;

  filterTitle = signal<string>('');
  filterDescription = signal<string>('');
  filterStatus = signal<string>('');
  filterDuedate = signal<string>('');
  filterAssignedUser = signal<string>('');
  filterType = signal<string>('');
  tableHeaders: (keyof Task)[] = [
    'title',
    'description',
    'status',
    'dueDate',
    'assigneeName',
  ];

    filteredData = computed(() => {
      const data = this.taskList();
      let filters = '';
      switch (this.filterType()) {
        case 'title':
          filters = this.filterTitle();
          break;
        case 'description':
          filters = this.filterDescription();
          break;
        case 'status':
          filters = this.filterStatus();
          break;
        case 'dueDate':
          filters = this.filterDuedate();
          break;
        default:
          filters = this.filterAssignedUser();
          break;
      }
      const hasFilter = filters.trim() !== '' ? filters : '';
      if (!hasFilter) return data;
      return data.filter((row) => {
        const filter = filters.toLowerCase().trim();
        const value = row[this.filterType()]
          ? String(row[this.filterType()]).toLowerCase()
          : '';
        return value.includes(filter);
      });
    });

  ngOnInit() {
    console.log('getting data from parent', this.taskList);
    effect(() => {
      const tasks = this.taskList();
    });
  }
  addTask(){
    var data:any;
    return this.sendToParent( data,'add');
  }
  editRow(data: Task) {
    return this.sendToParent(data, 'edit');
  }
  deleteRow(data: Task) {
    return this.sendToParent(data, 'delete');
  }

  onFilterInputs(event: Event,type: string) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.filterType.set(type);
    if(type == 'title'){
      this.filterTitle.set(inputValue);
    } else if(type == 'description'){
      this.filterDescription.set(inputValue);
    }else if(type == 'status') {
      this.filterStatus.set(inputValue);
    }else if(type == 'dueDate'){
      this.filterDuedate.set(inputValue);
    } else {
      this.filterAssignedUser.set(inputValue);
    }
  }
}
