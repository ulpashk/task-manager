import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Главная Страница</h1>
      <p className="text-gray-500">Вы успешно авторизованы.</p>
      <button 
        onClick={logout}
        className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Выйти
      </button>
    </div>
  );
};