// src/components/Sidebar.tsx
'use client'

import { LucideIcon } from 'lucide-react';
import { ViewType, TaskCounts, Folder } from '@/types';

interface ViewConfig {
  id: ViewType;
  name: string;
  icon: LucideIcon;
  description: string;
}

interface SidebarProps {
  currentView: ViewType;
  currentFolderId?: string;
  onViewChange: (view: ViewType, folderId?: string) => void;
  taskCounts: TaskCounts;
  folders: Folder[];
  onFolderCreate: (folderData: Partial<Folder>) => Promise<void>;
  onFolderDelete: (folderId: string) => Promise<void>;
  views: ViewConfig[];
}

export function Sidebar({
  currentView,
  currentFolderId,
  onViewChange,
  taskCounts,
  folders,
  onFolderCreate,
  onFolderDelete,
  views
}: SidebarProps) {
  // Helper function to get the count for a view
  const getCountForView = (viewId: ViewType | string): number => {
    return taskCounts[viewId] ?? 0;
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-8">Task Manager</h1>
      
      <nav className="space-y-1">
        {/* Default Views */}
        {views.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
              currentView === id 
                ? 'bg-blue-500 text-white' 
                : 'text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <Icon size={18} />
            <span className="flex-1 text-left">{name}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              currentView === id
                ? 'bg-blue-600'
                : 'bg-neutral-700'
            }`}>
              {getCountForView(id)}
            </span>
          </button>
        ))}

        {/* Folders Section */}
        <div className="mt-6 pt-6 border-t border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-neutral-400">Folders</h2>
            <button
              onClick={() => onFolderCreate({ name: 'New Folder' })}
              className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
            >
              +
            </button>
          </div>

          <div className="space-y-1">
            {folders.map((folder) => (
              <div key={folder.id} className="group relative">
                <button
                  onClick={() => onViewChange('all', folder.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    currentFolderId === folder.id
                      ? 'bg-blue-500 text-white'
                      : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: folder.color ?? '#888' }}
                  />
                  <span className="flex-1 text-left">{folder.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    currentFolderId === folder.id
                      ? 'bg-blue-600'
                      : 'bg-neutral-700'
                  }`}>
                    {getCountForView(folder.id)}
                  </span>
                </button>
                <button
                  onClick={() => onFolderDelete(folder.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-600 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Stats */}
      <div className="mt-auto pt-6 border-t border-neutral-700">
        <div className="text-sm text-neutral-400">
          <p>Total tasks: {Object.values(taskCounts).reduce((a, b) => (a || 0) + (b || 0), 0)}</p>
          <p>Folders: {folders.length}</p>
        </div>
      </div>
    </div>
  );
}