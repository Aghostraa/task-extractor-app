// src/components/tasks/KanbanBoard/useKanbanBoard.ts
import { Task } from '@/types/index';

interface KanbanColumn {
  title: string;
  status: Task['status'];
}


export function useKanbanBoard(tasks: Task[], currentFolderId?: string, currentCategory?: string) {
  const columns: KanbanColumn[] = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'inProgress' },
    { title: 'Done', status: 'done' }
  ];

  const getColumnTasks = (status: Task['status']) => {
    return tasks.filter(task => 
      (!currentFolderId || task.folderId === currentFolderId) &&
      (!currentCategory || task.category === currentCategory) &&
      task.status === status
    );
  };

  return {
    columns,
    getColumnTasks
  };
}
