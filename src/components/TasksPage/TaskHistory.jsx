import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  History, User, Edit3, PlusCircle, MessageSquare, 
  ArrowRight, Loader2, Clock, Paperclip
} from 'lucide-react';
import { fetchTaskHistoryApi } from '../../services/taskService';

export const TaskHistory = ({ taskId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchTaskHistoryApi(taskId);
        setHistory(data);
      } catch (err) {
        console.error("Ошибка загрузки истории:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [taskId]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'field_update': return <Edit3 size={16} className="text-blue-500" />;
      case 'comment_added': return <MessageSquare size={16} className="text-green-500" />;
      case 'created': return <PlusCircle size={16} className="text-purple-500" />;
      case 'file_attached': return <Paperclip size={16} className="text-blue-500" />;
      default: return <History size={16} className="text-gray-400" />;
    }
  };

  const getActionLabel = (item) => {
    if (item.action === 'comment_added') return 'Добавлен комментарий';
    if (item.action === 'field_update') return `Изменено поле: ${item.field}`;
    if (item.action === 'file_attached') return `Прикреплен файл: ${item.new_value}`;
    return item.action;
  };

  if (loading) return (
    <div className="flex justify-center py-10 text-gray-400">
      <Loader2 className="animate-spin mr-2" size={20} /> Загрузка истории...
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-8 bg-white space-y-6">
      {history.length > 0 ? (
        history.map((item) => (
          <div key={item.id} className="flex gap-4 relative">
            {/* Линия таймлайна */}
            <div className="absolute left-[17px] top-10 bottom-[-24px] w-px bg-gray-100 last:hidden" />
            
            {/* Иконка и аватар */}
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm text-gray-600 font-bold text-xs uppercase">
                {item.changed_by?.first_name?.[0] || 'U'}
              </div>
              <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5 border border-gray-50 shadow-sm">
                {getActionIcon(item.action)}
              </div>
            </div>

            {/* Контент истории */}
            <div className="flex-1 pt-1 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-bold text-gray-800">
                  {item.changed_by?.first_name} {item.changed_by?.last_name}
                </p>
                <div className="flex items-center gap-1.5 text-gray-400">
                   <Clock size={12} />
                   <span className="text-[11px] font-medium">
                     {format(new Date(item.changed_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                   </span>
                </div>
              </div>

              <p className="text-[13px] text-blue-600 font-bold mt-1 uppercase tracking-tight">
                {getActionLabel(item)}
              </p>

              {/* Отображение изменений (старое -> новое) */}
              {(item.old_value || item.new_value) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                  {item.old_value && (
                    <span className="text-gray-400 text-xs line-through italic truncate max-w-[200px]">
                      {item.old_value}
                    </span>
                  )}
                  {item.old_value && <ArrowRight size={14} className="text-gray-300" />}
                  <span className="text-gray-700 text-xs font-medium">
                    {item.new_value}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
           <History size={48} className="mb-4 opacity-20" />
           <p className="text-sm font-medium">История изменений пуста</p>
        </div>
      )}
    </div>
  );
};