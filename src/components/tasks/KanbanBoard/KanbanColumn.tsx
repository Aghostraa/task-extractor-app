// src/components/tasks/KanbanBoard/KanbanColumn.tsx
import { Task } from '@/types/index';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
    title: string;
    status: Task['status'];
    tasks: Task[];
    onTaskMove: (taskId: string, newStatus: string, targetFolderId?: string) => void;
    onTaskUpdate: (task: Task) => void;
    onTaskDelete: (taskId: string) => void;
    currentFolderId?: string;
   }
   
   export function KanbanColumn({ 
    title,
    status, 
    tasks,
    currentFolderId,
    onTaskMove,
    onTaskUpdate, 
    onTaskDelete 
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
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
            />
          ))}
        </div>
      </div>
    );
   }