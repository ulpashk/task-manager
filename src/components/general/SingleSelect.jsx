import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';

export const SingleSelect = ({ label, options, selectedId, onSelect, placeholder, disabled = false, isLoading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = options.find(opt => String(opt.id) === String(selectedId));

  const handlePick = (id) => {
    if (disabled) return;
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 relative font-sans" ref={containerRef}>
      {label && <label className="text-[13px] font-bold text-gray-700">{label}</label>}
      
      <div 
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        className={`min-h-[44px] rounded-lg px-4 flex items-center justify-between transition-all ${
          disabled 
            ? 'bg-gray-100 border-gray-100 cursor-not-allowed opacity-70' 
            : 'bg-[#F9FAFB] border border-gray-200 cursor-pointer hover:border-gray-300'
        } ${isOpen ? 'border-blue-500 ring-2 ring-blue-50' : ''}`}
      >
        <span className={`text-sm truncate ${!selectedItem ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
          {isLoading ? 'Загрузка...' : selectedItem 
            ? (selectedItem.title || selectedItem.name) 
            : placeholder}
        </span>
        
        {isLoading ? (
          <Loader2 size={18} className="text-blue-500 animate-spin" />
        ) : (
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl z-[100] mt-1 max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
          <div 
            onClick={() => handlePick('')}
            className="px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 rounded-lg cursor-pointer"
          >
            (Не указано)
          </div>

          {options.map(opt => {
            const isSelected = String(opt.id) === String(selectedId);
            return (
              <div 
                key={opt.id}
                onClick={() => handlePick(opt.id)}
                className={`flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 rounded-lg cursor-pointer text-sm transition-colors ${
                  isSelected ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700'
                }`}
              >
                <span>{opt.title || opt.name}</span>
                {isSelected && <Check size={16} className="text-blue-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};