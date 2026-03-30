import React, { useState, useRef } from 'react';
import { Modal } from '../general/Modal';
import { X, Loader2 } from 'lucide-react';
import { createTagApi } from '../../services/tagService';

export const AddTagModal = ({ isOpen, onClose, onRefresh }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [loading, setLoading] = useState(false);
  
  const colorInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTagApi({ name, color });
      onRefresh();
      handleClose();
    } catch (error) {
      alert("Ошибка при создании тэга");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setColor('#000000');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить тэг">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-sans">
        
        {/* Наименование тэга */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium text-gray-700">Наименование тэга</label>
          <input 
            required
            type="text"
            placeholder="Введите наименование"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-[48px] bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 outline-none focus:border-blue-500 transition-all text-[14px]"
          />
        </div>

        {/* Выбор цвета (Тэг) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium text-gray-700">Тэг</label>
          <div className="relative flex items-center">
            {/* Текстовое поле для HEX-кода */}
            <input 
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-[48px] bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 outline-none focus:border-blue-500 text-[14px] font-mono"
            />
            
            {/* Квадратик-превью, при клике на который открывается палитра */}
            <div 
              onClick={() => colorInputRef.current.click()}
              className="absolute right-3 w-6 h-6 rounded-md cursor-pointer border border-gray-200 shadow-sm transition-transform active:scale-90"
              style={{ backgroundColor: color }}
            />
            
            {/* Скрытый системный выбор цвета */}
            <input 
              type="color"
              ref={colorInputRef}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="invisible absolute"
            />
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex justify-end gap-3 mt-4">
          <button 
            type="button" 
            onClick={handleClose}
            className="px-8 py-2.5 border border-gray-200 rounded-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Отменить
          </button>
          <button 
            type="submit" 
            disabled={loading || !name}
            className="bg-[#1677FF] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-lg shadow-blue-100 disabled:shadow-none flex items-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  );
};