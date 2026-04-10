import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../general/Modal';
import { X, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { updateTagApi } from '../../services/tagService';

const FIELD_LABELS = {
  name: 'Наименование тэга',
  color: 'Цвет тэга'
};

export const EditTagModal = ({ isOpen, onClose, tag, onRefresh }) => {
  const [step, setStep] = useState('edit'); // edit | confirm | success
  const [loading, setLoading] = useState(false);
  const [finalChanges, setFinalChanges] = useState([]);
  const colorInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#000000'
  });

  useEffect(() => {
    if (tag && isOpen) {
      setFormData({
        name: tag.name || '',
        color: tag.color || '#000000'
      });
      setStep('edit');
      setFinalChanges([]);
    }
  }, [tag, isOpen]);

  if (!isOpen || !tag) return null;

  const getChanges = () => {
    const changes = [];
    if (formData.name.trim() !== (tag.name || '').trim()) {
      changes.push({
        key: 'name',
        label: FIELD_LABELS.name,
        oldValue: tag.name || 'не указано',
        newValue: formData.name
      });
    }
    if (formData.color.toLowerCase() !== (tag.color || '').toLowerCase()) {
      changes.push({
        key: 'color',
        label: FIELD_LABELS.color,
        oldValue: tag.color || '#000000',
        newValue: formData.color,
        isColor: true
      });
    }
    return changes;
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    const changes = getChanges();
    if (changes.length > 0) {
      setFinalChanges(changes);
      setStep('confirm');
    } else {
      onClose(); 
    }
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    try {
      await updateTagApi(tag.id, formData);
      setStep('success');
      onRefresh();
    } catch (error) {
      alert("Ошибка при обновлении тэга");
      setStep('edit');
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(() => setStep('edit'), 300);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={closeAndReset} 
      title={step === 'edit' ? "Изменить тэг" : step === 'confirm' ? "Подтверждение" : "Успешно"}
    >
      <div className="font-sans">
        
        {step === 'edit' && (
          <form onSubmit={handleSaveClick} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-gray-700">Наименование тэга</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-[48px] bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 outline-none focus:border-blue-500 transition-all text-[14px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-gray-700">Цвет</label>
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={formData.color.toUpperCase()}
                  readOnly
                  className="w-full h-[48px] bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 outline-none text-[14px] font-mono"
                />
                <div 
                  onClick={() => colorInputRef.current.click()}
                  className="absolute right-3 w-6 h-6 rounded-md cursor-pointer border border-gray-200 shadow-sm"
                  style={{ backgroundColor: formData.color }}
                />
                <input 
                  type="color"
                  ref={colorInputRef}
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="invisible absolute"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={onClose} className="px-8 py-2.5 font-bold text-gray-400">Отменить</button>
              <button 
                type="submit" 
                disabled={getChanges().length === 0}
                className="bg-[#1677FF] text-white px-10 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-100 disabled:bg-gray-100 disabled:text-gray-300"
              >
                Сохранить
              </button>
            </div>
          </form>
        )}

        {step === 'confirm' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="space-y-3">
              {finalChanges.map(field => (
                <div key={field.key} className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col gap-1">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{field.label}</span>
                  <div className="flex items-center gap-2 text-sm">
                    {field.isColor ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: field.oldValue }} />
                          <span className="text-gray-400 line-through">{field.oldValue}</span>
                        </div>
                        <span className="text-blue-600 font-bold">→</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-sm border shadow-sm" style={{ backgroundColor: field.newValue }} />
                          <span className="text-blue-600 font-bold">{field.newValue}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-700">
                        «{field.oldValue}» <span className="mx-2 text-blue-600 font-bold">→</span> «{field.newValue}»
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t pt-6">
              <button onClick={() => setStep('edit')} className="px-6 py-2.5 font-bold text-gray-400">Назад</button>
              <button 
                onClick={handleConfirmUpdate} 
                disabled={loading}
                className="bg-[#1677FF] text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
              >
                {loading && <Loader2 size={16} className="animate-spin" />} Изменить
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center py-6 gap-4 animate-in zoom-in-95 duration-300">
            <CheckCircle2 size={56} className="text-[#52C41A]" />
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800">Тэг обновлен</h3>
              <p className="text-sm text-gray-400 mt-1">Изменения успешно применены</p>
            </div>
            <button 
              onClick={closeAndReset} 
              className="bg-[#1677FF] text-white px-12 py-2.5 rounded-lg font-bold mt-4 shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all"
            >
              Ок
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};