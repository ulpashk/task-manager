import { Search, Plus, ChevronDown } from 'lucide-react';

export const UserFilters = ({ onSearch }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Все пользователи</h3>
        <button className="bg-[#1677FF] text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-600 transition-colors">
          <Plus size={18}/> Добавить
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск" 
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Сортировать</span>
          <div className="flex items-center gap-4 px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer min-w-[150px]">
            <span className="text-sm font-medium text-gray-700">По алфавиту</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};