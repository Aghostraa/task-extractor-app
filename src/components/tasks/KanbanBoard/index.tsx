// src/components/tasks/KanbanBoard/index.tsx
'use client'

import { useState } from 'react';
import { Task, Folder, ViewType } from '@/types/index';
import { KanbanColumn } from '@/components/tasks/KanbanBoard/KanbanColumn';
import { useKanbanBoard } from '@/components/tasks/KanbanBoard/useKanbanBoard';
import { updateTaskStatus, createOrUpdateTask } from '@/app/actions/tasks';
import { TaskDialog } from '@/components/tasks/TaskList/TaskDialog';

interface KanbanBoardProps {
  tasks: Task[];
  folders: Folder[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  currentFolderId?: string;
  onFolderChange: (newView: ViewType, folderId?: string) => void;
}

export function KanbanBoard({ 
  tasks, 
  folders,
  onTaskUpdate, 
  onTaskDelete, 
  currentFolderId,
  onFolderChange
}: KanbanBoardProps) {
  const { columns, getColumnTasks } = useKanbanBoard(tasks, currentFolderId);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<Task['status']>('todo');

  const handleTaskMove = async (taskId: string, newStatus: string, targetFolderId?: string) => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('status', newStatus);
    if (targetFolderId) {
      formData.append('folderId', targetFolderId);
    }
    
    const result = await updateTaskStatus(formData);
    if (result.success && result.task) {
      onTaskUpdate(result.task);
    }
  };

  const handleAddTask = (status: Task['status']) => {
    setEditingTask(undefined);
    setSelectedStatus(status);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedStatus(task.status);
    setTaskDialogOpen(true);
  };

  const handleTaskSave = async (taskData: Partial<Task>) => {
    const formData = new FormData();
    if (taskData.id) formData.append('id', taskData.id);
    formData.append('text', taskData.text || '');
    formData.append('priority', String(taskData.priority));
    formData.append('category', taskData.category || '');
    formData.append('status', editingTask?.status || selectedStatus);
    if (currentFolderId) formData.append('folderId', currentFolderId);

    const result = await createOrUpdateTask(formData);
    if (result.success && result.task) {
      onTaskUpdate(result.task);
      setTaskDialogOpen(false);
    }
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => onFolderChange('kanban', undefined)}
          className={`px-3 py-1 rounded-lg text-sm ${!currentFolderId ? 'bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'}`}
        >
          All Folders
        </button>
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => onFolderChange('kanban', folder.id)}
            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-2 ${
              currentFolderId === folder.id ? 'bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: folder.color || '#888' }}
            />
            {folder.name}
          </button>
        ))}
      </div>
      <div className="flex gap-6 h-full overflow-x-auto pb-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={getColumnTasks(column.status)}
            currentFolderId={currentFolderId}
            onTaskMove={handleTaskMove}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onAddTask={() => handleAddTask(column.status)}
            onEditTask={handleEditTask}
          />
        ))}
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleTaskSave}
        folders={folders}
        task={editingTask}
      />
    </div>
  );
}