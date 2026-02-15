import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChildAuthProvider, useChildAuth } from './contexts/ChildAuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FamilyProvider, useFamily } from './contexts/FamilyContext';
import { AuthScreen } from './components/auth';
import { NoFamilyScreen } from './components/family';
import { ShoppingList } from './components/shopping';

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-4 float">&#x1F6D2;</div>
        <h1 className="text-3xl font-bold text-white mb-2">ListNest</h1>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// Main app content - shows shopping list or no family screen
function AppContent() {
  const { family, loading } = useFamily();

  if (loading) {
    return <LoadingScreen />;
  }

  // If user doesn't have a family, show the no family screen
  if (!family) {
    return <NoFamilyScreen />;
  }

  // Show the main shopping list
  return <ShoppingList />;
}

// Main app wrapper with FamilyProvider
function MainApp() {
  return (
    <FamilyProvider>
      <AppContent />
    </FamilyProvider>
  );
}

// App router based on auth state
function AppRouter() {
  const { user, loading: authLoading } = useAuth();
  const { childUser, loading: childLoading } = useChildAuth();

  console.log('AppRouter:', { authLoading, childLoading, user: user?.uid, childUser: childUser?.childId });

  // Show loading while checking auth state
  if (authLoading || childLoading) {
    return <LoadingScreen />;
  }

  // Show auth screen if not logged in
  if (!user && !childUser) {
    return <AuthScreen />;
  }

  // Show main app if logged in
  return <MainApp />;
}

// Root App component with all providers
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ChildAuthProvider>
          <AppRouter />
        </ChildAuthProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
