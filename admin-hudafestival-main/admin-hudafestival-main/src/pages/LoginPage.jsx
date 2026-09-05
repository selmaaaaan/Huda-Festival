import React, { useState } from 'react';
import api from '../services/api';
import Logo from '../components/Logo';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ onLoginSuccess }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!userName || !password) {
      setError('Please provide both Username and Password');
      setLoading(false);
      return;
    }

    try {
      // NOTE: Using the original login logic as requested
      const { data } = await api.post('/auth/login', { userName, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      onLoginSuccess();
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setUserName(import.meta.env.VITE_DEMO_ADMIN_USERNAME || 'admin');
    setPassword(import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'admin');
  };

  const showDemoButton = import.meta.env.MODE !== 'production' || import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0EA]">
      <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center">
          <Logo size="large" />
          <h2 className="text-2xl font-bold text-gray-900 mt-6">Admin Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Secure Access Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <p className="p-3 text-sm font-medium text-red-800 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                required
                placeholder="Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8A317] focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8A317] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-sm font-semibold text-white bg-[#E8A317] hover:bg-[#D49215] rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {showDemoButton && (
          <div className="text-center mt-6">
            <button
              onClick={handleDemoFill}
              className="text-xs text-gray-400 hover:text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors"
            >
              Use demo credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;