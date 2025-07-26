import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useState } from 'react';
import API from '../../utils/api';
import ProfileSetupForm from '../ProfileSetupForm';

const LoginView = ({ onLogin, onShowRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [userId, setUserId] = useState(null);
  const [devMfaCode, setDevMfaCode] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!showMfa) {
        const res = await API.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        const { userId: returnedUserId, mfaCode: returnedMfaCode } = res;

        if (!returnedUserId || !returnedMfaCode) {
          alert('Login response missing userId or mfaCode');
          return;
        }

        setUserId(returnedUserId);
        setDevMfaCode(returnedMfaCode);
        setShowMfa(true);

        setTimeout(() => {
          alert(`Password correct.\nDev MFA Code: ${returnedMfaCode}`);
        }, 100);
      } else {
        const res = await API.post('/auth/mfa', {
          userId,
          mfaCode: formData.mfaCode,
        });

        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', userId);

        const userRes = await API.get(`/users/${userId}`);

        const profileIncomplete =
          !userRes?.name ||
          !userRes?.bio ||
          !userRes?.skillsOffered?.length ||
          !userRes?.skillsToLearn?.length ||
          !userRes?.location;

        if (profileIncomplete) {
          setShowProfileSetup(true);
        } else {
          alert('Login successful');
          onLogin && onLogin();
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  if (showProfileSetup) {
    return (
      <ProfileSetupForm
        userId={userId}
        onDone={() => {
          alert('Profile completed. Welcome!');
          onLogin && onLogin();
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#eaf2f7] dark:bg-[#121b2b] text-[#112233] dark:text-white flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="flex w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl z-10"
      >
        <div
          className="w-1/2 bg-cover bg-center min-h-[400px]"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80)',
          }}
        />

        <div className="w-full lg:w-1/2 p-10">
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #ff7f50, #ffbb91)' }}
            >
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold">
              {showMfa ? 'Two-Factor Authentication' : 'Welcome Back'}
            </h2>
            {!showMfa && (
              <p className="text-sm opacity-80 mt-2">
                Sign in to your SkillSwap account
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {!showMfa ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-black-300 dark:text-gray-400">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                    placeholder="jane@email.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-black-300 dark:text-gray-400">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                    placeholder="Enter Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-600 dark:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-black-300 dark:text-gray-400">Authentication Code</label>
                <input
                  type="text"
                  name="mfaCode"
                  value={formData.mfaCode}
                  onChange={handleInputChange}
                  maxLength={6}
                  className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                  placeholder="Enter 6-digit code"
                  required
                />
                {devMfaCode && (
                  <p className="text-xs mt-2 text-orange-500">
                    ⚠️ Dev MFA Code: <strong>{devMfaCode}</strong>
                  </p>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 text-white rounded-xl font-semibold shadow-md"
              style={{
                background: 'linear-gradient(135deg, #ff7f50, #ffbb91)',
                boxShadow: '0 6px 12px #ff7f50b0',
              }}
            >
              {showMfa ? 'Verify & Login' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-sm opacity-80 mt-6">
            Don't have an account?{' '}
            <button
              onClick={onShowRegister}
              className="font-medium hover:underline"
              style={{ color: '#ff7f50' }}
            >
              Sign up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
