import { Calendar as CalendarIcon } from 'lucide-react';

export const DateSelect = ({ label, value, onChange, placeholder = "ДД.ММ.ГГГГ" }) => {
  return (
    <div className="flex flex-col gap-1.5 relative font-sans">
      <label className="text-[13px] font-bold text-gray-700">{label}</label>
      <div className="relative group">
        <input 
          type="datetime-local" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-[48px] bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 pr-10 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm ${!value ? 'text-gray-300' : 'text-gray-700'}`}
        />
        <CalendarIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-blue-500" />
      </div>
    </div>
  );
};