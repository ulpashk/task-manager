import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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