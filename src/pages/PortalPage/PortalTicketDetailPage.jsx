import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { portalService } from '../../services/portalService';
import { usePage } from '../../context/PageContext';
import { Loader2, ArrowLeft, Paperclip } from 'lucide-react';

const STATUS_MAP = {
  created: { label: 'Создано', bg: 'bg-gray-100', text: 'text-gray-600' },
  in_progress: { label: 'В обработке', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  waiting: { label: 'На проверке', bg: 'bg-blue-50', text: 'text-blue-700' },
  revision: { label: 'На доработке', bg: 'bg-purple-50', text: 'text-purple-700' },
  done: { label: 'Выполнено', bg: 'bg-green-50', text: 'text-green-700' },
  archived: { label: 'Архив', bg: 'bg-gray-100', text: 'text-gray-500' },
};

const PRIORITY_MAP = {
  low: { label: 'Низкий', color: 'text-gray-500' },
  medium: { label: 'Средний', color: 'text-yellow-600' },
  high: { label: 'Высокий', color: 'text-orange-600' },
  critical: { label: 'Критичный', color: 'text-red-600' },
};

export const PortalTicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCustomTitle } = usePage();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await portalService.getTicket(id);
        setTicket(data);
        setCustomTitle(data.title);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => setCustomTitle(null);
  }, [id, setCustomTitle]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!ticket) {
    return <div className="text-center py-20 text-gray-400">Заявка не найдена</div>;
  }

  const status = STATUS_MAP[ticket.status] || STATUS_MAP.created;
  const priority = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.medium;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar font-sans p-4 pt-0">
      <button
        onClick={() => navigate('/portal')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-4 text-sm"
      >
        <ArrowLeft size={16} /> Назад к заявкам
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">{ticket.title}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Приоритет</span>
            <p className={`font-medium ${priority.color}`}>{priority.label}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Дедлайн</span>
            <p className="text-gray-700">{formatDate(ticket.deadline)}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Создано</span>
            <p className="text-gray-700">{formatDate(ticket.created_at)}</p>
          </div>
        </div>

        {ticket.description && (
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Описание</span>
            <p className="text-gray-700 mt-1 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        )}
      </div>

      {/* Attachments */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Файлы</h3>
          <div className="flex flex-col gap-2">
            {ticket.attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-blue-600">
                <Paperclip size={14} />
                <span>{att.filename || att.file_name || `Файл ${idx + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Комментарии</h3>
        {(!ticket.comments || ticket.comments.length === 0) ? (
          <p className="text-gray-400 text-sm">Комментариев пока нет</p>
        ) : (
          <div className="flex flex-col gap-4">
            {ticket.comments.map((comment, idx) => (
              <div key={idx} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {comment.author?.first_name} {comment.author?.last_name}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
