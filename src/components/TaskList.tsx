// src/components/TaskList.tsx
'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Flag, Trash2, Loader2 } from 'lucide-react';
import { completeTask, deleteTask, toggleTaskFlag } from '@/app/actions/tasks';
import { Task, ViewType, Folder } from '@/types';

interface TaskListProps {
  tasks: Task[];
  view: ViewType;
  currentFolderId?: string;
  folders: Folder[];  // Added folders prop
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TaskList({ 
  tasks, 
  view, 
  currentFolderId,
  folders,
  onTaskUpdate, 
  onTaskDelete 
}: TaskListProps) {
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());

  // Utility functions for folder operations
  const getFolderColor = (folderId: string): string => {
    const folder = folders.find(f => f.id === folderId);
    return folder?.color ?? '#888888';
  };

  const getFolderName = (folderId: string): string => {
    const folder = folders.find(f => f.id === folderId);
    return folder?.name ?? 'No Folder';
  };

  const filteredTasks = tasks.filter(task => {
    // First apply folder filter if we're in a folder
    if (currentFolderId && task.folderId !== currentFolderId) {
      return false;
    }

    // Then apply view-specific filters
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

  async function handleComplete(taskId: string) {
    setLoadingTasks(prev => new Set(prev).add(taskId));
    const formData = new FormData();
    formData.append('taskId', taskId);
    
    try {
      const result = await completeTask(formData);
      if (result.success && result.task) {
        onTaskUpdate(result.task);
      }
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }

  async function handleFlag(taskId: string) {
    setLoadingTasks(prev => new Set(prev).add(taskId));
    const formData = new FormData();
    formData.append('taskId', taskId);
    
    try {
      const result = await toggleTaskFlag(formData);
      if (result.success && result.task) {
        onTaskUpdate(result.task);
      }
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }

  async function handleDelete(taskId: string) {
    setLoadingTasks(prev => new Set(prev).add(taskId));
    const formData = new FormData();
    formData.append('taskId', taskId);
    
    try {
      const result = await deleteTask(formData);
      if (result.success) {
        onTaskDelete(taskId);
      }
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400">
        <p>No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <Card 
          key={task.id} 
          className={`bg-neutral-800 border-neutral-700 transition-opacity ${
            loadingTasks.has(task.id) ? 'opacity-50' : 'opacity-100'
          }`}
        >
          <CardContent className="p-4 flex items-center space-x-4">
            <button
              onClick={() => handleComplete(task.id)}
              disabled={loadingTasks.has(task.id)}
              className={`relative w-5 h-5 rounded-full border ${
                task.completed ? 'bg-blue-500 border-blue-500' : 'border-neutral-500'
              } flex items-center justify-center`}
            >
              {task.completed && <CheckCircle2 size={14} className="text-white" />}
              {loadingTasks.has(task.id) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className={`truncate ${task.completed ? 'line-through text-neutral-400' : 'text-white'}`}>
                {task.text}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${
                  task.priority === 1 ? 'bg-red-500/20 text-red-300' :
                  task.priority === 2 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  P{task.priority}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                  {task.category}
                </span>
                {task.folderId && folders.length > 0 && (
                  <span 
                    className="text-xs px-2 py-1 rounded text-neutral-300"
                    style={{ 
                      backgroundColor: getFolderColor(task.folderId),
                      opacity: 0.2 
                    }}
                  >
                    {getFolderName(task.folderId)}
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded bg-neutral-700 text-neutral-300">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFlag(task.id)}
                disabled={loadingTasks.has(task.id)}
                className={`p-1.5 rounded hover:bg-neutral-700 ${
                  task.flagged ? 'text-yellow-500' : 'text-neutral-400'
                }`}
              >
                <Flag size={16} />
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                disabled={loadingTasks.has(task.id)}
                className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}