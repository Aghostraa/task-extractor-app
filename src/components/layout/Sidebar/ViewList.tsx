'use client'

import { LucideIcon } from 'lucide-react';
import { ViewType, TaskCounts} from '@/types/index';

interface ViewConfig {
  id: ViewType;
  name: string;
  icon: LucideIcon;
  description: string;
}

interface ViewListProps {
  views: ViewConfig[];
  currentView: ViewType;
  taskCounts: TaskCounts;
  onViewChange: (view: ViewType) => void;
}

export function ViewList({ views, currentView, taskCounts, onViewChange }: ViewListProps) {
  return (
    <div className="space-y-1">
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
            {taskCounts[id] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}