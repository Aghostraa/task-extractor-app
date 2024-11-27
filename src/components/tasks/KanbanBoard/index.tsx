import { useState } from 'react';
import { Task, Folder, ViewType } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { useKanbanBoard } from './useKanbanBoard';
import { updateTaskStatus, createOrUpdateTask } from '@/app/actions/tasks';
import { TaskDialog } from '../TaskList/TaskDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanBoardProps {
  tasks: Task[];
  folders: Folder[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  currentFolderId?: string;
  onFolderChange: (newView: ViewType, folderId?: string) => void;
  isMobile?: boolean;
}

export function KanbanBoard({ 
  tasks, 
  folders,
  onTaskUpdate, 
  onTaskDelete, 
  currentFolderId,
  onFolderChange,
  isMobile = false
}: KanbanBoardProps) {
  const { columns, getColumnTasks } = useKanbanBoard(tasks);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<Task['status']>('todo');
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

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

  const handleTaskSave = async (taskData: Partial<Task>) => {
    const formData = new FormData();
    if (taskData.id) formData.append('id', taskData.id);
    formData.append('text', taskData.text || '');
    formData.append('priority', String(taskData.priority));
    formData.append('category', taskData.category || '');
    formData.append('status', editingTask?.status || selectedStatus);
    if (taskData.folderId) {
      formData.append('folderId', taskData.folderId);
    }

    const result = await createOrUpdateTask(formData);
    if (result.success && result.task) {
      onTaskUpdate(result.task);
      setTaskDialogOpen(false);
    }
  };


  const FolderNavigation = () => (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      <button 
        onClick={() => onFolderChange('kanban', undefined)}
        className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
          !currentFolderId ? 'bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
        }`}
      >
        All Folders
      </button>
      {folders.map(folder => (
        <button
          key={folder.id}
          onClick={() => onFolderChange('kanban', folder.id)}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap ${
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
  );

  const handleMobileTaskUpdate = async (task: Task, newStatus: Task['status']) => {
    const validTransitions = {
      todo: ['inProgress'],
      inProgress: ['todo', 'done'],
      done: ['inProgress']
    };
  
    if (!validTransitions[task.status]?.includes(newStatus)) {
      return;
    }
  
    const formData = new FormData();
    formData.append('taskId', task.id);
    formData.append('status', newStatus);
    
    if (currentFolderId) {
      formData.append('folderId', currentFolderId);
    }
    
    const result = await updateTaskStatus(formData);
    if (result.success && result.task) {
      onTaskUpdate(result.task);
      // Auto-navigate to new column
      const columnIndex = columns.findIndex(col => col.status === newStatus);
      setActiveColumnIndex(columnIndex);
    }
  };

  const handleColumnSwipe = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchStartX = touchStart.x;
    const swipeThreshold = 100;

    if (touchEndX - touchStartX > swipeThreshold && activeColumnIndex > 0) {
      setActiveColumnIndex(prev => prev - 1);
    } else if (touchEndX - touchStartX < -swipeThreshold && activeColumnIndex < columns.length - 1) {
      setActiveColumnIndex(prev => prev + 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };
  
  // Pass this handler to KanbanCard
  const handleSwipeStatus = (task: Task, direction: 'left' | 'right') => {
    const currentIndex = columns.findIndex(col => col.status === task.status);
    const newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < columns.length) {
      handleMobileTaskUpdate(task, columns[newIndex].status);
    }
  };

  return (
    <div className="h-full">
      <FolderNavigation />
      
      {isMobile ? (
        <div className="relative h-full overflow-hidden touch-pan-x bg-transparent min-h-screen">
          <div 
            className="absolute inset-0 -z-10 bg-neutral-900/50" 
            onTouchStart={handleTouchStart} 
            onTouchEnd={handleColumnSwipe}
          >
            <motion.div 
              className="w-full h-full bg-transparent"
              whileTap={{ scale: 0.98 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
            />
          </div>
  
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeColumnIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="px-4 pb-24 relative"
            >
              <h2 className="text-xl font-semibold sticky top-0 bg-neutral-900/90 backdrop-blur-sm py-3 mb-4 border-b border-neutral-800">
                {columns[activeColumnIndex].title}
              </h2>
              
              <KanbanColumn
                title={columns[activeColumnIndex].title}
                status={columns[activeColumnIndex].status}
                tasks={getColumnTasks(columns[activeColumnIndex].status)}
                currentFolderId={currentFolderId}
                onTaskMove={handleTaskMove}
                onTaskUpdate={onTaskUpdate}
                onTaskDelete={onTaskDelete}
                onAddTask={() => handleAddTask(columns[activeColumnIndex].status)}
                onEditTask={setEditingTask}
                isMobile={true}
              />
            </motion.div>
          </AnimatePresence>
  
          <div className="fixed bottom-24 left-0 right-0 flex justify-center gap-2 z-20">
            {columns.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setActiveColumnIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  idx === activeColumnIndex ? 'bg-blue-500' : 'bg-neutral-600'
                }`}
              />
            ))}
          </div>
  
          <Button
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-blue-500 hover:bg-blue-600 shadow-lg z-20"
            onClick={() => handleAddTask(columns[activeColumnIndex].status)}
          >
            <Plus />
          </Button>
        </div>
      ) : (
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
              onEditTask={setEditingTask}
              isMobile={false}
            />
          ))}
        </div>
      )}
  
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