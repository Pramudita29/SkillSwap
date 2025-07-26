import { useState } from 'react';
import { post } from '../utils/api';
import LoginView from './auth/LoginView';
import RegisterView from './auth/RegisterView';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginStep, setLoginStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: '',
  });
  const [loginUserId, setLoginUserId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (loginStep === 1) {
      try {
        const res = await post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        if (res.userId) {
          setLoginUserId(res.userId);
          setFormData((prev) => ({
            ...prev,
            mfaCode: res.mfaCode || '', // dev only
          }));
          alert(`MFA code (dev only): ${res.mfaCode}`);
          setLoginStep(2);
        } else {
          alert(res.message || 'Login failed');
        }
      } catch (err) {
        alert(err.message || 'Login error');
      }
    } else {
      try {
        const res = await post('/auth/mfa', {
          userId: loginUserId,
          mfaCode: formData.mfaCode,
        });

        if (res.token) {
          localStorage.setItem('token', res.token);
          alert('Login successful!');
          // Redirect here if needed
        } else {
          alert(res.message || 'MFA failed');
        }
      } catch (err) {
        alert(err.message || 'MFA error');
      }
    }
  };

  const handleRegister = async (formData) => {
    const { email, password } = formData;
    try {
      const res = await post('/auth/register', { email, password });
      alert('Registered successfully!');
      setIsLogin(true);
    } catch (err) {
      alert(err.message || 'Registration failed');
    }
  };

  return isLogin ? (
    <LoginView
      formData={formData}
      onInputChange={handleInputChange}
      onLoginSubmit={handleLoginSubmit}
      onShowRegister={() => {
        setIsLogin(false);
        setLoginStep(1);
        setLoginUserId(null);
        setFormData({ email: '', password: '', mfaCode: '' });
      }}
      showMfa={loginStep === 2}
    />
  ) : (
    <RegisterView
      onRegister={handleRegister}
      onShowLogin={() => {
        setIsLogin(true);
        setLoginStep(1);
        setLoginUserId(null);
        setFormData({ email: '', password: '', mfaCode: '' });
      }}
    />
  );
};

export default AuthPage;
