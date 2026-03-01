import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/store';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Login from './pages/Login';
import Home from './pages/student/Home';
import Feed from './pages/student/Feed';
import Community from './pages/student/Community';
import Profile from './pages/student/Profile';

import ContentUpload from './pages/admin/ContentUpload';
import FeedManagement from './pages/admin/FeedManagement';
import CommunityManagement from './pages/admin/CommunityManagement';
import StudentManagement from './pages/admin/StudentManagement';
import ProductManagement from './pages/admin/ProductManagement';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role: 'student' | 'admin' }) => {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/'} replace />;
  }

  return <>{children}</>;
};

function App() {
  const currentUser = useStore((state) => state.currentUser);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={currentUser.role === 'admin' ? '/admin' : '/'} replace />} />

        {/* Student Routes */}
        <Route path="/" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="feed" element={<Feed />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/content" replace />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="content" element={<ContentUpload />} />
          <Route path="feed" element={<FeedManagement />} />
          <Route path="community" element={<CommunityManagement />} />
          <Route path="students" element={<StudentManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
