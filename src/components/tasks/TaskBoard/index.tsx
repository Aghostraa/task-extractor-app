'use client'

import { useState, useEffect } from 'react';
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
import { Menu, X } from 'lucide-react';

export function TaskBoard() {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="flex min-h-screen bg-neutral-900 text-white relative">
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-neutral-800 rounded-md"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Responsive Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed z-40' : 'relative'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 bg-neutral-800 p-6 h-full transition-transform duration-300 ease-in-out
        `}
      >
        <Sidebar
          currentView={view}
          currentFolderId={currentFolderId}
          onViewChange={(newView, folderId) => {
            handleViewChange(newView, folderId);
            if (isMobile) setSidebarOpen(false);
          }}
          taskCounts={taskCounts}
          folders={folders}
          onFolderCreate={handleFolderCreate}
          onFolderDelete={handleFolderDelete}
          onFolderUpdate={handleFolderUpdate}
          views={viewConfigs}
        />
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 p-4 md:p-6 overflow-auto
        ${isMobile ? 'ml-0' : 'ml-0'}
        ${isMobile && sidebarOpen ? 'opacity-50' : 'opacity-100'}
      `}>
        <div className="max-w-4xl mx-auto">
          <TaskHeader 
            title={viewInfo.title}
            description={viewInfo.description}
          />

          {/* Responsive Action Buttons */}
          {isMobile ? (
            <Button
              onClick={() => {
                setEditingTask(undefined);
                setTaskDialogOpen(true);
              }}
              className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-blue-500 hover:bg-blue-600 shadow-lg z-30"
            >
              +
            </Button>
          ) : (
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
          )}

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
              onFolderChange={handleViewChange}
              isMobile={isMobile}
            />
          ) : (
            <TaskList
              tasks={tasks}
              view={view}
              folders={folders}
              currentFolderId={currentFolderId}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              isMobile={isMobile}
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