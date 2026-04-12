import { useState } from 'react';
import { KanbanCard } from './KanbanCard';

export const KanbanColumn = ({ column, tasks, onEditRequest, onDeleteRequest, onDropTask }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDropTask?.(Number(taskId), column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col gap-4 p-2 rounded-xl min-w-[300px] flex-1 transition-all ${column.columnBg} ${isDragOver ? 'ring-2 ring-blue-300 bg-blue-50/30' : ''}`}
    >
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