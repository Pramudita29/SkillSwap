// RegisterPage.jsx
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useState } from 'react';
import API from '../../utils/api'; // <-- make sure this path is correct

const RegisterPage = ({ onShowLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getStrengthColor = (strength) => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      alert('Registration successful! Please log in.');
      onShowLogin(); // Switch to login view after success
    } catch (err) {
      alert('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#eaf2f7] dark:bg-[#121b2b] text-[#112233] dark:text-white flex items-center justify-center px-6 py-12 overflow-hidden transition-colors duration-700">
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
              'url(https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80)',
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
              Create your{' '}
              <span
                style={{
                  background:
                    'linear-gradient(90deg, #ff7f50, #ffbb91)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                SkillSwap
              </span>{' '}
              account
            </h2>
            <p className="text-sm opacity-80 mt-2">
              Start your journey of learning and teaching
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            <div className="flex flex-col gap-2">
              <label className="text-black-300 dark:text-gray-400">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 placeholder-gray-600 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black-300 dark:text-gray-400">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 placeholder-gray-600 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                placeholder="jane@email.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-black-300 dark:text-gray-400">
                Create Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 placeholder-gray-600 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                placeholder="Create Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Password strength
                    </span>
                    <span
                      className={`font-medium ${passwordStrength >= 75
                        ? 'text-green-400'
                        : passwordStrength >= 50
                          ? 'text-yellow-400'
                          : 'text-red-400'
                        }`}
                    >
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStrengthColor(
                        passwordStrength
                      )}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black-300 dark:text-gray-400">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="px-3 py-2 rounded-lg bg-gray-300/60 dark:bg-white/10 border border-gray-300/20 dark:border-white/20 placeholder-gray-600 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-800 dark:text-white"
                placeholder="Confirm Password"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-xl font-semibold shadow-md disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #ff7f50, #ffbb91)',
                boxShadow: '0 6px 12px #ff7f50b0',
              }}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </motion.button>
          </form>

          <p className="text-center text-sm opacity-80 mt-6">
            Already have an account?{' '}
            <button
              onClick={onShowLogin}
              className="font-medium hover:underline"
              style={{ color: '#ff7f50' }}
              type="button"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
