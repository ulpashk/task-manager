import { ChevronDown, Search, LayoutGrid, List, Plus } from 'lucide-react';

export const TaskFilters = () => {
  const dropdowns = ["Исполнитель", "Инициатор", "Тип", "Компания"];

  return (
    <div className="p-6 pb-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Все заявки</h3>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg p-1 bg-gray-50">
            <button className="p-1.5 bg-white shadow-sm rounded-md"><List size={18} className="text-gray-600"/></button>
            <button className="p-1.5 text-gray-400"><LayoutGrid size={18}/></button>
          </div>
          <button className="bg-[#1677FF] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
            <Plus size={20}/> Добавить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {dropdowns.map(label => (
          <div key={label} className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{label}</label>
            <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-300">Все</span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск" 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Сортировать</span>
          <div className="flex items-center gap-4 px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer min-w-[140px]">
            <span className="text-sm font-medium flex-1 text-gray-700">По компании</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};