import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { handleApiError } from '@/services/api';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI';
import { ArrowLeft, Rocket } from 'lucide-react';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.password_mismatch', 'Passwords do not match'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.password_length', 'Password must be at least 8 characters'));
      return;
    }

    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back_to_home')}
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                Sitemap Monitor
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900">{t('auth.create_account')}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {t('auth.sign_up_desc')}
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {error}
                  </div>
                )}

                <Input
                  label={t('auth.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />

                <Input
                  label={t('auth.password')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />

                <Input
                  label={t('auth.confirm_password')}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />

                <Button type="submit" className="w-full py-3 text-base shadow-lg shadow-indigo-200" loading={isLoading}>
                  {t('auth.sign_up')}
                </Button>
              </form>
            </div>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                {t('auth.already_have_account')}{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  {t('auth.sign_in')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Feature */}
      <div className="hidden lg:block relative flex-1 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 mix-blend-overlay"></div>
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-color-dodge"
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Register background"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">Launch Your SEO Strategy</h3>
            <p className="text-indigo-200 text-lg">
              Get started with the most powerful sitemap monitoring tool in the market. Free for open source projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
