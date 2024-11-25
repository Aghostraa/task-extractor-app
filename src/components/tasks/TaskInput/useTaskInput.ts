// src/components/tasks/TaskInput/useTaskInput.ts
'use client'

import { useState } from 'react';
import { Task } from '@/types/index';
import { extractAndSaveTasks } from '@/app/actions/tasks';

interface UseTaskInputProps {
  onTasksAdded: (tasks: Task[]) => void;
  currentFolderId?: string;
}

export function useTaskInput({ onTasksAdded, currentFolderId }: UseTaskInputProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (formData: FormData) => {
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
  };

  return {
    isProcessing,
    handleSubmit
  };
}
