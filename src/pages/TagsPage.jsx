import { useEffect, useState } from 'react';
import { fetchTagsApi } from '../services/tagService';
import { TagTable } from '../components/Tags/TagTable';
import { TagFilters } from '../components/Tags/TagFilters';
import { Pagination } from '../components/general/Pagination';
import { AddTagModal } from '../components/Tags/AddTagModal';

export const TagsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 9;

  const loadTags = async () => {
    setLoading(true);
    try {
      const res = await fetchTagsApi({ 
        page: currentPage, 
        page_size: pageSize,
        search: searchTerm 
      });
      setData(res);
    } catch (err) {
      console.error("Ошибка загрузки тэгов:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, [currentPage, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden font-sans">
      <TagFilters 
        onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        onAddClick={() => setIsModalOpen(true)}
      />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Загрузка...</div>
        ) : (
          <TagTable tags={data.results} />
        )}
      </div>

      <Pagination 
        totalCount={data.count} 
        pageSize={pageSize} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />

      <AddTagModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={loadTags} 
      />
    </div>
  );
};