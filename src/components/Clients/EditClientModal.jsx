import React, { useState, useEffect } from 'react';
import { X, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { updateClientApi } from '../../services/clientService';

const FIELD_LABELS = {
  name: 'Наименование компании',
  email: 'E-mail',
  phone: 'Номер телефона',
  contact_person: 'Контактное лицо',
  client_type: 'Тип компании'
};

export const EditClientModal = ({ isOpen, onClose, client, onRefresh }) => {
  const [step, setStep] = useState('edit');
  const [loading, setLoading] = useState(false);
  // НОВОЕ: стейт для фиксации изменений, чтобы они не исчезали после обновления данных
  const [finalChanges, setFinalChanges] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', contact_person: '', client_type: ''
  });

  // Инициализация при открытии
  useEffect(() => {
    if (isOpen && client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        contact_person: client.contact_person || '',
        client_type: client.client_type || 'company'
      });
      setStep('edit');
      setFinalChanges([]); // Очищаем старые изменения
    }
  }, [isOpen]); // Следим только за открытием

  if (!isOpen) return null;

  // Функция расчета текущих изменений (для блокировки кнопки Сохранить)
  const getLiveChanges = () => {
    const changes = [];
    if (!client) return changes;
    Object.keys(formData).forEach(key => {
      if (String(formData[key]).trim() !== String(client[key] || '').trim()) {
        changes.push({
          key,
          label: FIELD_LABELS[key] || key,
          oldValue: client[key] || 'не указано',
          newValue: formData[key]
        });
      }
    });
    return changes;
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    const currentChanges = getLiveChanges();
    if (currentChanges.length > 0) {
      setFinalChanges(currentChanges); // ФИКСИРУЕМ изменения перед отправкой
      setStep('confirm');
    }
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    try {
      await updateClientApi(client.id, formData);
      // Важно: Сначала переходим в успех, используя зафиксированные finalChanges
      setStep('success');
      // Теперь обновляем родителя. Даже если client обновится, 
      // наше окно успеха будет использовать finalChanges и не опустеет.
      onRefresh(); 
    } catch (error) {
      alert("Ошибка при сохранении");
      setStep('edit');
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      setStep('edit');
      setFinalChanges([]);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
      <div 
        className={`bg-white rounded-[20px] shadow-2xl transition-all duration-300 overflow-hidden ${
          step === 'edit' ? 'max-w-[530px]' : 'max-w-[480px]'
        } w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ШАПКА: Теперь заголовок не зависит от динамических расчетов */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <h2 className="text-[20px] font-bold text-gray-800">
            {step === 'edit' && 'Изменить данные организации'}
            {step === 'confirm' && 'Подтверждение изменений'}
            {step === 'success' && 'Изменения сохранены'}
          </h2>
          <button onClick={closeAndReset} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24}/>
          </button>
        </div>

        <div className="p-8">
          {/* ШАГ 1: РЕДАКТИРОВАНИЕ */}
          {step === 'edit' && (
            <form onSubmit={handleSaveClick} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Наименование компании</label>
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">E-mail</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Номер телефона</label>
                <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Контактное лицо</label>
                <input value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Тип компании</label>
                <div className="relative">
                  <select value={formData.client_type} onChange={(e) => setFormData({...formData, client_type: e.target.value})} className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer focus:border-blue-500">
                    <option value="company">ТОО</option>
                    <option value="ao">АО</option>
                    <option value="person">ИП</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeAndReset} className="px-6 py-2.5 font-bold text-gray-400 hover:text-gray-600 transition-colors">Отменить</button>
                <button type="submit" disabled={getLiveChanges().length === 0} className="bg-[#1677FF] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-600 transition-all disabled:bg-gray-100 disabled:text-gray-300 shadow-lg shadow-blue-100 disabled:shadow-none">Сохранить</button>
              </div>
            </form>
          )}

          {/* ШАГ 2: ПОДТВЕРЖДЕНИЕ (Используем finalChanges) */}
          {step === 'confirm' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {finalChanges.map((field) => (
                  <div key={field.key} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <p className="text-[14px] text-gray-700 leading-relaxed">
                      {field.label} будет изменён с <span className="font-bold text-gray-900 underline decoration-gray-300">«{field.oldValue}»</span> на <span className="font-bold text-blue-600">«{field.newValue}»</span>.
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 border-t pt-6">
                <button onClick={() => setStep('edit')} className="px-6 py-2.5 font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">Отменить</button>
                <button onClick={handleConfirmUpdate} disabled={loading} className="bg-[#1677FF] text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-100">
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Изменить
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 3: УСПЕХ (Используем те же finalChanges) */}
          {step === 'success' && (
            <div className="flex flex-col gap-6 animate-in zoom-in-95 duration-300">
              <div className="space-y-5">
                {finalChanges.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-[#52C41A]">
                      <CheckCircle2 size={22} />
                      <span className="text-[16px] font-bold text-gray-800">{field.label} успешно изменён.</span>
                    </div>
                    <p className="text-sm text-gray-500 pl-9">
                      Новое значение: <span className="font-bold text-gray-800">{field.newValue}</span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="w-full flex justify-end mt-4 border-t pt-6">
                 <button onClick={closeAndReset} className="bg-[#1677FF] text-white px-12 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">Ок</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};