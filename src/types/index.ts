// src/types/index.ts
export interface Folder {
    id: string;
    name: string;
    description?: string;
    color?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Task {
    id: string;
    text: string;
    priority: number;
    category: string;
    completed: boolean;
    flagged: boolean;
    status: 'todo' | 'inProgress' | 'done';
    sourceText?: string | null;
    folderId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    folder?: {
      id: string;
      name: string;
      description?: string | null;
      color?: string | null;
    } | null;
  }
  
  export interface TaskActionResponse {
    success: boolean;
    task?: Task;
    error?: string;
  }
  
  export type ViewType = 'all' | 'today' | 'flagged' | 'kanban';
  
  // Update TaskCounts to include all possible view types
  export interface TaskCounts {
    all: number;
    today: number;
    flagged: number;
    completed?: number;
    kanban?: number;
    [key: string]: number | undefined; // For folder IDs
  }

  export interface TaskResponse {
    success: boolean;
    tasks?: Task[];
    error?: string;
  }
  
  export interface FolderActionResponse {
    success: boolean;
    folder?: Folder;
    error?: string;
  }