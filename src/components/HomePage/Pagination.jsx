import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ count }) => {
  return (
    <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-white">
      <p className="text-sm text-gray-400">Показаны записи <span className="text-gray-800 font-medium">1-9</span> из {count}</p>
      <div className="flex items-center gap-1">
        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md"><ChevronLeft size={18}/></button>
        <button className="w-8 h-8 bg-gray-400 text-white rounded-md text-sm font-medium">1</button>
        <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium border border-gray-100">2</button>
        <span className="px-2 text-gray-400">...</span>
        <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium border border-gray-100">5</button>
        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md"><ChevronRight size={18}/></button>
      </div>
    </div>
  );
};