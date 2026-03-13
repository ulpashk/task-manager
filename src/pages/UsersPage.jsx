import { useEffect, useState } from 'react';
import { fetchUsersApi } from '../services/userService';
import { UserTable } from '../components/Users/UserTable';
import { UserFilters } from '../components/Users/UserFilters';
import { Pagination } from '../components/general/Pagination';

export const UsersPage = () => {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchUsersApi({ 
        page: currentPage, 
        page_size: pageSize,
        search: searchTerm 
      });
      setData({
        results: res?.results || [],
        count: res?.count || 0
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  const handleSearch = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <UserFilters onSearch={handleSearch} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-10 text-center text-gray-400 font-sans">Загрузка...</div>
        ) : (
          <UserTable users={data.results} />
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