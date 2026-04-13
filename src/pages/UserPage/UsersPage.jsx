import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchUsersApi, deleteUserApi } from '../../services/userService';
import { UserTable } from '../../components/Users/UserTable';
import { UserFilters } from '../../components/Users/UserFilters';
import { Pagination } from '../../components/general/Pagination';
import { AddUserModal } from '../../components/Users/AddUserModal';
import { EditUserModal } from '../../components/Users/EditUserModal';
import { Modal } from '../../components/general/Modal';

export const UsersPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [ordering, setOrdering] = useState('');
  const pageSize = 9;

  // Состояния модалок
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUsersApi({ 
        page: currentPage, 
        page_size: pageSize,
        search: searchTerm,
        ordering: ordering
      });
      setData({ results: res?.results || [], count: res?.count || 0 });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, ordering]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSort = (field) => {
    setOrdering(prev => prev === field ? `-${field}` : field);
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    try {
      await deleteUserApi(selectedUser.id);
      setIsDeleteOpen(false);
      loadUsers();
    } catch (e) { alert(t('users.delete_error')); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden font-sans">
      <UserFilters 
        onSearch={(v) => { setSearchTerm(v); setCurrentPage(1); }} 
        onAddClick={() => setIsAddOpen(true)}
        onSortChange={(val) => { setOrdering(val); setCurrentPage(1); }}
        ordering={ordering}
      />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-10 text-center text-gray-400">{t('users.loading')}</div>
        ) : (
          <UserTable 
            users={data.results} 
            onSort={handleSort}
            currentOrdering={ordering}
            onEdit={(u) => { setSelectedUser(u); setIsEditOpen(true); }}
            onDelete={(u) => { setSelectedUser(u); setIsDeleteOpen(true); }}
          />
        )}
      </div>

      <Pagination totalCount={data.count} pageSize={pageSize} currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* МОДАЛКИ */}
      <AddUserModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onRefresh={loadUsers} />
      {selectedUser && (
        <EditUserModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} user={selectedUser} onRefresh={loadUsers} />
      )}
      
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title={t('users.delete_title')}>
        <div className="p-4 flex flex-col gap-6">
          <p className="text-gray-600">{t('users.delete_confirm')} <b>{selectedUser?.first_name} {selectedUser?.last_name}</b>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsDeleteOpen(false)} className="px-6 py-2 font-bold text-gray-400">{t('common.cancel')}</button>
            <button onClick={confirmDelete} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">{t('common.delete')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};