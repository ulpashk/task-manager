import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { PublicRoute } from './components/routes/PublicRoute';
import { MainLayout } from './components/general/MainLayout';
import { LoginPage } from './pages/LoginPage';

// The Central Config
import { NAVIGATION_ITEMS } from './config/navigation';

// A single wrapper that checks roles based on the config item
const RoleGuard = ({ item, children }) => {
  const { user } = useAuth();
  if (!item.allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 1. Public Login */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* 2. Protected Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              
              {/* WE LOOP THROUGH THE CONFIG HERE */}
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

            </Route>
          </Route>

          {/* 3. Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;