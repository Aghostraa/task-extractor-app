// src/components/KanbanBoard.tsx
import React from 'react';
import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Flag, Trash2 } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  currentFolderId?: string;
}

function KanbanColumn({ title, tasks, onTaskMove, onTaskUpdate, onTaskDelete }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-neutral-700/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-neutral-700/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-neutral-700/50');
    const taskId = e.dataTransfer.getData('taskId');
    const newStatus = title.toLowerCase().replace(' ', '');
    onTaskMove(taskId, newStatus);
  };

  return (
    <div
      className="flex-1 min-w-[300px] max-w-[350px] bg-neutral-800 rounded-lg p-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card
            key={task.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('taskId', task.id);
            }}
            className="bg-neutral-700 border-neutral-600 cursor-move hover:border-blue-500/50 transition-colors"
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onTaskUpdate({ ...task, completed: !task.completed })}
                  className="mt-1"
                >
                  <CheckCircle2
                    size={16}
                    className={task.completed ? 'text-blue-500' : 'text-neutral-400'}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{task.text}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      task.priority === 1 ? 'bg-red-500/20 text-red-300' :
                      task.priority === 2 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      P{task.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {task.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTaskUpdate({ ...task, flagged: !task.flagged })}
                    className={`p-1 rounded hover:bg-neutral-600 ${
                      task.flagged ? 'text-yellow-500' : 'text-neutral-400'
                    }`}
                  >
                    <Flag size={14} />
                  </button>
                  <button
                    onClick={() => onTaskDelete(task.id)}
                    className="p-1 rounded hover:bg-neutral-600 text-neutral-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskDelete, currentFolderId }: KanbanBoardProps) {
  const filteredTasks = currentFolderId
    ? tasks.filter(task => task.folderId === currentFolderId)
    : tasks;

  const columns = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    inProgress: filteredTasks.filter(task => task.status === 'inProgress'),
    done: filteredTasks.filter(task => task.status === 'done'),
  };

  const handleTaskMove = (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onTaskUpdate({ ...task, status: newStatus as Task['status'] });
    }
  };

  return (
    <div className="h-full p-6">
      <div className="flex gap-6 h-full overflow-x-auto pb-6">
        <KanbanColumn
          title="To Do"
          tasks={columns.todo}
          onTaskMove={handleTaskMove}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
        />
        <KanbanColumn
          title="In Progress"
          tasks={columns.inProgress}
          onTaskMove={handleTaskMove}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
        />
        <KanbanColumn
          title="Done"
          tasks={columns.done}
          onTaskMove={handleTaskMove}
          onTaskUpdate={onTaskUpdate} 
          onTaskDelete={onTaskDelete}
        />
      </div>
    </div>
  );
}