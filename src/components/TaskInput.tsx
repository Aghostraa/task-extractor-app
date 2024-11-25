// src/components/TaskInput.tsx
'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { extractAndSaveTasks } from '@/app/actions/tasks';
import { Task } from '@/types';

interface TaskInputProps {
  onTasksAdded: (tasks: Task[]) => void;
  isLoading?: boolean;
  currentFolderId?: string;
}

export function TaskInput({ onTasksAdded, isLoading = false, currentFolderId }: TaskInputProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsProcessing(true);
    try {
      if (currentFolderId) {
        formData.append('folderId', currentFolderId);
      }
      
      const result = await extractAndSaveTasks(formData);
      if (result.success && result.tasks) {
        onTasksAdded(result.tasks);
        const form = document.querySelector('form') as HTMLFormElement;
        form?.reset();
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <form action={handleSubmit} suppressHydrationWarning>
      <Card className="bg-neutral-800 border-neutral-700 mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <textarea
              name="text"
              className="w-full h-32 bg-neutral-700 rounded-lg p-4 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={currentFolderId 
                ? "Add tasks to this folder..." 
                : "Paste your notes here..."
              }
              suppressHydrationWarning
            />
            {(isProcessing || isLoading) && (
              <div className="absolute inset-0 bg-neutral-800/50 flex items-center justify-center rounded-lg">
                <Loader2 className="animate-spin text-blue-500" />
              </div>
            )}
          </div>
          <button 
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing || isLoading}
            suppressHydrationWarning
          >
            Process Tasks
          </button>
        </CardContent>
      </Card>
    </form>
  );
}