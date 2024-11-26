// src/components/tasks/KanbanBoard/KanbanColumn.tsx
import { Task } from '@/types/index';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: string, targetFolderId?: string) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  currentFolderId?: string;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export function KanbanColumn({ 
  title,
  status, 
  tasks,
  currentFolderId,
  onTaskMove,
  onTaskUpdate, 
  onTaskDelete,
  onAddTask,
  onEditTask
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-neutral-700/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-neutral-700/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-neutral-700/50');
    const taskId = e.dataTransfer.getData('taskId');
    onTaskMove(taskId, status, currentFolderId);
  };

  return (
    <div
      className="flex-1 min-w-[300px] max-w-[350px] bg-neutral-800 rounded-lg p-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          size="sm"
          variant="ghost"
          className="p-2 hover:bg-neutral-700 text-neutral-400 hover:text-white"
          onClick={onAddTask}
        >
          <Plus size={16} />
        </Button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onUpdate={onTaskUpdate}
            onDelete={onTaskDelete}
            onEdit={onEditTask}
          />
        ))}
      </div>
    </div>
  );
}