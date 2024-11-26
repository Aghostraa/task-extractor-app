'use client'

import { useState } from 'react';
import { TaskInput } from '../TaskInput';
import { TaskList } from '../TaskList';
import { Sidebar } from '../../layout/Sidebar';
import { KanbanBoard } from '../KanbanBoard';
import { TaskHeader } from './TaskHeader';
import { useTaskBoard } from './useTaskBoard';
import { TaskDialog } from '../TaskList/TaskDialog';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { createOrUpdateTask } from '@/app/actions/tasks';

export function TaskBoard() {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const {
    tasks,
    folders,
    view,
    currentFolderId,
    isLoading,
    viewConfigs,
    taskCounts,
    viewInfo,
    handleViewChange,
    handleTasksAdded,
    handleTaskUpdate,
    handleTaskDelete,
    handleFolderCreate,
    handleFolderDelete,
    handleFolderUpdate,
  } = useTaskBoard();

  const handleTaskAction = async (task: Partial<Task>) => {
    const formData = new FormData();
    if (task.id) formData.append('id', task.id);
    formData.append('text', task.text || '');
    formData.append('priority', String(task.priority));
    formData.append('category', task.category || '');
    if (task.folderId) formData.append('folderId', task.folderId);

    const result = await createOrUpdateTask(formData);
    if (result.success && result.task) {
      handleTasksAdded([result.task]);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-900 text-white">
      <div className="w-64 bg-neutral-800 p-6">
        <Sidebar
          currentView={view}
          currentFolderId={currentFolderId}
          onViewChange={handleViewChange}
          taskCounts={taskCounts}
          folders={folders}
          onFolderCreate={handleFolderCreate}
          onFolderDelete={handleFolderDelete}
          onFolderUpdate={handleFolderUpdate}
          views={viewConfigs}
        />
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <TaskHeader 
            title={viewInfo.title}
            description={viewInfo.description}
          />

          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={() => {
                setEditingTask(undefined);
                setTaskDialogOpen(true);
              }}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Add Task Manually
            </Button>
          </div>

          <TaskInput 
            onTasksAdded={handleTasksAdded}
            isLoading={isLoading}
            currentFolderId={currentFolderId}
          />

          {view === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              folders={folders}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              currentFolderId={currentFolderId}
              onFolderChange={(taskId, folderId) => {
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                  handleTaskUpdate({ ...task, folderId });
                }
              }}
            />
          ) : (
            <TaskList
              tasks={tasks}
              view={view}
              folders={folders}
              currentFolderId={currentFolderId}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
            />
          )}

          <TaskDialog
            open={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            onSave={handleTaskAction}
            folders={folders}
            task={editingTask}
          />
        </div>
      </div>
    </div>
  );
}