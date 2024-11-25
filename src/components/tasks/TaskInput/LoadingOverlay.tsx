// src/components/tasks/TaskInput/LoadingOverlay.tsx
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-neutral-800/50 flex items-center justify-center rounded-lg">
      <Loader2 className="animate-spin text-blue-500" />
    </div>
  );
}