import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrganizationByIdApi, fetchOrgManagersApi, createOrgManagerApi } from '../../services/organizationService';
import { usePage } from '../../context/PageContext';
import { Modal } from '../../components/general/Modal';
import { Loader2, ArrowLeft, Users, Briefcase, Building2, ListTodo, UserPlus } from 'lucide-react';

export const OrganizationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCustomTitle } = usePage();
  const [org, setOrg] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddManager, setShowAddManager] = useState(false);
  const [managerForm, setManagerForm] = useState({ email: '', first_name: '', last_name: '', password: '' });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orgData, managersData] = await Promise.all([
        fetchOrganizationByIdApi(id),
        fetchOrgManagersApi(id)
      ]);
      setOrg(orgData);
      setManagers(managersData.results || []);
      setCustomTitle(orgData.name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, setCustomTitle]);

  useEffect(() => {
    loadData();
    return () => setCustomTitle(null);
  }, [loadData, setCustomTitle]);

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createOrgManagerApi(id, managerForm);
      setShowAddManager(false);
      setManagerForm({ email: '', first_name: '', last_name: '', password: '' });
      loadData();
    } catch (err) {
      const detail = err.response?.data;
      const msg = detail?.email?.[0] || detail?.detail || 'Ошибка создания менеджера';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!org) {
    return <div className="text-center py-20 text-gray-400">Организация не найдена</div>;
  }

  const stats = [
    { label: 'Менеджеры', value: org.manager_count ?? 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Инженеры', value: org.engineer_count ?? 0, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Клиенты (пользователи)', value: org.client_user_count ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Компании', value: org.client_count ?? 0, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Задачи', value: org.task_count ?? 0, icon: ListTodo, color: 'text-gray-600', bg: 'bg-gray-50' },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar font-sans p-4 pt-0 flex flex-col gap-6">
      <button
        onClick={() => navigate('/organizations')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm w-fit"
      >
        <ArrowLeft size={16} /> Назад к организациям
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-800">{org.name}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${org.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {org.is_active ? 'Активна' : 'Неактивна'}
          </span>
        </div>
        <p className="text-sm text-gray-400">Slug: {org.slug}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <Icon size={16} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Managers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Менеджеры</h3>
          <button
            onClick={() => setShowAddManager(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
          >
            <UserPlus size={16} /> Добавить
          </button>
        </div>

        {managers.length === 0 ? (
          <p className="text-gray-400 text-sm">Менеджеров пока нет</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase">Имя</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase">Email</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase">Статус</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase">Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {managers.map(m => (
                <tr key={m.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.first_name} {m.last_name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {m.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {m.date_joined ? new Date(m.date_joined).toLocaleDateString('ru-RU') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Manager Modal */}
      <Modal isOpen={showAddManager} onClose={() => setShowAddManager(false)} title="Новый менеджер">
        <form onSubmit={handleCreateManager} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
            <input
              type="email"
              required
              className="bg-gray-50 border p-2.5 rounded-lg outline-none focus:border-blue-500"
              value={managerForm.email}
              onChange={e => setManagerForm({ ...managerForm, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Имя</label>
              <input
                required
                className="bg-gray-50 border p-2.5 rounded-lg outline-none focus:border-blue-500"
                value={managerForm.first_name}
                onChange={e => setManagerForm({ ...managerForm, first_name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Фамилия</label>
              <input
                required
                className="bg-gray-50 border p-2.5 rounded-lg outline-none focus:border-blue-500"
                value={managerForm.last_name}
                onChange={e => setManagerForm({ ...managerForm, last_name: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Пароль (мин. 8 символов)</label>
            <input
              type="password"
              required
              minLength={8}
              className="bg-gray-50 border p-2.5 rounded-lg outline-none focus:border-blue-500"
              value={managerForm.password}
              onChange={e => setManagerForm({ ...managerForm, password: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setShowAddManager(false)} className="px-6 py-2 font-bold text-gray-400">Отмена</button>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />} Создать
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
