import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Check, Info, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export const NotificationPanel = ({ items, onClose, onRefresh }) => {
  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    onRefresh();
  };

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    onRefresh();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'report': return <FileText className="text-blue-500" size={18}/>;
      case 'error': return <AlertTriangle className="text-red-500" size={18}/>;
      default: return <Info className="text-gray-400" size={18}/>;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h4 className="font-bold text-gray-800">Уведомления</h4>
        <button onClick={handleMarkAll} className="text-[11px] font-bold text-blue-600 hover:underline">Отметить все</button>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {items.length > 0 ? (
          items.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleMarkRead(item.id)}
              className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 group"
            >
              <div className="mt-1">{getIcon(item.type)}</div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-gray-800 leading-tight">{item.title}</p>
                <p className="text-[12px] text-gray-500 mt-1">{item.message}</p>
                <p className="text-[10px] text-gray-300 mt-2">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ru })}
                </p>
              </div>
              {!item.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-gray-400 text-sm">У вас нет новых уведомлений</div>
        )}
      </div>
      
      <div className="p-3 text-center border-t border-gray-50">
        <button onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-600">Закрыть</button>
      </div>
    </div>
  );
};