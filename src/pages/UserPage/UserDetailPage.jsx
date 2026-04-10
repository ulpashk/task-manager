import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserByIdApi, deleteUserApi } from '../../services/userService';
import { fetchClientByIdApi } from '../../services/clientService';
import { Trash2, Pencil, Loader2, ChevronLeft } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/formatters';
import { Modal } from '../../components/general/Modal';
import { EditUserModal } from '../../components/Users/EditUserModal';

export const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clientName, setClientName] = useState('—');
  const [loading, setLoading] = useState(true);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserByIdApi(id);
        setUser(userData);

        if (userData.client) {
          try {
            const clientData = await fetchClientByIdApi(userData.client);
            setClientName(clientData.name);
          } catch (e) {
            console.error("Не удалось загрузить название компании");
            setClientName("Ошибка загрузки");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" size={20}/> Загрузка...</div>;
  if (!user) return <div className="p-10 text-center text-red-500 font-sans">Пользователь не найден</div>;

  const taskStats = [
    { label: 'Общий', value: user.assigned_tasks_count || 0 },
    { label: 'Не выполнено', value: 0 },
    { label: 'В обработке', value: 0 },
    { label: 'На доработке', value: 0 },
    { label: 'Выполнено', value: 0 },
  ];

  const getUserRoleLabel = (role) => {
    if (role === 'engineer') return 'Инженер';
    if (role === 'manager') return 'Менеджер';
    if (role === 'client') return 'Клиент';
    if (role === 'superadmin') return 'Суперадмин';
    if (role === 'admin') return 'Админ';
    return role;
  };


  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar font-sans pr-2 pb-10">
      
      <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 flex-shrink-0">
        
        <button 
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1)
            } else {
              navigate('/users')
            }
          }} 
          className="absolute top-8 left-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="absolute top-6 right-6 flex gap-2">
          <button 
            onClick={() => setIsDeleteOpen(true)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => setIsEditOpen(true)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Pencil size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4 pl-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {user.last_name} {user.first_name} {user.middle_name || ''}
          </h2>
          <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
            user.is_active 
              ? 'bg-green-50 text-green-600 border-green-100' 
              : 'bg-gray-50 text-gray-400 border-gray-200'
          }`}>
            {user.is_active ? 'Активный' : 'Неактивный'}
          </span>
        </div>

        <div className="flex items-start gap-6 pl-6">
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.last_name}+${user.first_name}&background=A7C7E7&color=ffffff&size=256&font-size=0.4`} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-2 text-[15px] text-gray-800 pt-1">
            <p>Номер телефона: <span className="text-gray-600 ml-1">{formatPhoneNumber(user.phone)}</span></p>
            <p>E-mail: <span className="text-gray-600 ml-1">{user.email}</span></p>
            <p>Роль: <span className="text-gray-600 ml-1">{getUserRoleLabel(user.role)}</span></p>
            <p>Компания: <span className="text-gray-600 ml-1 uppercase font-bold">{user?.role === 'superadmin' ? 'Платформа (Все компании)' : `${clientName}`}</span></p>
            {/* <p>Логин: <span className="text-gray-600 ml-1">{user.email}</span></p> */}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-bold text-gray-400 mb-4 px-1 uppercase tracking-widest">Статистика задач</h3>
        <div className="grid grid-cols-5 gap-4">
          {taskStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col justify-center min-h-[100px]">
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <EditUserModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} user={user} onRefresh={() => fetchUserByIdApi(id).then(setUser)} />
      
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Удалить пользователя">
        <div className="p-4 text-center">
          <p className="text-gray-600">Вы действительно хотите удалить пользователя <br/><b>{user.first_name} {user.last_name}</b>?</p>
          <div className="flex justify-center gap-3 mt-8">
            <button onClick={() => setIsDeleteOpen(false)} className="px-6 py-2 bg-gray-100 rounded-lg font-bold text-gray-500">Отмена</button>
            <button onClick={async () => { await deleteUserApi(user.id); navigate('/users'); }} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">Да, удалить</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};