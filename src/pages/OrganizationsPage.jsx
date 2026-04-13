import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchOrganizationsApi, createOrganizationApi } from '../services/organizationService';
import { OrganizationTable } from '../components/Organizations/OrganizationTable';
import { Modal } from '../components/general/Modal';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';

export const OrganizationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState({ results: [] });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadOrgs = () => {
    setLoading(true);
    fetchOrganizationsApi()
      .then(res => {
        setData(res);
        setErrorMessage(null);
      })
      .catch(err => {
        if (err.response?.status === 403 || err.status === 403) {
          setErrorMessage(t('orgs.no_access'));
        } else {
          setErrorMessage(t('orgs.load_error'));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrgs(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createOrganizationApi({ name: newOrgName });
      setShowCreateModal(false);
      setNewOrgName('');
      loadOrgs();
    } catch (err) {
      alert(err.response?.data?.detail || t('orgs.create_error'));
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">{t('orgs.loading')}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('orgs.title')}</h2>
        {!errorMessage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all"
          >
            <Plus size={20}/> {t('orgs.new')}
          </button>
        )}
      </div>

      {errorMessage ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} />
          <p className="font-medium">{errorMessage}</p>
        </div>
      ) : (
        <OrganizationTable orgs={data.results} onRowClick={(org) => navigate(`/organizations/${org.id}`)} />
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('orgs.new')}>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">{t('orgs.name')}</label>
            <input
              required
              className="bg-gray-50 border p-2.5 rounded-lg outline-none focus:border-blue-500"
              value={newOrgName}
              onChange={e => setNewOrgName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-2 font-bold text-gray-400">{t('common.cancel')}</button>
            <button type="submit" disabled={creating} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">
              {creating && <Loader2 size={16} className="animate-spin" />} {t('common.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
