import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { fetchClientsApi } from '../../services/clientService';
import { Search, ChevronDown, ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import { Pagination } from '../../components/general/Pagination';
import { formatPhoneNumber } from '../../utils/formatters';
import { AddClientModal } from '../../components/Clients/AddClientModal';

export const ClientsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetchClientsApi({ page: currentPage, search: searchTerm, page_size: 9 });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClients(); }, [currentPage, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden font-sans">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{t('clients.all_companies')}</h3>
          {isManager && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1677FF] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-600 transition-all shadow-sm"
            >
              <Plus size={18} /> {t('clients.add')}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('common.search')}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2 cursor-pointer border px-3 py-2 rounded-lg bg-white">
            <span className="text-sm font-medium text-gray-700">{t('clients.sort_by_tasks')}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-[#F9FAFB] text-[13px] font-bold text-gray-400 sticky top-0 z-10 uppercase">
            <tr>
              <th className="px-6 py-4 border-b border-gray-100">{t('clients.name')}</th>
              <th className="px-6 py-4 border-b border-gray-100 text-center">{t('clients.type')}</th>
              <th className="px-6 py-4 border-b border-gray-100">{t('clients.email')}</th>
              <th className="px-6 py-4 border-b border-gray-100">{t('clients.phone')}</th>
              <th className="px-6 py-4 border-b border-gray-100 text-center">{t('clients.tasks')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[14px]">
            {data.results.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                <td onClick={() => navigate(`/clients/${client.id}`)} className="px-6 py-5 text-gray-800 uppercase">{client.name}</td>
                <td className="px-6 py-5 text-center">
                  <span className="bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {client.client_type === 'company' ? t('clients.type_company') : client.client_type}
                  </span>
                </td>
                <td className="px-6 py-5 text-gray-500">{client.email}</td>
                <td className="px-6 py-5 text-gray-500">{formatPhoneNumber(client.phone)}</td>
                <td className="px-6 py-5 text-center font-medium">{client.tasks_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination totalCount={data.count} pageSize={9} currentPage={currentPage} onPageChange={setCurrentPage} />

      <AddClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={loadClients} />
    </div>
  );
};
