import { useState, useRef } from 'react';
import { Task } from '@/types/index';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, CheckCircle2, Flag, Trash2, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  isMobile?: boolean;
}

export function KanbanCard({ task, onUpdate, onDelete, onEdit, isMobile }: KanbanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const touchThreshold = 50;
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldTruncate = task.text.length > (isMobile ? 50 : 150);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > touchThreshold) {
      const nextStates = {
        todo: 'inProgress' as const,
        inProgress: deltaX > 0 ? 'done' as const : 'todo' as const,
        done: 'inProgress' as const
      };
      const newStatus = nextStates[task.status];
      if (newStatus) {
        onUpdate({ ...task, status: newStatus });
      }
    } else if (Math.abs(deltaY) > touchThreshold) {
      onUpdate({ ...task, flagged: !task.flagged });
    }
  };

  const cardProps = isMobile ? {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    draggable: false,
    ref: cardRef
  } : {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData('taskId', task.id);
    },
    ref: cardRef
  };

  const ActionButtons = () => (
    <AnimatePresence>
      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex justify-end gap-2 mt-3"
        >
          <button
            onClick={() => onEdit(task)}
            className={`rounded hover:bg-neutral-600 text-neutral-400 hover:text-blue-400 ${
              isMobile ? 'p-2' : 'p-1'
            }`}
          >
            <Pencil size={isMobile ? 18 : 14} />
          </button>
          <button
            onClick={() => onUpdate({ ...task, flagged: !task.flagged })}
            className={`rounded hover:bg-neutral-600 ${
              isMobile ? 'p-2' : 'p-1'
            } ${task.flagged ? 'text-yellow-500' : 'text-neutral-400'}`}
          >
            <Flag size={isMobile ? 18 : 14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className={`rounded hover:bg-neutral-600 text-neutral-400 hover:text-red-400 ${
              isMobile ? 'p-2' : 'p-1'
            }`}
          >
            <Trash2 size={isMobile ? 18 : 14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <Card {...cardProps} className="bg-neutral-700 border-neutral-600 transition-all duration-200">
      <CardContent className={`p-3 ${isMobile ? 'max-w-[calc(100vw-2rem)]' : ''}`}>
        <div className="flex flex-col">
          <div className="flex items-start gap-2">
            <button
              onClick={() => onUpdate({ ...task, completed: !task.completed })}
              className={`flex-shrink-0 ${isMobile ? 'p-2' : 'mt-1'}`}
            >
              <CheckCircle2 size={isMobile ? 20 : 16} className={getStatusColor(task.status)} />
            </button>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div 
                className="text-sm text-white cursor-pointer break-words"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {shouldTruncate && !isExpanded ? (
                  <p className="line-clamp-2">{task.text}</p>
                ) : (
                  <p>{task.text}</p>
                )}
              </div>
            </div>
            {shouldTruncate && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="flex-shrink-0 p-1 hover:bg-neutral-600 rounded"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>

          {/* Metadata and Action Buttons */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={getPriorityClass(task.priority)}>
                    P{task.priority}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                    {task.category}
                  </span>
                  {task.folder && (
                    <span 
                      className="text-xs px-2 py-1 rounded" 
                      style={{
                        backgroundColor: `${task.folder.color}33` || '#88888833',
                        color: task.folder.color || '#888888'
                      }}
                    >
                      {task.folder.name}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ActionButtons />

          {!isExpanded && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={getPriorityClass(task.priority)}>
                P{task.priority}
              </span>
              {task.flagged && (
                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300">
                  Flagged
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: Task['status']) {
  switch (status) {
    case 'inProgress': return 'text-yellow-500';
    case 'done': return 'text-blue-500';
    default: return 'text-neutral-400';
  }
}

function getPriorityClass(priority: number) {
  const baseClasses = "text-xs px-2 py-1 rounded";
  switch (priority) {
    case 1: return `${baseClasses} bg-red-500/20 text-red-300`;
    case 2: return `${baseClasses} bg-yellow-500/20 text-yellow-300`;
    default: return `${baseClasses} bg-green-500/20 text-green-300`;
  }
}