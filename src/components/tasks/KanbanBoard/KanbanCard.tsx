// src/components/tasks/KanbanBoard/KanbanCard.tsx
import { Task } from '@/types/index';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Flag, Trash2, Pencil } from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

export function KanbanCard({ task, onUpdate, onDelete, onEdit }: KanbanCardProps) {
  const getCheckmarkColor = () => {
    switch (task.status) {
      case 'inProgress':
        return 'text-yellow-500';
      case 'done':
        return 'text-blue-500';
      default:
        return 'text-neutral-400';
    }
  };

  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id);
      }}
      className="bg-neutral-700 border-neutral-600 cursor-move hover:border-blue-500/50 transition-colors"
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onUpdate({ ...task, completed: !task.completed })}
            className="mt-1"
          >
            <CheckCircle2 size={16} className={getCheckmarkColor()} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white">{task.text}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded ${
                task.priority === 1 ? 'bg-red-500/20 text-red-300' :
                task.priority === 2 ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                P{task.priority}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                {task.category}
              </span>
              {task.folder && (
                <span 
                  className="text-xs px-2 py-0.5 rounded" 
                  style={{ 
                    backgroundColor: task.folder.color + '33' || '#88888833',
                    color: task.folder.color || '#888888'
                  }}
                >
                  {task.folder.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded hover:bg-neutral-600 text-neutral-400 hover:text-blue-400"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onUpdate({ ...task, flagged: !task.flagged })}
              className={`p-1 rounded hover:bg-neutral-600 ${task.flagged ? 'text-yellow-500' : 'text-neutral-400'}`}
            >
              <Flag size={14} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 rounded hover:bg-neutral-600 text-neutral-400 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}