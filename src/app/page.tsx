import { TaskBoard } from '@/components/TaskBoard';
import ClientOnly from '@/components/ClientOnly';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        <ClientOnly>
          <TaskBoard />
        </ClientOnly>
      </div>
    </main>
  );
}