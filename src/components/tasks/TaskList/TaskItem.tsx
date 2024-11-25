// src/components/tasks/TaskList/TaskItem.tsx
'use client'

import { useState } from 'react';
import { Task, Folder } from '@/types/index';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Flag, Trash2, Loader2 } from 'lucide-react';
import { TaskBadges } from '@/components/tasks/TaskList/TaskBadges';

interface TaskItemProps {
  task: Task;
  folder?: Folder;
  onComplete: (taskId: string) => Promise<void>;
  onFlag: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskItem({ 
  task, 
  folder,
  onComplete, 
  onFlag, 
  onDelete 
}: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card 
      className={`bg-neutral-800 border-neutral-700 transition-opacity ${
        isLoading ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <CardContent className="p-4 flex items-center space-x-4">
        <button
          onClick={() => handleAction(() => onComplete(task.id))}
          disabled={isLoading}
          className={`relative w-5 h-5 rounded-full border ${
            task.completed ? 'bg-blue-500 border-blue-500' : 'border-neutral-500'
          } flex items-center justify-center`}
        >
          {task.completed && <CheckCircle2 size={14} className="text-white" />}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={14} className="animate-spin text-blue-500" />
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`truncate ${
            task.completed ? 'line-through text-neutral-400' : 'text-white'
          }`}>
            {task.text}
          </p>
          <TaskBadges
            priority={task.priority}
            category={task.category}
            folderId={task.folderId}
            folderName={folder?.name}
            folderColor={folder?.color}
            createdAt={task.createdAt}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAction(() => onFlag(task.id))}
            disabled={isLoading}
            className={`p-1.5 rounded hover:bg-neutral-700 ${
              task.flagged ? 'text-yellow-500' : 'text-neutral-400'
            }`}
          >
            <Flag size={16} />
          </button>
          <button
            onClick={() => handleAction(() => onDelete(task.id))}
            disabled={isLoading}
            className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}