import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAuthModalOpen(false)}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-700/20">
              <img src="/img/wallet.png" alt="SmartSpend" className="w-7 h-7 object-contain" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">
              {isRegister ? 'Create an Account' : 'Welcome back to SmartSpend'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isRegister
                ? 'Save your favourites, budgets and store preferences.'
                : 'Sign in to access your saved lists and budget history.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="name@example.com"
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-700/20 mt-2"
            >
              {isRegister ? 'Register & Start Shopping' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Register / Sign In */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                New to SmartSpend?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
