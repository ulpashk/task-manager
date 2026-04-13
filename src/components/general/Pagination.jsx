import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Pagination = ({ totalCount = 0, pageSize = 9, currentPage = 1, onPageChange }) => {
  const { t } = useTranslation();

  const count = Number(totalCount) || 0;
  const size = Number(pageSize) || 9;
  const page = Number(currentPage) || 1;

  const totalPages = Math.ceil(count / size);

  const from = count === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, count);

  if (count === 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
      <p className="text-sm text-gray-400">
        {t('common.shown_records')} <span className="text-gray-800 font-medium">{from}-{to}</span> {t('common.of')} {count}
      </p>

      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={18}/>
        </button>

        {pages.map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors border ${
              page === pageNum
                ? 'bg-[#1677FF] text-white border-[#1677FF]'
                : 'text-gray-600 hover:bg-gray-50 border-gray-200'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );
};
