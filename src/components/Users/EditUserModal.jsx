import React, { useState, useEffect } from 'react';
import { Modal } from '../general/Modal';
import { updateUserApi } from '../../services/userService';
import { fetchClientsApi } from '../../services/clientService';
import { parseFIO } from '../../utils/parsers';
import { X, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';

const FIELD_LABELS = {
  full_name: 'ФИО',
  email: 'Email',
  role: 'Роль',
  client_id: 'Компания',
  phone: 'Номер телефона',
  is_active: 'Статус',
  password: 'Пароль'
};

const ROLE_LABELS = {
  superadmin: 'Суперадмин',
  admin: 'Админ',
  manager: 'Менеджер',
  engineer: 'Инженер',
  client: 'Клиент'
};

export const EditUserModal = ({ isOpen, onClose, user, onRefresh }) => {
  const [step, setStep] = useState('edit');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [finalChanges, setFinalChanges] = useState([]);
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: '',
    password: '',
    client_id: '',
    phone: '',
    is_active: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchClientsApi({ page_size: 100 })
        .then(res => setClients(res.results))
        .catch(err => console.error("Ошибка загрузки компаний:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      const initialFIO = `${user.last_name || ''} ${user.first_name || ''}`.trim();
      setFormData({
        email: user.email || '',
        full_name: initialFIO,
        role: user.role || 'engineer',
        password: '',
        client_id: user.client?.id || '',
        phone: user.phone || '',
        is_active: user.is_active ?? true
      });
      setStep('edit');
      setFinalChanges([]);
    }
  }, [isOpen]);

  const getDisplayValue = (key, value) => {
    if (value === '' || value === null || value === undefined) return 'не указано';
    if (key === 'is_active') return value ? 'Активный' : 'Неактивный';
    if (key === 'role') return ROLE_LABELS[value] || value;
    if (key === 'client_id') {
      const client = clients.find(c => String(c.id) === String(value));
      return client ? client.name : 'Без компании';
    }
    if (key === 'password') return '********';
    return value;
  };

  const getChanges = () => {
    const changes = [];
    
    const originalFIO = `${user.last_name || ''} ${user.first_name || ''}`.trim();
    if (formData.full_name !== originalFIO) {
      changes.push({
        key: 'full_name',
        label: FIELD_LABELS.full_name,
        oldValue: originalFIO || 'не указано',
        newValue: formData.full_name
      });
    }

    const otherFields = ['email', 'role', 'client_id', 'phone', 'is_active', 'password'];
    otherFields.forEach(key => {
      if (key === 'password' && !formData[key]) return;

      let originalValue;
      if (key === 'client_id') originalValue = user.client?.id || '';
      else originalValue = user[key];

      if (String(formData[key]) !== String(originalValue ?? '')) {
        changes.push({
          key,
          label: FIELD_LABELS[key],
          oldValue: getDisplayValue(key, originalValue),
          newValue: getDisplayValue(key, formData[key])
        });
      }
    });
    return changes;
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    const diff = getChanges();
    if (diff.length > 0) {
      setFinalChanges(diff);
      setStep('confirm');
    } else {
      onClose();
    }
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    
    const { first_name, last_name } = parseFIO(formData.full_name);

    try {
      const payload = { 
        ...formData,
        first_name,
        last_name, 
      };
      
      delete payload.full_name;
      if (!payload.password) delete payload.password;
      payload.client_id = payload.client_id ? Number(payload.client_id) : null;

      await updateUserApi(user.id, payload);
      setStep('success');
      onRefresh();
    } catch (err) {
      alert("Ошибка при обновлении данных");
      setStep('edit');
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(() => setStep('edit'), 300);
  };

  if (!user) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={closeAndReset} 
      title={step === 'edit' ? "Редактировать пользователя" : "Подтверждение изменений"}
    >
      <div className="font-sans">
        {step === 'edit' && (
          <form onSubmit={handleSaveClick} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-gray-400 uppercase">ФИО</label>
              <input 
                required 
                className="bg-[#F9FAFB] border border-gray-200 p-2.5 rounded-lg outline-none focus:border-blue-500 transition-all" 
                value={formData.full_name} 
                onChange={e => setFormData({...formData, full_name: e.target.value})} 
                placeholder="Фамилия Имя Отчество"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-gray-400 uppercase">Email</label>
              <input type="email" required className="bg-[#F9FAFB] border border-gray-200 p-2.5 rounded-lg outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-gray-400 uppercase">Номер телефона</label>
              <input type="tel" className="bg-[#F9FAFB] border border-gray-200 p-2.5 rounded-lg outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-gray-400 uppercase">Роль</label>
                <div className="relative">
                  <select className="w-full bg-[#F9FAFB] border border-gray-200 p-2.5 rounded-lg outline-none appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="superadmin">Суперадмин</option>
                    <option value="admin">Админ</option>
                    <option value="manager">Менеджер</option>
                    <option value="engineer">Инженер</option>
                    <option value="client">Клиент</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-gray-400 uppercase">Компания</label>
                <div className="relative">
                  <select className="w-full bg-[#F9FAFB] border border-gray-200 p-2.5 rounded-lg outline-none appearance-none" value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                    <option value="">Без компании</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-gray-400 uppercase text-blue-600">Пароль (оставьте пустым, чтобы не менять)</label>
              <input type="password" placeholder="••••••••" className="bg-white border border-blue-100 p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-400 uppercase">Статус</label>
              <div className="relative">
                <select 
                  className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none cursor-pointer focus:border-blue-500"
                  value={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}
                >
                  <option value="true">Активный</option>
                  <option value="false">Неактивный</option>
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className={`px-3 py-1 rounded border text-[11px] font-bold uppercase ${
                    formData.is_active 
                      ? 'bg-green-50 text-green-500 border-green-200' 
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}>
                    {formData.is_active ? 'Активный' : 'Неактивный'}
                  </span>
                </div>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t pt-6">
              <button type="button" onClick={onClose} className="px-6 py-2.5 font-bold text-gray-400">Отмена</button>
              <button type="submit" className="bg-[#1677FF] text-white px-10 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-100">Сохранить</button>
            </div>
          </form>
        )}

        {step === 'confirm' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="space-y-3">
              {finalChanges.map(field => (
                <div key={field.key} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[14px]">
                  <span className="font-bold text-gray-700">{field.label}:</span> 
                  <span className="mx-2 text-gray-400">«{field.oldValue}»</span> 
                  <span className="text-blue-600 font-bold">→ «{field.newValue}»</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t pt-6">
              <button onClick={() => setStep('edit')} className="px-6 py-2.5 font-bold text-gray-500">Назад</button>
              <button onClick={handleConfirmUpdate} disabled={loading} className="bg-[#1677FF] text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />} Изменить
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center py-6 gap-4 animate-in zoom-in-95">
            <CheckCircle2 size={56} className="text-[#52C41A]" />
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800">Пользователь обновлен</h3>
            </div>
            <button onClick={onClose} className="bg-[#1677FF] text-white px-12 py-2.5 rounded-lg font-bold mt-4 shadow-lg shadow-blue-100">Ок</button>
          </div>
        )}
      </div>
    </Modal>
  );
};