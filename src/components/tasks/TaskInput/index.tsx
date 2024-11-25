// src/components/tasks/TaskInput/index.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/types/index';
import { LoadingOverlay } from './LoadingOverlay';
import { TaskInputButton } from './TaskInputButton';
import { TaskInputField } from './TaskInputField';
import { useTaskInput } from './useTaskInput';

interface TaskInputProps {
  onTasksAdded: (tasks: Task[]) => void;
  isLoading?: boolean;
  currentFolderId?: string;
}

export function TaskInput({ 
  onTasksAdded, 
  isLoading = false, 
  currentFolderId 
}: TaskInputProps) {
  const { isProcessing, handleSubmit } = useTaskInput({
    onTasksAdded,
    currentFolderId
  });

  const isDisabled = isProcessing || isLoading;
  const placeholder = currentFolderId 
    ? "Add tasks to this folder..." 
    : "Paste your notes here...";

  return (
    <form action={handleSubmit} suppressHydrationWarning>
      <Card className="bg-neutral-800 border-neutral-700 mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <TaskInputField
              placeholder={placeholder}
              isDisabled={isDisabled}
            />
            <LoadingOverlay 
              isVisible={isProcessing || isLoading} 
            />
          </div>
          <TaskInputButton 
            isDisabled={isDisabled}
          />
        </CardContent>
      </Card>
    </form>
  );
}