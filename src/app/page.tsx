import { TaskBoard } from '@/components/tasks/TaskBoard';
import  ClientOnly  from '@/components/layout/ClientOnly';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white overflow-hidden">
      <div className="container-fluid h-full">
        <div className="container-wide h-full">
          <ClientOnly>
            <TaskBoard />
          </ClientOnly>
        </div>
      </div>
    </main>
  );
}