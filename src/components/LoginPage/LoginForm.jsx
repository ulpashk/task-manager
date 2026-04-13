import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loginUserApi } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const LoginForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUserApi(email, password);

      login(data.access);

      const payload = JSON.parse(atob(data.access.split('.')[1]));
      const role = payload.role;

      if (role === 'superadmin') {
        navigate('/organizations');
      } else if (role === 'client') {
        navigate('/portal');
      } else {
        navigate('/');
      }

    } catch (err) {
      const detail = err.response?.data?.detail || t('auth.invalid_credentials');
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[561px] h-[613px] bg-white rounded-[10px] flex flex-col items-center pt-[107px] px-[60px] shadow-sm">
      <h1 className="text-[30px] font-medium text-[#292731] leading-[37px] mb-[70px]">
        {t('auth.welcome')}
      </h1>

      <form onSubmit={handleSubmit} className="w-[441px] flex flex-col gap-[20px]">
        <div className="flex flex-col gap-[10px]">
          <label className="text-[16px] font-medium text-black">
            {t('auth.email_label')}
          </label>
          <input
            type="text"
            placeholder={t('auth.email_label')}
            className={`w-full h-[48px] bg-[#F3F3F3] rounded-[4px] px-[22px] text-[16px] outline-none placeholder-[#757575] border-2 ${error ? 'border-red-400' : 'border-transparent focus:border-blue-400'}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-[10px]">
          <label className="text-[16px] font-medium text-black">{t('auth.password_label')}</label>
          <input
            type="password"
            placeholder={t('auth.password_label')}
            className={`w-full h-[48px] bg-[#F3F3F3] rounded-[4px] px-[22px] text-[16px] outline-none placeholder-[#757575] border-2 ${error ? 'border-red-400' : 'border-transparent focus:border-blue-400'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="text-[14px] font-medium underline cursor-pointer mt-[2px]">
            {t('auth.forgot_password')}
          </span>
        </div>

        {error && (
          <div className="text-red-500 text-sm font-medium animate-in fade-in duration-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[48px] bg-[#1677FF] rounded-[8px] text-white text-[20px] font-medium flex items-center justify-center transition-opacity hover:opacity-90 disabled:bg-gray-400"
        >
          {loading ? t('auth.loading') : t('auth.login')}
        </button>
      </form>
    </div>
  );
};
