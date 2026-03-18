import { useState } from 'react';
import { Modal } from '../general/Modal';
import { ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { createClientApi } from '../../services/clientService';

export const AddClientModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    client_type: 'company',
    phone: '',
    email: '',
    contact_person: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (serverErrors) setServerErrors(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerErrors(null);

    try {
      await createClientApi(formData);
      onRefresh();
      onClose();
      setFormData({ name: '', client_type: 'company', phone: '', email: '', contact_person: '' });
    } catch (err) {
      setServerErrors(err.response?.data || "Произошла ошибка при создании");
      console.error("Ошибка создания компании:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить компанию">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-sans">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">Наименование компании</label>
          <input 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`bg-[#F9FAFB] border ${serverErrors?.name ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all`} 
            placeholder="Например: ТОО Ромашка"
          />
          {serverErrors?.name && <p className="text-xs text-red-500">{serverErrors.name[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">Тип организации</label>
          <div className="relative">
            <select 
              name="client_type"
              value={formData.client_type}
              onChange={handleChange}
              className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none cursor-pointer focus:border-blue-500"
            >
              <option value="company">Компания (ТОО/АО)</option>
              <option value="person">Частное лицо / ИП</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">E-mail</label>
              <input 
                name="email"
                type="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                className={`bg-[#F9FAFB] border ${serverErrors?.email ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 outline-none focus:border-blue-500`} 
                placeholder="example@mail.com" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Номер телефона</label>
              <input 
                name="phone"
                required 
                value={formData.phone}
                onChange={handleChange}
                className={`bg-[#F9FAFB] border ${serverErrors?.phone ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 outline-none focus:border-blue-500`} 
                placeholder="87001234567" 
              />
            </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-2">
          <label className="text-sm font-bold text-gray-700">Контактное лицо</label>
          <input 
            name="contact_person"
            required 
            value={formData.contact_person}
            onChange={handleChange}
            className={`bg-[#F9FAFB] border ${serverErrors?.contact_person ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 outline-none focus:border-blue-500`} 
            placeholder="ФИО руководителя или менеджера" 
          />
        </div>

        {typeof serverErrors === 'string' && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
            <AlertCircle size={16} />
            <span className="text-xs font-medium">{serverErrors}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t pt-6">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Отменить
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-[#1677FF] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:bg-blue-300"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Создание...' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};