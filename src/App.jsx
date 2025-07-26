import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AccountSettingsPage from './components/AccountSettings';
import LoginView from './components/auth/LoginView';
import RegisterView from './components/auth/RegisterView';
import ViewMessagesPage from './components/ViewMessages';
import SkillSwapLanding from './pages/LandingPage';
import MainPage from './pages/MainPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SkillSwapLanding onGetStarted={() => window.location.href = '/register'} />} />
        <Route path="/register" element={<RegisterView onRegister={() => window.location.href = '/login'} onShowLogin={() => window.location.href = '/login'} />} />
        <Route path="/login" element={<LoginView onLogin={() => window.location.href = '/app'} onShowRegister={() => window.location.href = '/register'} />} />

        {/* Protected Route (Private) */}
        <Route path="/app" element={<MainPage />} /> {/* AppPage with Dashboard, Profile, etc. */}

        {/* Profile-Related Routes */}
        <Route path="/messages" element={<ViewMessagesPage />} />
        <Route path="/settings" element={<AccountSettingsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
