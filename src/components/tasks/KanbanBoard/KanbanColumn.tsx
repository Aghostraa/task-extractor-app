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
  isMobile?: boolean;
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
  onEditTask,
  isMobile
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    if (isMobile) return;
    e.preventDefault();
    e.currentTarget.classList.add('bg-neutral-700/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isMobile) return;
    e.currentTarget.classList.remove('bg-neutral-700/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isMobile) return;
    e.preventDefault();
    e.currentTarget.classList.remove('bg-neutral-700/50');
    const taskId = e.dataTransfer.getData('taskId');
    onTaskMove(taskId, status, currentFolderId);
  };

  return (
    <div
      className={`
        bg-neutral-800 rounded-lg p-4
        ${isMobile ? 'w-full' : 'flex-1 min-w-[300px] max-w-[350px]'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${isMobile ? 'text-xl' : 'text-lg'}`}>{title}</h3>
        {!isMobile && (
          <Button
            size="sm"
            variant="ghost"
            className="p-2 hover:bg-neutral-700 text-neutral-400 hover:text-white"
            onClick={onAddTask}
          >
            <Plus size={16} />
          </Button>
        )}
      </div>
      <div className={`space-y-3 ${isMobile ? 'pb-20' : ''}`}>
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onUpdate={onTaskUpdate}
            onDelete={onTaskDelete}
            onEdit={onEditTask}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}