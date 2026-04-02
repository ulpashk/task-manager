import { KanbanCard } from './KanbanCard';

export const KanbanColumn = ({ column, tasks, onEditRequest, onDeleteRequest }) => {
  return (
    <div className={`flex flex-col gap-4 p-2 rounded-xl min-w-[300px] flex-1 ${column.columnBg}`}>
      <div className={`${column.headerBg} ${column.textColor} py-2.5 rounded-lg text-center font-bold text-sm`}>
        {column.title} ({tasks.length})
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
        {tasks.map(task => (
          <KanbanCard 
            key={task.id} 
            task={task} 
            onEdit={() => onEditRequest(task)}
            onDelete={() => onDeleteRequest(task)}
          />
        ))}
      </div>
    </div>
  );
};