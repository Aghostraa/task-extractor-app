// src/components/tasks/TaskInput/TaskInputButton.tsx
import { Button } from '@/components/ui/button';

interface TaskInputButtonProps {
  isDisabled: boolean;
}

export function TaskInputButton({ isDisabled }: TaskInputButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isDisabled}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      suppressHydrationWarning
    >
      Process Tasks
    </Button>
  );
}