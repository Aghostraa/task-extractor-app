import { ViewType, Folder } from '@/types/index';
import { List, Calendar, Flag, Layout } from 'lucide-react';

interface ViewConfig {
  id: ViewType;
  name: string;
  icon: typeof List | typeof Calendar | typeof Flag | typeof Layout;
  description: string;
}

interface TaskHeaderProps {
  title: string;
  description: string;
}

export function TaskHeader({ title, description }: TaskHeaderProps) {
  return (
    <header className="mb-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-neutral-400">{description}</p>
    </header>
  );
}
