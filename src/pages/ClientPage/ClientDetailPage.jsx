import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClientByIdApi } from '../../services/clientService';
import { Trash2, Pencil, Plus, ArrowLeft, Mail, Phone, User, Search, ChevronDown } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { EditClientModal } from '../../components/Clients/EditClientModal';

export const ClientDetailPage = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const refreshData = () => {
    fetchClientByIdApi(id).then(res => setClient(res));
  };

  useEffect(() => {
    fetchClientByIdApi(id)
      .then(res => setClient(res))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-400">Загрузка информации...</div>;
  if (!client) return <div className="p-10 text-center text-red-500">Компания не найдена</div>;

  const stats = [
    { label: 'Общий', value: client.task_summary?.total },
    { label: 'Не выполнено', value: client.task_summary?.created },
    { label: 'В обработке', value: client.task_summary?.in_progress },
    { label: 'В доработке', value: client.task_summary?.waiting },
    { label: 'Выполнено', value: client.task_summary?.done },
  ];

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden font-sans pb-4">
      <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex-shrink-0 flex items-center gap-8">
        <button onClick={() => navigate('/clients')} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-blue-600 transition-all"><ArrowLeft size={20} /></button>
        
        {isManager && (
          <div className="absolute top-6 right-6 flex gap-2">
            {/* <button className="p-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-red-600 shadow-sm transition-all"><Trash2 size={18} /></button> */}
            <button 
              className="p-2 bg-[#1677FF] text-white rounded-lg hover:bg-blue-600 shadow-sm transition-all"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Pencil size={18} />
            </button>
          </div>
        )}

        <div className="w-24 h-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 p-3 shadow-sm">
          <img src={`https://ui-avatars.com/api/?name=${client.name}&background=003366&color=fff&size=128`} alt="logo" />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800 uppercase">АО “{client.name}”</h2>
            <span className="bg-[#FFFBE6] text-[#D4B363] border-[#FFE58F] border px-3 py-0.5 rounded text-xs font-medium">AO</span>
          </div>
          <div className="text-[15px] text-gray-800 flex flex-col gap-1.5 mt-1">
            <p>E-mail: <span className="text-gray-600">{client.email}</span></p>
            <p>Номер телефона: <span className="text-gray-600">{formatPhoneNumber(client.phone)}</span></p>
            <p>Контактное лицо: <span className="text-gray-600">{client.contact_person}</span></p>
            <p>Количество сотрудников: <span className="text-gray-600">{client.employee_count}</span></p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Статистика задач</h3>
        <div className="grid grid-cols-5 gap-4">
          {stats.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="text-xl font-bold text-gray-800 mb-0.5">{item.value || 0}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <EditClientModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        client={client}
        onRefresh={refreshData}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-3">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Список сотрудников</h3>
           {isManager && (
             <button className="bg-[#1677FF] text-white px-4 py-1.5 rounded-lg flex items-center gap-2 font-bold text-xs hover:bg-blue-600 transition-all">
               <Plus size={14} /> Добавить
             </button>
           )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1">
           <div className="p-4 border-b border-gray-100 flex justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Поиск" 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value) }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex items-center gap-4 px-3 py-1.5 border border-gray-100 rounded-lg text-xs cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-gray-600 font-medium">По алфавиту</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar">
             <table className="w-full text-left border-separate border-spacing-0">
               <thead className="bg-[#F9FAFB] text-[11px] font-bold text-gray-400 uppercase sticky top-0 z-10">
                 <tr>
                   <th className="px-8 py-3 border-b border-gray-100">ФИО</th>
                   <th className="px-8 py-3 border-b border-gray-100">E-mail</th>
                   <th className="px-8 py-3 border-b border-gray-100 text-center">Роль</th>
                   <th className="px-8 py-3 border-b border-gray-100">Номер телефона</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 text-[13px]">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4 font-medium text-gray-700">Кемелбай Мерей Мураткызы</td>
                    <td className="px-8 py-4 text-gray-500">m_kemelbay@kbtu.kz</td>
                    <td className="px-8 py-4 text-center text-gray-600">Менеджер</td>
                    <td className="px-8 py-4 text-gray-500">+7 (727) 357-42-42</td>
                  </tr>
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};


