import { Sidebar } from '../general/Sidebar';
import { Header } from '../general/Header';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="ml-[250px] flex flex-col">
        <Header />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};