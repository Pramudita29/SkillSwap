import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useState } from 'react';
import API from '../../utils/api';
import ProfileSetupForm from '../ProfileSetupForm';

const LoginView = ({ onLogin, onShowRegister }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: '',
    otp: '',
    newPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Login form submit handler (password + MFA OTP)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (showMfa) {
      // MFA verification
      try {
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
      } catch (err) {
        alert(err.message || 'OTP verification failed. Please try again.');
      }
      return;
    }

    // Password check + send OTP
    try {
      const res = await API.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { userId } = res;
      if (!userId) {
        alert('Login response missing userId');
        return;
      }
      setUserId(userId);
      setShowMfa(true);
      alert('Password correct. Check your test email for the OTP code.');
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      if (errorMessage.toLowerCase().includes('password')) {
        alert('Incorrect password. Please try again.');
      } else if (
        errorMessage.toLowerCase().includes('user') ||
        errorMessage.toLowerCase().includes('email')
      ) {
        alert('User not found or email incorrect.');
      } else {
        alert(errorMessage);
      }
    }
  };

  // Forgot password handlers
  const sendOtpForReset = async () => {
    if (!formData.email) {
      alert('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/users/forgot-password', { email: formData.email });
      alert(res.message || 'OTP sent to your email');
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!formData.otp || !formData.newPassword) {
      alert('Both OTP and new password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/users/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      if (res?.message?.toLowerCase().includes('success')) {
        alert(res.message || 'Password has been reset successfully.');
        setOtpSent(false);
        setFormData({ email: '', password: '', mfaCode: '', otp: '', newPassword: '' });
        setMode('login');
      } else {
        alert(res.message || 'Password reset failed. Try again.');
      }
    } catch (err) {
      const message = err?.response?.data?.message;

      if (message?.toLowerCase().includes('otp')) {
        alert('Invalid or expired OTP. Please request a new one.');
      } else if (message?.toLowerCase().includes('email')) {
        alert('Email not found. Please check and try again.');
      } else if (message?.toLowerCase().includes('password')) {
        alert('Password must meet the requirements.');
      } else {
        alert(message || 'Something went wrong while resetting password.');
      }
    }
    setLoading(false);
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
              {showMfa
                ? 'Two-Factor Authentication'
                : mode === 'login'
                  ? 'Welcome Back'
                  : 'Forgot Password'}
            </h2>
            {!showMfa && (
              <p className="text-sm opacity-80 mt-2">
                {mode === 'login'
                  ? 'Sign in to your SkillSwap account'
                  : 'Reset your password here'}
              </p>
            )}
          </div>

          {!showMfa && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (mode === 'login') {
                  handleLoginSubmit(e);
                } else {
                  if (!otpSent) {
                    sendOtpForReset();
                  } else {
                    resetPassword();
                  }
                }
              }}
              className="space-y-5 text-sm"
            >
              {mode === 'login' ? (
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-gray-600 dark:text-gray-400"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setOtpSent(false);
                      setFormData((prev) => ({
                        ...prev,
                        password: '',
                        mfaCode: '',
                        otp: '',
                        newPassword: '',
                      }));
                    }}
                    className="text-right text-sm text-orange-400 hover:underline focus:outline-none"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-black-300 dark:text-gray-400">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                      placeholder="your@email.com"
                      required
                      disabled={loading || otpSent}
                    />
                  </div>

                  {!otpSent ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl text-white font-semibold hover:brightness-110 transition"
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-black-300 dark:text-gray-400">OTP Code</label>
                        <input
                          type="text"
                          name="otp"
                          value={formData.otp}
                          onChange={handleInputChange}
                          maxLength={6}
                          placeholder="Enter OTP"
                          className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-black-300 dark:text-gray-400">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="Enter new password"
                          className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                          required
                          disabled={loading}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl text-white font-semibold hover:brightness-110 transition"
                      >
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setOtpSent(false);
                      setFormData((prev) => ({
                        ...prev,
                        otp: '',
                        newPassword: '',
                      }));
                    }}
                    className="mt-4 w-full text-center text-sm text-orange-400 hover:underline"
                    disabled={loading}
                  >
                    Back to Login
                  </button>
                </>
              )}

              {mode === 'login' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full py-3 text-white rounded-xl font-semibold shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #ff7f50, #ffbb91)',
                    boxShadow: '0 6px 12px #ff7f50b0',
                  }}
                  disabled={loading}
                >
                  Sign In
                </motion.button>
              )}
            </form>
          )}

          {showMfa && (
            <form
              onSubmit={handleLoginSubmit}
              className="space-y-5 text-sm"
            >
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
                  disabled={loading}
                />
                <p className="text-xs mt-2 text-orange-500">
                  Check your test email (e.g., Yopmail) for the 6-digit OTP code.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full py-3 text-white rounded-xl font-semibold shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #ff7f50, #ffbb91)',
                  boxShadow: '0 6px 12px #ff7f50b0',
                }}
                disabled={loading}
              >
                Verify & Login
              </motion.button>
            </form>
          )}

          {mode === 'login' && !showMfa && (
            <p className="text-center text-sm opacity-80 mt-6">
              Don't have an account?{' '}
              <button
                onClick={onShowRegister}
                className="font-medium hover:underline"
                style={{ color: '#ff7f50' }}
                disabled={loading}
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
