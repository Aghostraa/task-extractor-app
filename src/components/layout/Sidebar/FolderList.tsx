'use client'

import { useState } from 'react';
import { Folder, TaskCounts } from '@/types/index';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FolderListProps {
  folders: Folder[];
  currentFolderId?: string;
  taskCounts: TaskCounts;
  onFolderSelect: (folderId: string) => void;
  onFolderCreate: (folderData: Partial<Folder>) => Promise<void>;
  onFolderUpdate: (folderData: Partial<Folder>) => Promise<void>;
  onFolderDelete: (folderId: string) => Promise<void>;
}

export function FolderList({
  folders,
  currentFolderId,
  taskCounts,
  onFolderSelect,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete
}: FolderListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#888888');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreateDialog = () => {
    setEditingFolder(undefined);
    setName('');
    setDescription('');
    setColor('#888888');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setName(folder.name);
    setDescription(folder.description || '');
    setColor(folder.color || '#888888');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const folderData = {
        id: editingFolder?.id,
        name,
        description,
        color
      };
      
      if (editingFolder) {
        await onFolderUpdate(folderData);
      } else {
        await onFolderCreate(folderData);
      }
      setDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-neutral-700">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-neutral-400">Folders</h2>
        <button
          onClick={handleOpenCreateDialog}
          className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
        >
          +
        </button>
      </div>

      <div className="space-y-1">
        {folders.map((folder) => (
          <div key={folder.id} className="group relative">
            <button
              onClick={() => onFolderSelect(folder.id)}
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
              <span 
                className="flex-1 text-left hover:underline cursor-pointer"
                onClick={(e) => handleOpenEditDialog(folder, e)}
              >
                {folder.name}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                currentFolderId === folder.id
                  ? 'bg-blue-600'
                  : 'bg-neutral-700'
              }`}>
                {taskCounts[folder.id] ?? 0}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-neutral-800 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingFolder ? 'Edit Folder' : 'Create New Folder'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="Folder name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-9 bg-neutral-700 border-neutral-600"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="#000000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {editingFolder ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}