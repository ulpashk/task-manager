import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export const FormSelect = ({ label, options, value, onChange, isMulti = false, placeholder = "Выберите...", required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = (id) => {
    if (isMulti) {
      const newValue = value.includes(id) ? value.filter(i => i !== id) : [...value, id];
      onChange(newValue);
    } else {
      onChange(id);
      setIsOpen(false);
    }
  };

  const selectedObjects = isMulti ? options.filter(o => value.includes(o.id)) : null;
  const selectedSingle = !isMulti ? options.find(o => String(o.id) === String(value)) : null;

  return (
    <div className="flex flex-col gap-1.5 relative font-sans" ref={containerRef}>
      <label className="text-[13px] font-bold text-gray-700">{label} {required && '*'}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[48px] bg-[#F9FAFB] border rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center pr-10 cursor-pointer transition-all ${isOpen ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
      >
        {isMulti ? (
          selectedObjects.length > 0 ? selectedObjects.map(obj => (
            <span key={obj.id} className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1 animate-in zoom-in-95">
              {obj.name || obj.title}
              <X size={12} onClick={(e) => { e.stopPropagation(); handleToggle(obj.id); }} className="hover:text-red-500" />
            </span>
          )) : <span className="text-gray-400 text-sm">{placeholder}</span>
        ) : (
          <span className={`text-sm ${!selectedSingle ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>
            {selectedSingle ? (selectedSingle.name || selectedSingle.title) : placeholder}
          </span>
        )}
        <ChevronDown size={18} className={`absolute right-3 top-[38px] text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl z-[110] mt-2 max-h-64 overflow-y-auto p-1 custom-scrollbar">
          {!isMulti && <div onClick={() => handleToggle('')} className="px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 rounded-xl cursor-pointer">(Не указано)</div>}
          {options.map(opt => {
            const active = isMulti ? value.includes(opt.id) : String(value) === String(opt.id);
            return (
              <div key={opt.id} onClick={() => handleToggle(opt.id)} className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer text-sm transition-all ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                <span>{opt.name || opt.title}</span>
                {active && <Check size={16} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};