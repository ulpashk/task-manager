import { Paperclip, MessageSquare, Calendar } from 'lucide-react';
import { ActionMenu } from '../HomePage/ActionMenu';

export const KanbanCard = ({ task }) => {
  const getPriorityStyle = (priority) => {
    if (priority === 'high') return 'bg-red-50 text-red-500 border-red-100';
    if (priority === 'medium') return 'bg-orange-50 text-orange-500 border-orange-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  const priorityLabel = { high: 'Высокий', medium: 'Средний', low: 'Низкий' }[task.priority] || 'Низкий';

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
      {/* Header: Company Info */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <img src={`https://ui-avatars.com/api/?name=${task.client}`} alt="" className="w-8 h-8 rounded-md" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-700 leading-tight">{task.client}</span>
            <span className="text-[10px] text-gray-400">Петропавловск</span>
          </div>
        </div>
        <ActionMenu />
      </div>

      {/* Title */}
      <h4 className="text-[13px] font-bold text-gray-800 leading-snug">
        {task.title}
      </h4>

      {/* Roles: Assignee & Initiator */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <img src="https://ui-avatars.com/api/?name=Assignee" className="w-5 h-5 rounded-full" alt="" />
          <div className="text-[11px]">
            <span className="text-gray-400">Исполнитель: </span>
            <span className="text-gray-700 font-medium">{task.assignees[0]?.first_name || 'Не назначен'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <img src="https://ui-avatars.com/api/?name=Initiator" className="w-5 h-5 rounded-full" alt="" />
          <div className="text-[11px]">
            <span className="text-gray-400">Инициатор: </span>
            <span className="text-gray-700 font-medium">Кемелбай Мерей</span>
          </div>
        </div>
      </div>

      {/* Tag Badge */}
      <div>
        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] border border-blue-100 font-bold">
          {task.tags[0]?.name || 'База данных'}
        </span>
      </div>

      {/* Deadline */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
        <Calendar size={13} />
        <span>Дедлайн: <span className="text-red-500 font-medium">{new Date(task.deadline).toLocaleDateString()} 15:00</span></span>
      </div>

      {/* Footer Stats & Priority */}
      <div className="flex justify-between items-center pt-1 border-t border-gray-50 mt-1">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="flex items-center gap-1 text-[11px]">
            <Paperclip size={13} /> {task.attachments_count || 1}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <MessageSquare size={13} /> {task.comments_count || 1}
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${getPriorityStyle(task.priority)}`}>
          {priorityLabel}
        </span>
      </div>
    </div>
  );
};