// TaskBoard/index.tsx
'use client'

import { TaskInput } from '../TaskInput';
import { TaskList } from '../TaskList';
import { Sidebar } from '../../layout/Sidebar';
import { KanbanBoard } from '../KanbanBoard';
import { TaskHeader } from './TaskHeader';
import { useTaskBoard } from './useTaskBoard';

export function TaskBoard() {
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
       </div>
     </div>
   </div>
 );
}