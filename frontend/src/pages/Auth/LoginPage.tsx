import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { handleApiError } from '@/services/api';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI';
import { ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/UI/GlassCard';
import { AnimatedBackground } from '@/components/Layout/AnimatedBackground';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <AnimatedBackground />

      <GlassCard className="w-full max-w-md p-8 sm:p-10 backdrop-blur-2xl bg-white/60">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 text-sm font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('common.back_to_home')}
          </Link>

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
              S
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">{t('auth.welcome_back')}</h2>
          <p className="text-slate-600">
            {t('auth.sign_in_desc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50/80 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="glass-input bg-white/50 border-white/60 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-2">
              <Input
                label={t('auth.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="glass-input bg-white/50 border-white/60 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {t('auth.forgot_password')}
                </Link>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full py-3 text-base font-bold bg-slate-900 hover:bg-slate-800 shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]" loading={isLoading}>
            {t('auth.sign_in')}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
          <p className="text-sm text-slate-600">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              {t('auth.sign_up')}
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
