import { LucideIcon } from 'lucide-react';
import { ViewType, TaskCounts, Folder } from '@/types/index';

export interface ViewConfig {
  id: ViewType;
  name: string;
  icon: LucideIcon;
  description: string;
}

export interface ViewListProps {
  views: ViewConfig[];
  currentView: ViewType;
  taskCounts: TaskCounts;
  onViewChange: (view: ViewType, folderId?: string) => void;
}

export interface FolderListProps {
  folders: Folder[];
  currentFolderId?: string;
  taskCounts: TaskCounts;
  onFolderSelect: (folderId: string) => void;
  onFolderCreate: (folderData: Partial<Folder>) => Promise<void>;
  onFolderUpdate: (folderData: Partial<Folder>) => Promise<void>;
  onFolderDelete: (folderId: string) => Promise<void>;
}

export interface SidebarProps {
  currentView: ViewType;
  currentFolderId?: string;
  onViewChange: (view: ViewType, folderId?: string) => void;
  taskCounts: TaskCounts;
  folders: Folder[];
  onFolderCreate: (folderData: Partial<Folder>) => Promise<void>;
  onFolderDelete: (folderId: string) => Promise<void>;
  onFolderUpdate: (folderData: Partial<Folder>) => Promise<void>;
  views: ViewConfig[];
}