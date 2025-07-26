import {
  ArrowRightLeft,
  BookOpen,
  Home,
  LogOut,
  MessageCircle,
  Repeat,
  Star,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeView, setActiveView, darkMode }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'transactions', label: 'Swap History', icon: ArrowRightLeft },
    { id: 'requests', label: 'Swap Requests', icon: Repeat },
    { id: 'skills', label: 'My Skills', icon: Star },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div
      className={`w-64 h-screen fixed left-0 top-0 z-30 flex flex-col justify-between ${darkMode ? 'bg-[#121b2b]' : 'bg-[#ffffff90]'
        } backdrop-blur-xl border-r border-white/10`}
    >
      {/* Top section */}
      <div className={`p-6 ${darkMode ? 'text-white' : 'text-[#112233]'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 select-none mb-8">
          <div
            className="p-2 rounded-lg"
            style={{
              background: `linear-gradient(135deg, #ff7f50, #ffbb91)`,
              boxShadow: `0 4px 10px #ff7f5040`,
            }}
          >
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-wide">SkillSwap</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${activeView === id
                ? 'bg-gradient-to-r from-[#ff7f50] to-[#ffbb91] text-[#112233] border border-[#ff7f50]'
                : darkMode
                  ? 'bg-[#1a2637] text-gray-300 hover:text-white hover:bg-[#2a3b4c]'
                  : 'bg-[#eaf2f7] text-gray-800 hover:text-black hover:bg-[#d4e6f1]'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom section: Logout */}
      <div className="p-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;