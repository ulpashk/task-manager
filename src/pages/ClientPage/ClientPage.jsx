import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClientsApi } from '../../services/clientService';
import { Search, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { Pagination } from '../../components/general/Pagination';
import { formatPhoneNumber } from '../../utils/formatters';

export const ClientsPage = () => {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 9;

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const res = await fetchClientsApi({ 
          page: currentPage, 
          search: searchTerm,
          page_size: pageSize 
        });
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, [currentPage, searchTerm]);

  const getBadgeStyle = (type) => {
    const styles = {
      too: 'bg-blue-50 text-blue-500 border-blue-100',
      ip: 'bg-purple-50 text-purple-500 border-purple-100',
      ao: 'bg-orange-50 text-orange-500 border-orange-100'
    };
    const key = type?.toLowerCase() || 'too';
    return styles[key] || styles.too;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden font-sans">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Все компании</h3>
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Сортировать</span>
            <div className="flex items-center gap-4 px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer min-w-[150px]">
              <span className="text-sm font-medium text-gray-700">По задачам</span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-[#F9FAFB] text-[13px] font-medium text-gray-500 sticky top-0 z-10 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-gray-100">Наименование</th>
              <th className="px-6 py-4 border-b border-gray-100 text-center">Тип</th>
              <th className="px-6 py-4 border-b border-gray-100">E-mail</th>
              <th className="px-6 py-4 border-b border-gray-100">Номер телефона</th>
              <th className="px-6 py-4 border-b border-gray-100 text-center">Задачи</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[14px]">
            {data.results.map((client) => (
              <tr 
                key={client.id} 
                onClick={() => navigate(`/clients/${client.id}`)}
                className="hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-5 text-gray-800 uppercase">
                  {client.client_type === 'company' ? 'АО' : ''} "{client.name}"
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getBadgeStyle(client.client_type)}`}>
                    {client.client_type}
                  </span>
                </td>
                <td className="px-6 py-5 text-gray-500">{client.email}</td>
                <td className="px-6 py-5 text-gray-500">{formatPhoneNumber(client.phone)}</td>
                <td className="px-6 py-5 text-center font-medium text-gray-700">{client.tasks_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination 
        totalCount={data.count} 
        pageSize={pageSize} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
};