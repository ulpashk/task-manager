import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { PublicRoute } from './components/routes/PublicRoute';
import { HomeRedirect } from './components/routes/HomeRedirect';
import { MainLayout } from './components/general/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { NAVIGATION_ITEMS } from './config/navigation';
import { ClientDetailPage } from './pages/ClientPage/ClientDetailPage';

const RoleGuard = ({ item, children }) => {
  const { user } = useAuth();
  if (!item.allowedRoles.includes(user?.role)) {
    return <HomeRedirect />; 
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomeRedirect />} />
              {NAVIGATION_ITEMS.map((item) => (
                <Route 
                  key={item.path}
                  path={item.path} 
                  element={
                    <RoleGuard item={item}>
                      <item.component />
                    </RoleGuard>
                  } 
                />
              ))}
              <Route 
                path="/clients/:id" 
                element={
                  <RoleGuard item={NAVIGATION_ITEMS.find(i => i.path === '/clients')}>
                    <ClientDetailPage />
                  </RoleGuard>
                } 
              />
            </Route>
            </Route>

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;