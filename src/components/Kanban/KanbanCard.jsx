import { useTranslation } from 'react-i18next';
import { Paperclip, MessageSquare, Calendar } from 'lucide-react';
import { ActionMenu } from '../TasksPage/ActionMenu';

export const KanbanCard = ({ task, onEdit, onDelete, onDragStart }) => {
  const { t } = useTranslation();

  const getPriorityStyle = (priority) => {
    if (priority === 'high' || priority === 'HIGH') return 'bg-red-50 text-red-500 border-red-100';
    if (priority === 'medium' || priority === 'MEDIUM') return 'bg-orange-50 text-orange-500 border-orange-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  const getPriorityLabel = (priority) => {
    if (priority === 'high' || priority === 'HIGH') return t('priority.high');
    if (priority === 'medium' || priority === 'MEDIUM') return t('priority.medium');
    return t('priority.low');
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', String(task.id));
        onDragStart?.(task);
      }}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <img src={`https://ui-avatars.com/api/?name=${task.client?.name}`} alt="" className="w-8 h-8 rounded-md" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-700 leading-tight">{task.client?.name}</span>
          </div>
        </div>
        <ActionMenu
          onEdit={(e) => { onEdit(); }}
          onDelete={(e) => { onDelete(); }}
        />
      </div>

      <h4 className="text-[13px] font-bold text-gray-800 leading-snug">
        {task.title}
      </h4>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <img src="https://ui-avatars.com/api/?name=Assignee" className="w-5 h-5 rounded-full" alt="" />
          <div className="text-[11px]">
            <span className="text-gray-400">{t('tasks.kanban_assignee')} </span>
            <span className="text-gray-700 font-medium">{task.assignees[0]?.first_name} {task.assignees[0]?.last_name || t('tasks.no_assignees')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <img src="https://ui-avatars.com/api/?name=Initiator" className="w-5 h-5 rounded-full" alt="" />
          <div className="text-[11px]">
            <span className="text-gray-400">{t('tasks.kanban_creator')} </span>
            <span className="text-gray-700 font-medium">{task.created_by?.first_name} {task.created_by?.last_name}</span>
          </div>
        </div>
      </div>

      <div>
        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] border border-blue-100 font-bold">
          {task.tags[0]?.name || t('tasks.no_tags')}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
        <Calendar size={13} />
        <span>{t('tasks.deadline')}: <span className="text-red-500 font-medium">{new Date(task.deadline).toLocaleDateString()} 15:00</span></span>
      </div>

      <div className="flex justify-between items-center pt-1 border-t border-gray-50 mt-1">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="flex items-center gap-1 text-[11px]">
            <Paperclip size={13} /> {task.attachments_count}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <MessageSquare size={13} /> {task.comments_count}
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${getPriorityStyle(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>
    </div>
  );
};
