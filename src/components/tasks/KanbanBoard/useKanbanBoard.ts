// src/components/tasks/KanbanBoard/useKanbanBoard.ts
import { Task } from '@/types/index';

interface KanbanColumn {
  title: string;
  status: Task['status'];
}


export function useKanbanBoard(tasks: Task[]) {
  const columns: KanbanColumn[] = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'inProgress' },
    { title: 'Done', status: 'done' }
  ];

  const getColumnTasks = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return {
    columns,
    getColumnTasks
  };
}
