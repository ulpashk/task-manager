import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../general/Modal';
import { createUserApi } from '../../services/userService';
import { fetchClientsApi } from '../../services/clientService';
import { parseFIO } from '../../utils/parsers';
import { Loader2, ChevronDown } from 'lucide-react';

export const AddUserModal = ({ isOpen, onClose, onRefresh }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    email: '', 
    full_name: '',
    role: 'engineer', 
    password: '', 
    client_id: '', 
    phone: '', 
  });

  useEffect(() => {
    if (isOpen) fetchClientsApi({ page_size: 100 }).then(res => setClients(res.results));
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { first_name, last_name } = parseFIO(formData.full_name);

    try {
      const payload = { 
        ...formData, 
        first_name: first_name, // Явно добавляем имя
        last_name: last_name,   // Явно добавляем фамилию
        client_id: formData.client_id ? Number(formData.client_id) : null 
      };
      delete payload.full_name;

      await createUserApi(payload);
      
      onRefresh();
      onClose();
      setFormData({ email: '', full_name: '', role: 'engineer', password: '', client_id: '', phone: '' });
    } catch (err) { 
      console.error(err);
      alert(t('users.create_error') + " " + (err.response?.data?.detail || ""));
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('users.add_title')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">{t('users.fio')}</label>
          <input
            required
            placeholder={t('users.fio_placeholder')}
            className="bg-gray-50 border p-2.5 rounded-lg outline-none focus:border-blue-500" 
            value={formData.full_name} 
            onChange={e => setFormData({...formData, full_name: e.target.value})} 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">{t('users.email')}</label>
          <input
          type="email"
          required
          placeholder={t('users.email_placeholder')}
          className="bg-gray-50 border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">{t('users.phone')}</label>
          <input type="tel" placeholder={t('users.phone_placeholder')} className="bg-gray-50 border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">{t('users.role')}</label>
            <div className="relative">
              <select className="w-full bg-gray-50 border p-2.5 rounded-lg outline-none appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="manager">{t('role.manager')}</option>
                <option value="engineer">{t('role.engineer')}</option>
                <option value="client">{t('role.client')}</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">{t('users.company')}</label>
            <div className='relative'>
                <select className="w-full bg-gray-50 border p-2.5 rounded-lg outline-none appearance-none" value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                    <option value="">{t('users.company_placeholder')}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">{t('users.password')}</label>
          <input
          type="password"
          required
          placeholder={t('users.password_placeholder')}
          className="bg-gray-50 border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-400">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />} {t('common.create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};