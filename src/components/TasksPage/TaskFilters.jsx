import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, LayoutGrid, List, Plus, ChevronDown } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { MultiSelectDropdown } from '../general/MultiSelectDropdown';

export const TaskFilters = ({ 
  users, 
  tags, 
  filters, 
  onSearchChange, 
  onApply, 
  onAddClick, 
  pageSize, 
  onPageSizeChange 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [localBuffer, setLocalBuffer] = useState({
    assignee: filters.assignee || '',
    tag_ids: filters.tags ? filters.tags.split(',') : [],
    deadline_from: filters.deadline_from || '',
    deadline_to: filters.deadline_to || ''
  });

  useEffect(() => {
    setLocalBuffer({
      assignee: filters.assignee || '',
      tag_ids: filters.tags ? filters.tags.split(',') : [],
      deadline_from: filters.deadline_from || '',
      deadline_to: filters.deadline_to || ''
    });
  }, [filters]);

  const isListView = location.pathname === '/tasks' || location.pathname === '/';
  const isKanbanView = location.pathname === '/kanban';

  const handleApplyClick = () => {
    onApply({
      assignee: localBuffer.assignee,
      tags: localBuffer.tag_ids.join(','),
      deadline_from: localBuffer.deadline_from,
      deadline_to: localBuffer.deadline_to
    });
  };

  const handleResetClick = () => {
    const empty = { assignee: '', tag_ids: [], deadline_from: '', deadline_to: '' };
    setLocalBuffer(empty);
    onApply({ ...empty, tags: '', search: '' });
    onSearchChange('');
  };

  return (
    <div className="p-6 pb-0 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">Все заявки</h3>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
            <button onClick={() => navigate('/tasks')} className={`p-1.5 rounded-md transition-all ${isListView ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><List size={18} /></button>
            <button onClick={() => navigate('/kanban')} className={`p-1.5 rounded-md transition-all ${isKanbanView ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><LayoutGrid size={18} /></button>
          </div>
          <button onClick={onAddClick} className="bg-[#1677FF] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-blue-600 shadow-sm transition-all"><Plus size={20}/> Добавить</button>
        </div>
      </div>

      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div className="w-[180px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Исполнитель</label>
          <select 
            value={localBuffer.assignee}
            onChange={(e) => setLocalBuffer({...localBuffer, assignee: e.target.value})}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-gray-700"
          >
            <option value="">Все</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
          </select>
        </div>

        <div className="w-[180px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Тэг</label>
          <MultiSelectDropdown 
            options={tags.map(t => ({ label: t.name, value: String(t.id) }))}
            selectedValues={localBuffer.tag_ids}
            onChange={(vals) => setLocalBuffer({...localBuffer, tag_ids: vals})}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">Дата с</label>
          <input 
            type="date" 
            value={localBuffer.deadline_from}
            onChange={(e) => setLocalBuffer({...localBuffer, deadline_from: e.target.value})}
            className={`bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 w-[160px] ${!localBuffer.deadline_from ? 'text-gray-400' : 'text-gray-700 font-medium'}`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">Дата по</label>
          <input 
            type="date" 
            value={localBuffer.deadline_to}
            onChange={(e) => setLocalBuffer({...localBuffer, deadline_to: e.target.value})}
            className={`bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 w-[160px] ${!localBuffer.deadline_to ? 'text-gray-400' : 'text-gray-700 font-medium'}`}
          />
        </div>

        <div className="flex gap-2 ml-2">
          <button onClick={handleApplyClick} className="px-5 py-2 bg-[#F5F5F5] border border-gray-200 text-gray-400 hover:bg-blue-500 hover:text-white rounded-lg text-sm transition-all">Применить</button>
          <button onClick={handleResetClick} className="px-5 py-2 bg-[#F5F5F5] border border-gray-200 text-gray-400 hover:bg-gray-50 rounded-lg text-sm transition-all">Сбросить</button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск" 
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">Строк</span>
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 outline-none cursor-pointer"><option value={8}>8</option><option value={10}>10</option><option value={20}>20</option></select>
        </div>
      </div>
    </div>
  );
};