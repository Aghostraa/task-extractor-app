// src/components/tasks/KanbanBoard/index.tsx
'use client'

import { useState } from 'react';
import { Task, Folder, ViewType } from '@/types/index';
import { KanbanColumn } from '@/components/tasks/KanbanBoard/KanbanColumn';
import { useKanbanBoard } from '@/components/tasks/KanbanBoard/useKanbanBoard';
import { updateTaskStatus } from '@/app/actions/tasks';

interface KanbanBoardProps {
    tasks: Task[];
    folders: Folder[];
    onTaskUpdate: (task: Task) => void;
    onTaskDelete: (taskId: string) => void;
    currentFolderId?: string;
    onFolderChange: (newView: ViewType, folderId?: string) => void; // Match handleViewChange signature
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
         />
       ))}
     </div>
   </div>
 );
}