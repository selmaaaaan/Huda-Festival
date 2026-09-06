import React, { useState } from 'react';
import api from '../services/api';
import Logo from '../components/Logo';
import Button from '../components/Button';
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-heading)]">
      <div className="w-full max-w-md p-10 space-y-8 bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)]">
        <div className="flex flex-col items-center">
          <Logo size="large" />
          <h2 className="text-2xl font-bold mt-6">Admin Console</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Secure Operations Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 text-sm font-medium text-red-400 bg-red-900/20 rounded-lg border border-red-800/40">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-[var(--color-text-muted)]" />
              </div>
              <input
                type="text"
                required
                placeholder="Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-[var(--color-text-muted)]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full justify-center py-3">
            {loading ? 'Authenticating...' : 'Initialize Session'}
          </Button>
        </form>

        {showDemoButton && (
          <div className="text-center mt-6">
            <button
              onClick={handleDemoFill}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] underline decoration-[var(--color-border)] underline-offset-2 transition-colors"
            >
              Load test credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;