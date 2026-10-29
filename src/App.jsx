import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { lazy, Suspense } from 'react';
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Home = lazy(() => import('@/pages/Home'));
const Items = lazy(() => import('@/pages/Items'));
const ShoppingList = lazy(() => import('@/pages/ShoppingList'));
const Recipes = lazy(() => import('@/pages/Recipes'));
const Share = lazy(() => import('@/pages/Share'));
const Family = lazy(() => import('@/pages/Family'));
const Admin = lazy(() => import('@/pages/Admin'));
const SharedFamily = lazy(() => import('@/pages/SharedFamily'));
const Settings = lazy(() => import('@/pages/Settings'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Party = lazy(() => import('@/pages/Party'));
const PartyInvite = lazy(() => import('@/pages/PartyInvite'));
const Diets = lazy(() => import('@/pages/Diets'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/party-invite/:token" element={<PartyInvite />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/share" element={<Share />} />
          <Route path="/family" element={<Family />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/shared/:familyId" element={<SharedFamily />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/party" element={<Party />} />
          <Route path="/diets" element={<Diets />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App