import { useEffect, useState } from 'react';
import { fetchOrganizationsApi } from '../services/organizationService';
import { OrganizationTable } from '../components/Organizations/OrganizationTable';
import { Plus, AlertCircle } from 'lucide-react';

export const OrganizationsPage = () => {
  const [data, setData] = useState({ results: [] });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchOrganizationsApi()
      .then(res => {
        setData(res);
        setErrorMessage(null);
      })
      .catch(err => {
        if (err.response?.status === 403 || err.status === 403) {
          setErrorMessage("Доступ запрещен. У вас недостаточно прав для просмотра организаций.");
        } else {
          setErrorMessage("Произошла ошибка при загрузке данных.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Загрузка компаний...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Компании</h2>
        {!errorMessage && (
            <button className="bg-[#3F51B5] hover:bg-[#303F9F] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                <Plus size={20}/> Новая компания
            </button>
        )}
      </div>

      {errorMessage ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} />
          <p className="font-medium">{errorMessage}</p>
        </div>
      ) : (
        <OrganizationTable orgs={data.results} />
      )}
    </div>
  );
};