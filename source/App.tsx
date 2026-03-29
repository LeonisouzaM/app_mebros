import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/store';
import ToastContainer from './components/ToastContainer';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Layouts - keep synchronously loaded for faster main paint
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages - Lazy Loaded to reduce main bundle size drastically
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/student/Home'));
const Feed = lazy(() => import('./pages/student/Feed'));
const Community = lazy(() => import('./pages/student/Community'));
const Profile = lazy(() => import('./pages/student/Profile'));
const ClassView = lazy(() => import('./pages/student/ClassView'));

const ContentUpload = lazy(() => import('./pages/admin/ContentUpload'));
const FeedManagement = lazy(() => import('./pages/admin/FeedManagement'));
const CommunityManagement = lazy(() => import('./pages/admin/CommunityManagement'));
const StudentManagement = lazy(() => import('./pages/admin/StudentManagement'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));

// Optional fallback loader
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

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
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={currentUser.role === 'admin' ? '/admin' : '/'} replace />} />

          {/* Student Routes */}
          <Route path="/" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="feed" element={<Feed />} />
            <Route path="community" element={<Community />} />
            <Route path="profile" element={<Profile />} />
            <Route path="class/:id" element={<ClassView />} />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
