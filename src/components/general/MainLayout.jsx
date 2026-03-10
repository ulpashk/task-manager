import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        {/* h-[calc(100vh-70px)] ensures the content area takes exactly the remaining height */}
        <main className="flex-1 p-8 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};