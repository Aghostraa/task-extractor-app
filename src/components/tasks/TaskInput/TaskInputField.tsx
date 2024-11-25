// src/components/tasks/TaskInput/TaskInputField.tsx
interface TaskInputFieldProps {
    placeholder: string;
    isDisabled: boolean;
  }
  
  export function TaskInputField({ placeholder, isDisabled }: TaskInputFieldProps) {
    return (
      <textarea
        name="text"
        className="w-full h-32 bg-neutral-700 rounded-lg p-4 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        disabled={isDisabled}
        suppressHydrationWarning
      />
    );
  }
  