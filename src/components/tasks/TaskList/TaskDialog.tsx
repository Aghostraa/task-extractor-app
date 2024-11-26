import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, Folder } from '@/types';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  folders: Folder[];
  task?: Task;
}

export function TaskDialog({ open, onOpenChange, onSave, folders, task }: TaskDialogProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('3');
  const [category, setCategory] = useState('general');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setText(task.text);
      setPriority(String(task.priority));
      setCategory(task.category);
      setFolderId(task.folderId || null);
    } else {
      setText('');
      setPriority('3');
      setCategory('general');
      setFolderId(null);
    }
  }, [task]);

  const handleFolderChange = (value: string) => {
    setFolderId(value === 'none' ? null : value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave({
        ...task,
        text,
        priority: Number(priority),
        category,
        folderId,
        status: task?.status || 'todo',
        completed: false,
        flagged: false
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-800 border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm">Task Description</label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-neutral-700 border-neutral-600 text-white"
              placeholder="Enter task description"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-700 border-neutral-600 text-white">
                <SelectItem value="1">High</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-700 border-neutral-600 text-white">
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm">Folder</label>
            <Select 
              value={folderId || 'none'} 
              onValueChange={handleFolderChange}
            >
              <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-700 border-neutral-600 text-white">
                <SelectItem value="none">No Folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}