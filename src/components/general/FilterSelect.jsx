import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const FilterSelect = ({ label, options, value, onChange, isMulti = false, placeholder = "Все" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (id) => {
    if (isMulti) {
      const newValue = value.includes(id) ? value.filter(i => i !== id) : [...value, id];
      onChange(newValue);
    } else {
      onChange(id);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (isMulti) return value.length > 0 ? `Выбрано: ${value.length}` : placeholder;
    const selected = options.find(o => String(o.id) === String(value));
    return selected ? (selected.name || selected.title) : placeholder;
  };

  return (
    <div className="flex flex-col gap-1 relative font-sans" ref={containerRef}>
      <label className="text-[12px] font-medium text-gray-500">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-[40px] px-3 flex items-center justify-between border rounded-lg cursor-pointer bg-white transition-all ${isOpen ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <span className={`text-sm truncate ${((isMulti && value.length === 0) || (!isMulti && !value)) ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
          {getDisplayText()}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl z-[100] mt-1 max-h-60 overflow-y-auto p-1 custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
          {!isMulti && <div onClick={() => handleSelect('')} className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 rounded-lg cursor-pointer">Все</div>}
          {options.map(opt => (
            <div key={opt.id} onClick={() => handleSelect(opt.id)} className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer text-sm group">
              <div className="flex items-center gap-2">
                {isMulti && <input type="checkbox" checked={value.includes(opt.id)} readOnly className="rounded border-gray-300 text-blue-600" />}
                <span className={((isMulti && value.includes(opt.id)) || (!isMulti && value === opt.id)) ? 'text-blue-600 font-bold' : 'text-gray-700'}>
                  {opt.name || opt.title}
                </span>
              </div>
              {(!isMulti && String(value) === String(opt.id)) && <Check size={14} className="text-blue-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};