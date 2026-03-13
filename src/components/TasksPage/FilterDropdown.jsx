import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const FilterDropdown = ({ label, currentValue, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === currentValue)?.label || 'Все';

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 py-2 bg-white border rounded-lg cursor-pointer transition-all ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={`text-sm truncate ${currentValue === '' ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
          {selectedLabel}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1">
          <div 
            onClick={() => { onSelect(''); setIsOpen(false); }}
            className="px-4 py-2 text-sm text-gray-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
          >
            Все
          </div>
          
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => { onSelect(opt.value); setIsOpen(false); }}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                currentValue === opt.value ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};