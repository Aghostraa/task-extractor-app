import { useState, useEffect } from 'react';
import { Task, ViewType, Folder, TaskCounts } from '@/types/index';
import { List, Calendar, Flag, Layout } from 'lucide-react';
import { getFolders, createFolder, deleteFolder, updateFolder } from '@/app/actions/folders';
import { getTasks } from '@/app/actions/tasks';

export function useTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [view, setView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedView') as ViewType) || 'all';
    }
    return 'all';
  });
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedFolderId') || undefined;
    }
    return undefined;
  });
  const [isLoading, setIsLoading] = useState(false);

  const viewConfigs = [
    {
      id: 'all' as const,
      name: 'All Tasks',
      icon: List,
      description: 'View all active tasks'
    },
    {
      id: 'today' as const,
      name: 'Today',
      icon: Calendar,
      description: 'Tasks created today'
    },
    {
      id: 'flagged' as const,
      name: 'Flagged',
      icon: Flag,
      description: 'Important tasks'
    },
    {
      id: 'kanban' as const,
      name: 'Kanban Board',
      icon: Layout,
      description: 'View tasks in kanban board'
    }
  ];

  useEffect(() => {
    const storedFolderId = localStorage.getItem('selectedFolderId');
    if (storedFolderId) {
      setCurrentFolderId(storedFolderId);
    }
  }, []);
  
  // Move loadInitialData to a separate effect that depends on currentFolderId
  useEffect(() => {
    loadInitialData();
  }, [currentFolderId]);

  async function loadInitialData() {
    const [loadedFolders, loadedTasks] = await Promise.all([
      getFolders(),
      getTasks()
    ]);
    setFolders(loadedFolders);
    setTasks(loadedTasks);

    // Validate stored folderId against loaded folders
    if (currentFolderId && !loadedFolders.some((f: Folder) => f.id === currentFolderId)) {
      setCurrentFolderId(undefined);
      localStorage.removeItem('selectedFolderId');
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

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
      const tasksWithFolder = newTasks.map(task => ({
        ...task,
        folderId: currentFolderId,
        status: 'todo' as const,
      }));

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
      loadInitialData();
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
      loadInitialData();
    }
  };

  const handleFolderUpdate = async (folderData: Partial<Folder>) => {
    const formData = new FormData();
    if (folderData.id) formData.append('id', folderData.id);
    if (folderData.name) formData.append('name', folderData.name);
    if (folderData.description) formData.append('description', folderData.description);
    if (folderData.color) formData.append('color', folderData.color);

    const result = await updateFolder(formData);
    if (result.success) {
      loadInitialData();
    }
  };

  const getCurrentViewInfo = () => {
    if (currentFolderId) {
      const folder = folders.find(f => f.id === currentFolderId);
      return {
        title: folder?.name || 'Folder',
        description: `Tasks in ${folder?.name}`
      };
    }
    const viewConfig = viewConfigs.find(config => config.id === view);
    return {
      title: viewConfig?.name || 'Tasks',
      description: viewConfig?.description || ''
    };
  };

  const getFilteredTasks = (): Task[] => {
    if (currentFolderId) {
      return tasks.filter(task => task.folderId === currentFolderId);
    }
    return tasks;
  };

  return {
    tasks: getFilteredTasks(),
    folders,
    view,
    currentFolderId,
    isLoading,
    viewConfigs,
    taskCounts: getTaskCounts(),
    viewInfo: getCurrentViewInfo(),
    handleViewChange,
    handleTasksAdded,
    handleTaskUpdate,
    handleTaskDelete,
    handleFolderCreate,
    handleFolderDelete,
    handleFolderUpdate,
  };
}