import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { portalService } from '../../services/portalService';
import { Pagination } from '../../components/general/Pagination';
import { Loader2 } from 'lucide-react';

export const PortalTicketsPage = () => {
  const { t } = useTranslation();

  const STATUS_MAP = {
    created: { label: t('status.created'), bg: 'bg-gray-100', text: 'text-gray-600' },
    in_progress: { label: t('status.in_progress'), bg: 'bg-yellow-50', text: 'text-yellow-700' },
    waiting: { label: t('status.waiting'), bg: 'bg-blue-50', text: 'text-blue-700' },
    revision: { label: t('status.revision'), bg: 'bg-purple-50', text: 'text-purple-700' },
    done: { label: t('status.done'), bg: 'bg-green-50', text: 'text-green-700' },
    archived: { label: t('status.archived'), bg: 'bg-gray-100', text: 'text-gray-500' },
  };

  const PRIORITY_MAP = {
    low: { label: t('priority.low'), color: 'text-gray-500' },
    medium: { label: t('priority.medium'), color: 'text-yellow-600' },
    high: { label: t('priority.high'), color: 'text-orange-600' },
    critical: { label: t('priority.critical'), color: 'text-red-600' },
  };
  const navigate = useNavigate();
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portalService.listTickets(page);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden font-sans">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">{t('portal.my_tickets')}</h2>
        <span className="text-sm text-gray-400">{data.count} {t('portal.count')}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : data.results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-lg font-medium">{t('portal.no_tickets')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">{t('portal.title_col')}</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">{t('portal.status_col')}</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">{t('portal.priority_col')}</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">{t('portal.deadline_col')}</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map(ticket => {
                const status = STATUS_MAP[ticket.status] || STATUS_MAP.created;
                const priority = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.medium;
                return (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/portal/${ticket.id}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{ticket.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-medium ${priority.color}`}>{priority.label}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(ticket.deadline)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {data.count > pageSize && (
        <div className="px-6 py-4 border-t border-gray-100">
          <Pagination
            totalCount={data.count}
            pageSize={pageSize}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
