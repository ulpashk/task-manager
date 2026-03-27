import { useNavigate, useLocation } from 'react-router-dom';
import { Search, LayoutGrid, List, Plus, ChevronDown } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';

export const TaskFilters = ({ filters={}, onFilterChange, onAddClick, pageSize, onPageSizeChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isListView = location.pathname === '/tasks' || location.pathname === '/';
  const isKanbanView = location.pathname === '/kanban';
  
  const assigneeOptions = [
    { label: "Оразбай Дарига", value: "1" },
    { label: "Кемелбай Мерей", value: "2" },
  ];

  const typeOptions = [
    { label: "База данных", value: "db" },
    { label: "Интеграция", value: "int" },
    { label: "Ошибка", value: "bug" },
  ];

  const tagOptions = [
    { label: "База данных", value: "db" },
    { label: "Интеграция", value: "int" },
    { label: "Ошибка", value: "bug" },
  ];

  const companyOptions = [
    { label: "TOO Health Rising Group", value: "1" },
    { label: "KBTU", value: "2" },
    { label: "diplomka", value: "3" },
  ];

  return (
    <div className="p-6 pb-0 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">Все заявки</h3>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
            <button 
              onClick={() => navigate('/tasks')}
              className={`p-1.5 rounded-md transition-all ${
                isListView 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => navigate('/kanban')}
              className={`p-1.5 rounded-md transition-all ${
                isKanbanView 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button
            onClick={onAddClick}
            className="bg-[#1677FF] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-blue-600 transition-all shadow-sm active:scale-95">
            <Plus size={20}/> Добавить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <FilterDropdown 
          label="Исполнитель" 
          currentValue={filters.assignee} 
          options={assigneeOptions} 
          onSelect={(val) => onFilterChange('assignee', val)} 
        />
        <FilterDropdown 
          label="Инициатор" 
          currentValue={filters.initiator} 
          options={assigneeOptions}
          onSelect={(val) => onFilterChange('initiator', val)} 
        />
        <FilterDropdown 
          label="Тэг" 
          currentValue={filters.tag} 
          options={tagOptions} 
          onSelect={(val) => onFilterChange('tag', val)} 
        />
        <FilterDropdown 
          label="Компания" 
          currentValue={filters.client} 
          options={companyOptions} 
          onSelect={(val) => onFilterChange('client', val)} 
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск" 
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-2/3 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Строк</span>
          <div className="relative">
            <select 
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none pr-8"
            >
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};