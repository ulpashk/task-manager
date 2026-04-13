import { useTranslation } from 'react-i18next';
import { Search, Plus, ChevronDown } from 'lucide-react';

export const TagFilters = ({ onSearch, onAddClick, ordering, onSortChange }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t('tags.all_tags')}</h3>
        <button
          onClick={onAddClick}
          className="bg-[#1677FF] text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-600 transition-colors shadow-sm">
          <Plus size={18}/> {t('tags.add')}
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('common.search')}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{t('common.sort')}</span>
          <div className="relative min-w-[180px]">
            <select
              value={ordering}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 outline-none cursor-pointer pr-10"
            >
              <option value="name">{t('common.sort_alpha')}</option>
              <option value="-id">{t('common.sort_newest')}</option>
              <option value="id">{t('common.sort_oldest')}</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
