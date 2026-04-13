import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchTagsApi, deleteTagApi } from '../services/tagService';
import { TagTable } from '../components/Tags/TagTable';
import { TagFilters } from '../components/Tags/TagFilters';
import { Pagination } from '../components/general/Pagination';
import { AddTagModal } from '../components/Tags/AddTagModal';
import { EditTagModal } from '../components/Tags/EditTagModal';
import { Modal } from '../components/general/Modal';

export const TagsPage = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [ordering, setOrdering] = useState('name');
  const pageSize = 9;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  const loadTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTagsApi({
        page: currentPage,
        page_size: pageSize,
        search: searchTerm,
        ordering: ordering
      });
      setData(res);
    } catch (err) {
      console.error("Tag loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, ordering]);

  useEffect(() => { loadTags(); }, [loadTags]);

  const confirmDelete = async () => {
    try {
      await deleteTagApi(selectedTag.id);
      setIsDeleteOpen(false);
      loadTags();
    } catch (err) { alert(t('tags.delete_error')); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden font-sans">
      <TagFilters
        onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        onAddClick={() => setIsAddOpen(true)}
        ordering={ordering}
        onSortChange={(val) => { setOrdering(val); setCurrentPage(1); }}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-10 text-center text-gray-400">{t('tags.loading')}</div>
        ) : (
          <TagTable
            tags={data.results}
            onEdit={(tag) => { setSelectedTag(tag); setIsEditOpen(true); }}
            onDelete={(tag) => { setSelectedTag(tag); setIsDeleteOpen(true); }}
          />
        )}
      </div>

      <Pagination
        totalCount={data.count}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <AddTagModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onRefresh={loadTags}
      />

      {selectedTag && (
        <EditTagModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          tag={selectedTag}
          onRefresh={loadTags}
        />
      )}

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title={t('tags.delete_title')}>
        <div className="p-4 flex flex-col gap-6">
          <p className="text-gray-600">{t('tags.delete_confirm')} <b>{selectedTag?.name}</b>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsDeleteOpen(false)} className="px-6 py-2 font-bold text-gray-400">{t('common.cancel')}</button>
            <button onClick={confirmDelete} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">{t('common.delete')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
