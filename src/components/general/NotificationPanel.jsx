import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CalendarPlus, User, AtSign, MessageCircle, 
  Calendar, Star, CheckCircle2, Info, X, 
  FileText
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export const NotificationPanel = ({ items, onClose, onRefresh }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filteredItems = items.filter(item => {
    if (filter === 'unread') return !item.is_read;
    if (filter === 'read') return item.is_read;
    return true;
  });

  const handleNotificationClick = async (item) => {
    if (!item.is_read) {
      await notificationService.markAsRead(item.id);
      onRefresh();
    }

    if (item.task_id) navigate(`/tasks/${item.task_id}`);
    else if (item.summary_id) navigate(`/reports/summaries/${item.summary_id}`);
    else if (item.project_id) navigate(`/projects/${item.project_id}`);
    
    onClose();
  };

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    onRefresh();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_created': return <CalendarPlus size={20} className="text-gray-700" />;
      case 'summary_ready': return <FileText size={20} className="text-gray-700" />;
      case 'task_assigned': return <User size={20} className="text-gray-700" />;
      case 'mention': return <AtSign size={20} className="text-gray-800" />;
      case 'comment_added': return <MessageCircle size={20} className="text-gray-700" />;
      case 'deadline_warning': return <Calendar size={20} className="text-gray-700" />;
      case 'priority_changed': return <Star size={20} className="text-gray-700" />;
      default: return <Info size={20} className="text-gray-400" />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'task_created': return 'Новая задача';
      case 'summary_ready': return 'Отчет готов';
      case 'task_assigned': return 'Задача назначена';
      case 'mention': return 'Упоминание';
      case 'comment_added': return 'Добавлен комментарий';
      case 'deadline_warning': return 'Дедлайн';
      case 'priority_changed': return 'Приоритет изменен';
      default: return 'Неизвестное уведомление';
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-[400px] bg-white border border-gray-100 rounded-[20px] shadow-2xl z-[100] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 font-sans">
      
      <div className="p-5 pb-4 border-b border-gray-50 flex justify-between items-center">
        <h4 className="text-[18px] font-bold text-gray-900">Уведомления</h4>
        <button 
          onClick={handleMarkAll}
          className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          Прочитать все
        </button>
      </div>

      <div className="flex px-5 border-b border-gray-50 gap-6 bg-white">
        {[
          { id: 'all', label: 'Все' },
          { id: 'read', label: 'Прочитанные' },
          { id: 'unread', label: 'Непрочитанные' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`py-3 text-[14px] font-medium transition-all relative ${
              filter === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
            {filter === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-white">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleNotificationClick(item)}
              className="px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-all cursor-pointer flex items-start gap-3 relative group"
            >
              <div className="flex-shrink-0 w-2 h-5 flex items-center justify-center">
                {!item.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 shadow-sm" />}
              </div>

              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-700">
                {getNotificationIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <p className="text-[14px] font-bold text-gray-800 leading-5 truncate pr-2">
                    {getNotificationTitle(item.type)}
                  </p>
                  <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap leading-5">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ru })}
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 leading-normal line-clamp-2">
                  {item.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
              <CheckCircle2 size={30} />
            </div>
            <p className="text-sm text-gray-400 font-medium">Уведомлений нет</p>
          </div>
        )}
      </div>
      
      <div className="p-4 text-center border-t border-gray-50 bg-gray-50/30">
        <button 
          onClick={onClose} 
          className="text-[13px] font-bold text-gray-500 hover:text-gray-800 transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};