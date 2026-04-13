import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchTasksApi } from '../services/taskService';
import { TaskFilters } from '../components/TasksPage/TaskFilters';
import { TaskTable } from '../components/TasksPage/TaskTable';
import { Pagination } from '../components/general/Pagination';
import { fetchUsersListApi } from '../services/userService';
import { fetchTagsListApi } from '../services/tagService';

export const ArchivePage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    assignee: '',
    tags: '',
    deadline_from: '',
    deadline_to: '',
    status: 'archived'
  });

  useEffect(() => {
    fetchUsersListApi().then(setUsers).catch(console.error);
    fetchTagsListApi().then(setTags).catch(console.error);
  }, []);

  const loadArchiveTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTasksApi({ 
        page: currentPage, 
        page_size: pageSize,
        ...filters
      });
      setData(res);
    } catch (err) {
      console.error("Error loading archive:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    loadArchiveTasks();
  }, [loadArchiveTasks]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <TaskFilters 
        users={users}
        tags={tags}
        filters={filters}
        pageSize={pageSize}
        onSearchChange={handleSearchChange}
        onApply={handleApplyFilters}
        onPageSizeChange={handlePageSizeChange}
        onAddClick={() => {}}
      />
      
      <div className="flex-1 overflow-hidden mt-4">
        {loading ? (
          <div className="p-10 text-center text-gray-400">{t('common.loading')}</div>
        ) : (
          <TaskTable tasks={data.results} />
        )}
      </div>

      <Pagination 
        totalCount={data.count} 
        pageSize={pageSize} 
        currentPage={currentPage} 
        onPageChange={(page) => setCurrentPage(page)} 
      />
    </div>
  );
};