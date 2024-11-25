// src/components/TaskBoard.tsx
'use client'

import { useState, useEffect } from 'react';
import { TaskInput } from './TaskInput';
import { TaskList } from './TaskList';
import { Sidebar } from './Sidebar';
import KanbanBoard from './KanbanBoard';
import { List, Calendar, Flag, Layout } from 'lucide-react';
import { Task, ViewType, Folder, TaskCounts } from '@/types';
import { getFolders, createFolder, deleteFolder } from '@/app/actions/folders';

interface ViewConfig {
  id: ViewType;
  name: string;
  icon: typeof List | typeof Calendar | typeof Flag | typeof Layout;
  description: string;
}

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [view, setView] = useState<ViewType>('all');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const viewConfigs: ViewConfig[] = [
    {
      id: 'all',
      name: 'All Tasks',
      icon: List,
      description: 'View all active tasks'
    },
    {
      id: 'today',
      name: 'Today',
      icon: Calendar,
      description: 'Tasks created today'
    },
    {
      id: 'flagged',
      name: 'Flagged',
      icon: Flag,
      description: 'Important tasks'
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      icon: Layout,
      description: 'View tasks in kanban board'
    }
  ];

  useEffect(() => {
    loadFolders();
  }, []);

  async function loadFolders() {
    const loadedFolders = await getFolders();
    setFolders(loadedFolders);
  }

  const getTaskCounts = (): TaskCounts => {
    const counts: TaskCounts = {
      all: tasks.filter(task => !task.completed).length,
      today: tasks.filter(task => 
        !task.completed && 
        new Date(task.createdAt).toDateString() === new Date().toDateString()
      ).length,
      flagged: tasks.filter(task => !task.completed && task.flagged).length,
      completed: tasks.filter(task => task.completed).length,
      kanban: tasks.filter(task => !task.completed).length,
    };

    // Add counts for each folder
    folders.forEach(folder => {
      counts[folder.id] = tasks.filter(task => 
        !task.completed && task.folderId === folder.id
      ).length;
    });

    return counts;
  };

  const handleViewChange = (newView: ViewType, folderId?: string) => {
    setView(newView);
    setCurrentFolderId(folderId);
  };
  
  const handleTasksAdded = (newTasks: Task[]) => {
    setTasks(prevTasks => {
      // If we're in a folder, assign the folder ID to new tasks
      const tasksWithFolder = newTasks.map(task => ({
        ...task,
        folderId: currentFolderId,
        status: 'todo' as const,
      }));

      // Sort tasks by priority and date
      const allTasks = [...tasksWithFolder, ...prevTasks];
      return allTasks.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.filter(task => task.id !== taskId)
    );
  };

  const handleFolderCreate = async (folderData: Partial<Folder>) => {
    const formData = new FormData();
    if (folderData.name) formData.append('name', folderData.name);
    if (folderData.description) formData.append('description', folderData.description);
    if (folderData.color) formData.append('color', folderData.color);

    const result = await createFolder(formData);
    if (result.success) {
      loadFolders();
    }
  };

  const handleFolderDelete = async (folderId: string) => {
    const formData = new FormData();
    formData.append('id', folderId);

    const result = await deleteFolder(formData);
    if (result.success) {
      if (currentFolderId === folderId) {
        setCurrentFolderId(undefined);
        setView('all');
      }
      loadFolders();
    }
  };

  const getCurrentViewTitle = (): string => {
    if (currentFolderId) {
      return folders.find(f => f.id === currentFolderId)?.name || 'Folder';
    }
    return viewConfigs.find(config => config.id === view)?.name || 'Tasks';
  };

  const getCurrentViewDescription = (): string => {
    if (currentFolderId) {
      const folderName = folders.find(f => f.id === currentFolderId)?.name;
      return `Tasks in ${folderName}`;
    }
    return viewConfigs.find(config => config.id === view)?.description || '';
  };

  const getFilteredTasks = (): Task[] => {
    if (currentFolderId) {
      return tasks.filter(task => task.folderId === currentFolderId);
    }
    return tasks;
  };

  return (
    <div className="flex min-h-screen bg-neutral-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-800 p-6">
        <Sidebar
          currentView={view}
          currentFolderId={currentFolderId}
          onViewChange={handleViewChange}
          taskCounts={getTaskCounts()}
          folders={folders}
          onFolderCreate={handleFolderCreate}
          onFolderDelete={handleFolderDelete}
          views={viewConfigs}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h2 className="text-2xl font-semibold">
              {getCurrentViewTitle()}
            </h2>
            <p className="text-neutral-400">
              {getCurrentViewDescription()}
            </p>
          </header>

          <TaskInput 
            onTasksAdded={handleTasksAdded}
            isLoading={isLoading}
            currentFolderId={currentFolderId}
          />

          {view === 'kanban' ? (
            <KanbanBoard
              tasks={getFilteredTasks()}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              currentFolderId={currentFolderId}
            />
          ) : (
            <TaskList
              tasks={getFilteredTasks()}
              view={view}
              folders={folders}
              currentFolderId={currentFolderId}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}