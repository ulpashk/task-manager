import { useTranslation } from 'react-i18next';
import { Search, Plus, ChevronDown } from 'lucide-react';

export const ProjectFilters = ({ searchTerm, onSearch, pageSize, onPageSizeChange, onAddClick }) => {
  const { t } = useTranslation();
  return (
    <div className="p-6 pb-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">{t('projects.all_projects')}</h3>
        <button 
          onClick={onAddClick}
          className="bg-[#1677FF] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
        >
          <Plus size={18}/> {t('projects.add_project')}
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('common.rows')}</span>
          <div className="relative">
            <select 
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 outline-none pr-10 cursor-pointer"
            >
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};