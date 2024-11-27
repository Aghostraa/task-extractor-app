// src/components/tasks/TaskList/index.tsx
import { Task, ViewType, Folder } from '@/types/index';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { useTaskList } from './useTaskList';

interface TaskListProps {
  tasks: Task[];
  view: ViewType;
  folders: Folder[];
  currentFolderId?: string;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  isMobile?: boolean;
}

export function TaskList({ 
  tasks, 
  view,
  folders, 
  currentFolderId,
  onTaskUpdate, 
  onTaskDelete 
}: TaskListProps) {
  const {
    filteredTasks,
    handleComplete,
    handleFlag,
    handleDelete
  } = useTaskList({
    tasks,
    view,
    currentFolderId,
    onTaskUpdate,
    onTaskDelete
  });

  if (filteredTasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          folder={folders.find(f => f.id === task.folderId)}
          onComplete={handleComplete}
          onFlag={handleFlag}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}