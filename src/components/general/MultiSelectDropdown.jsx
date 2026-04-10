import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Check, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export const MultiSelectDropdown = ({ options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (val) => {
    const next = selectedValues.includes(val) 
      ? selectedValues.filter(v => v !== val) 
      : [...selectedValues, val];
    onChange(next);
  };

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-pointer flex justify-between items-center"
      >
        <span className="truncate text-gray-700">
          {selectedValues.length > 0 ? `Выбрано: ${selectedValues.length}` : 'Все'}
        </span>
        <ChevronDown size={14} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-100 shadow-xl rounded-lg z-[80] max-h-48 overflow-y-auto p-1">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer text-xs">
              <input 
                type="checkbox" 
                checked={selectedValues.includes(opt.value)} 
                onChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const MultiSelect = ({ label, options, selectedIds, onToggle, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItems = options.filter(opt => selectedIds.includes(opt.id));

  return (
    <div className="flex flex-col gap-1.5 relative font-sans" ref={containerRef}>
      <label className="text-[14px] font-bold text-gray-700">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[48px] bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2 flex flex-wrap gap-2 cursor-pointer items-center pr-10 transition-all focus-within:border-blue-500"
      >
        {selectedItems.length > 0 ? (
          selectedItems.map(item => (
            <span key={item.id} className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-blue-100">
              {item.first_name} {item.last_name}
              <X size={12} onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className="hover:text-red-500" />
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}
        <ChevronDown size={18} className="absolute right-3 top-[38px] text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl z-[70] mt-1 max-h-48 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map(opt => (
            <div 
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer text-sm transition-colors"
            >
              <span className="text-gray-700">{opt.first_name} {opt.last_name}</span>
              {selectedIds.includes(opt.id) && <Check size={16} className="text-blue-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};