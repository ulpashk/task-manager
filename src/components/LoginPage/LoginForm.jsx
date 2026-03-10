import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loginUserApi } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
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
      navigate('/'); 
    } catch (err) {
      setError("Неверный логин или пароль. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[561px] h-[613px] bg-white rounded-[10px] flex flex-col items-center pt-[107px] px-[60px] shadow-sm">
      <h1 className="text-[30px] font-medium text-[#292731] leading-[37px] mb-[70px]">
        Добро пожаловать!
      </h1>

      <form onSubmit={handleSubmit} className="w-[441px] flex flex-col gap-[20px]">
        {/* Email Field */}
        <div className="flex flex-col gap-[10px]">
          <label className="text-[16px] font-medium text-black">
            E-mail или номер телефона
          </label>
          <input
            type="text"
            placeholder="E-mail или номер телефона"
            className={`w-full h-[48px] bg-[#F3F3F3] rounded-[4px] px-[22px] text-[16px] outline-none placeholder-[#757575] border-2 ${error ? 'border-red-400' : 'border-transparent focus:border-blue-400'}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-[10px]">
          <label className="text-[16px] font-medium text-black">Пароль</label>
          <input
            type="password"
            placeholder="Пароль"
            className={`w-full h-[48px] bg-[#F3F3F3] rounded-[4px] px-[22px] text-[16px] outline-none placeholder-[#757575] border-2 ${error ? 'border-red-400' : 'border-transparent focus:border-blue-400'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="text-[14px] font-medium underline cursor-pointer mt-[2px]">
            Забыли пароль?
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
          {loading ? 'Загрузка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};