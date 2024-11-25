// src/components/tasks/TaskList/TaskBadges.tsx
interface TaskBadgeProps {
    children: React.ReactNode;
    variant: 'priority' | 'category' | 'folder' | 'date';
    color?: string;
    opacity?: number;
  }
  
  function TaskBadge({ children, variant, color, opacity = 1 }: TaskBadgeProps) {
    const baseClasses = "text-xs px-2 py-1 rounded";
    
    const variantClasses = {
      priority: "",  // Applied dynamically based on priority level
      category: "bg-blue-500/20 text-blue-300",
      folder: "text-neutral-300",
      date: "bg-neutral-700 text-neutral-300"
    };
  
    return (
      <span 
        className={`${baseClasses} ${variantClasses[variant]}`}
        style={color ? { backgroundColor: color, opacity } : undefined}
      >
        {children}
      </span>
    );
  }
  
  interface PriorityBadgeProps {
    priority: number;
  }
  
  function PriorityBadge({ priority }: PriorityBadgeProps) {
    const classes = {
      1: 'bg-red-500/20 text-red-300',
      2: 'bg-yellow-500/20 text-yellow-300',
      3: 'bg-green-500/20 text-green-300'
    }[priority] || '';
  
    return (
      <TaskBadge variant="priority">
        <span className={classes}>P{priority}</span>
      </TaskBadge>
    );
  }
  
  interface TaskBadgesProps {
    priority: number;
    category: string;
    folderId?: string | null;
    folderName?: string;
    folderColor?: string;
    createdAt: Date;
  }
  
  export function TaskBadges({ 
    priority, 
    category, 
    folderId, 
    folderName, 
    folderColor,
    createdAt 
  }: TaskBadgesProps) {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        <PriorityBadge priority={priority} />
        
        <TaskBadge variant="category">
          {category}
        </TaskBadge>
        
        {folderId && folderName && (
          <TaskBadge 
            variant="folder" 
            color={folderColor ?? '#888'} 
            opacity={0.2}
          >
            {folderName}
          </TaskBadge>
        )}
        
        <TaskBadge variant="date">
          {new Date(createdAt).toLocaleDateString()}
        </TaskBadge>
      </div>
    );
  }