import { useTranslation } from 'react-i18next';
import { Search, Plus, ChevronDown } from 'lucide-react';

export const UserFilters = ({
  onSearch, 
  onAddClick, 
  onSortChange, 
  ordering 
}) => {
  
  const { t } = useTranslation();

  const sortOptions = [
    { label: t('common.sort_alpha'), value: 'last_name' },
    { label: t('users.sort_by_name'), value: 'first_name' },
    { label: t('users.sort_by_last'), value: 'last_name' },
    { label: t('common.sort_newest'), value: '-date_joined' },
    { label: t('common.sort_oldest'), value: 'date_joined' },
    { label: t('users.sort_by_role'), value: 'role' },
  ];

  return (
    <div className="p-6 pb-0 font-sans">
      {/* Верхний ряд: Заголовок и кнопка добавления */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t('users.all_users')}</h3>
        <button 
          onClick={onAddClick} // Вызов функции открытия модалки
          className="bg-[#1677FF] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-600 transition-all shadow-md active:scale-95"
        >
          <Plus size={20}/> {t('users.add')}
        </button>
      </div>

      {/* Нижний ряд: Поиск и Сортировка */}
      <div className="flex items-center justify-between gap-4 pb-6">
        {/* Поисковая строка */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={t('common.search')}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-[#F9FAFB] transition-all"
          />
        </div>

        {/* Выпадающий список сортировки */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 whitespace-nowrap">{t('common.sort')}</span>
          <div className="relative min-w-[200px]">
            <select 
              value={ordering} 
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none cursor-pointer pr-10 focus:border-blue-400 transition-all"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};