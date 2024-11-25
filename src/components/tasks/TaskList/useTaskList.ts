// src/components/tasks/TaskList/useTaskList.ts
'use client'

import { ViewType, Task, Folder } from '@/types/index';
import { completeTask, deleteTask, toggleTaskFlag } from '@/app/actions/tasks';

interface UseTaskListProps {
  tasks: Task[];
  view: ViewType;
  currentFolderId?: string;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export function useTaskList({ 
  tasks, 
  view, 
  currentFolderId,
  onTaskUpdate,
  onTaskDelete
}: UseTaskListProps) {
  const filteredTasks = tasks.filter(task => {
    if (currentFolderId && task.folderId !== currentFolderId) {
      return false;
    }

    switch (view) {
      case 'today':
        return !task.completed && 
          new Date(task.createdAt).toDateString() === new Date().toDateString();
      case 'flagged':
        return !task.completed && task.flagged;
      case 'kanban':
        return !task.completed;
      default:
        return !task.completed;
    }
  });

  const handleComplete = async (taskId: string) => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    
    const result = await completeTask(formData);
    if (result.success && result.task) {
      onTaskUpdate(result.task);
    }
  };

  const handleFlag = async (taskId: string) => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    
    const result = await toggleTaskFlag(formData);
    if (result.success && result.task) {
      onTaskUpdate(result.task);
    }
  };

  const handleDelete = async (taskId: string) => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    
    const result = await deleteTask(formData);
    if (result.success) {
      onTaskDelete(taskId);
    }
  };

  return {
    filteredTasks,
    handleComplete,
    handleFlag,
    handleDelete
  };
}