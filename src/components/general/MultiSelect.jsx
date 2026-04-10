import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export const MultiSelect = ({ 
  label, 
  options, 
  selectedIds = [], 
  onToggle, 
  placeholder = "Выберите...",
  variant = 'form', 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getOptionLabel = (opt) => opt.name || `${opt.first_name} ${opt.last_name}`;

  const selectedItems = options.filter(opt => 
    selectedIds.map(String).includes(String(opt.id))
  );

  return (
    <div className="flex flex-col gap-1.5 relative font-sans" ref={containerRef}>
      {/* Заголовок (только для режима формы) */}
      {variant === 'form' && label && (
        <label className="text-[13px] font-bold text-gray-700">{label}</label>
      )}

      {/* Основное поле выбора */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[44px] border rounded-lg px-3 py-2 flex flex-wrap gap-2 cursor-pointer items-center pr-10 transition-all ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 hover:border-gray-300'
        } ${variant === 'form' ? 'bg-[#F9FAFB]' : 'bg-white'}`}
      >
        {selectedItems.length > 0 ? (
          variant === 'form' ? (
            // Режим FORM: показываем "чипсы"
            selectedItems.map(item => (
              <span key={item.id} className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-blue-100 animate-in zoom-in-95">
                {getOptionLabel(item)}
                <X size={12} onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className="hover:text-red-500" />
              </span>
            ))
          ) : (
            // Режим FILTER: показываем краткий текст
            <span className="text-sm font-bold text-gray-700">
              Выбрано: {selectedItems.length}
            </span>
          )
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}
        
        <ChevronDown 
          size={18} 
          className={`absolute right-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} ${variant === 'form' ? 'top-[36px]' : 'top-1/2 -translate-y-1/2'}`} 
        />
      </div>

      {/* Выпадающий список */}
      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl z-[100] mt-1 max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100 custom-scrollbar">
          {options.length > 0 ? (
            options.map(opt => {
              const isSelected = selectedIds.map(String).includes(String(opt.id));
              return (
                <div 
                  key={opt.id}
                  onClick={() => onToggle(opt.id)}
                  className={`flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 rounded-lg cursor-pointer text-sm transition-colors ${
                    isSelected ? 'bg-blue-50/50 text-blue-600 font-bold' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={isSelected} readOnly className="rounded border-gray-300 text-blue-600" />
                    <span>{getOptionLabel(opt)}</span>
                  </div>
                  {isSelected && <Check size={16} className="text-blue-600" />}
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-400 text-xs italic">Нет доступных данных</div>
          )}
        </div>
      )}
    </div>
  );
};