export interface Role {
    id: string;
    userName: string;
  }

  export interface Task {
    title: string;
    description: string;
    status: string;
    dueDate: string;
    assigneeName: string;
    [key: string]: any;
  }