'use client'

import { ViewList } from './ViewList';
import { FolderList } from './FolderList';
import type { SidebarProps } from './types';

export function Sidebar({
  currentView,
  currentFolderId,
  onViewChange,
  taskCounts,
  folders,
  onFolderCreate,
  onFolderDelete,
  onFolderUpdate,
  views
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Task Manager</h1>
      </header>
      
      <nav className="flex-1 space-y-1 overflow-y-auto">
        <section>
          <ViewList
            views={views}
            currentView={currentView}
            taskCounts={taskCounts}
            onViewChange={onViewChange}
          />
        </section>

        <section>
          <FolderList
            folders={folders}
            currentFolderId={currentFolderId}
            taskCounts={taskCounts}
            onFolderSelect={(folderId) => onViewChange('all', folderId)}
            onFolderCreate={onFolderCreate}
            onFolderUpdate={onFolderUpdate}
            onFolderDelete={onFolderDelete}
          />
        </section>
      </nav>

      <footer className="mt-auto pt-6 border-t border-neutral-700">
        <div className="text-sm text-neutral-400">
          <p className="flex justify-between">
            <span>Total tasks:</span>
            <span>
              {Object.values(taskCounts)
                .filter((count): count is number => count !== undefined)
                .reduce((sum, count) => sum + count, 0)}
            </span>
          </p>
          <p className="flex justify-between">
            <span>Folders:</span>
            <span>{folders.length}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}