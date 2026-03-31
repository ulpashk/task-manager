import React, { useEffect, useState, useCallback } from 'react';
import { 
  User, Send, CheckCircle2, ExternalLink, 
  Copy, Loader2, Save, AlertTriangle, Trash2 
} from 'lucide-react';
import { profileService } from '../services/profileService';
import { telegramService } from '../services/telegramService';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState({ first_name: '', last_name: '', job_title: '', bio: '', email: '' });
  const [tgStatus, setTgStatus] = useState(null);
  const [linkData, setLinkData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tgLoading, setTgLoading] = useState(false);

  // 1. Загрузка данных профиля и статуса TG
  const loadInitialData = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([
        profileService.getProfile(),
        telegramService.getStatus()
      ]);
      setProfile(p);
      setTgStatus(t);
    } catch (err) {
      console.error("Ошибка загрузки настроек:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Логика Polling (Опрос сервера каждые 3 сек, пока ждем привязки)
  useEffect(() => {
    let interval;
    if (linkData && !tgStatus?.is_linked) {
      interval = setInterval(async () => {
        try {
          const status = await telegramService.getStatus();
          if (status.is_linked) {
            setTgStatus(status);
            setLinkData(null); // Прячем блок с кодом, показываем "Привязано"
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Ошибка при опросе статуса");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [linkData, tgStatus]);

  // 3. Обработчики событий
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.updateProfile(profile);
      alert("Профиль успешно обновлен");
    } catch (err) {
      alert("Не удалось обновить профиль");
    } finally {
      setSaving(false);
    }
  };

  const handleTgLinkRequest = async () => {
    setTgLoading(true);
    try {
      const data = await telegramService.generateLink();
      setLinkData(data);
    } catch (err) {
      alert("Ошибка генерации ссылки");
    } finally {
      setTgLoading(false);
    }
  };

  const handleTgUnlink = async () => {
    if (!window.confirm("Вы уверены, что хотите отвязать Telegram?")) return;
    try {
      await telegramService.unlink();
      setTgStatus({ ...tgStatus, is_linked: false });
      setLinkData(null);
    } catch (err) {
      alert("Ошибка при попытке отвязать аккаунт");
    }
  };

  const handleToggleNotif = async () => {
    try {
      const newVal = !tgStatus.telegram_notifications_enabled;
      await telegramService.toggleNotifications(newVal);
      setTgStatus({ ...tgStatus, telegram_notifications_enabled: newVal });
    } catch (err) {
      alert("Ошибка изменения настроек уведомлений");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Код скопирован!");
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <Loader2 className="animate-spin mr-2" /> Загрузка настроек...
    </div>
  );

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-4 font-sans pb-20">
      <div className="flex flex-col gap-8 max-w-4xl">
        
        {/* --- СЕКЦИЯ ПРОФИЛЯ --- */}
        <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-[#1677FF] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800">{profile.first_name} {profile.last_name}</h3>
              <p className="text-gray-400 font-medium">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-2 gap-x-6 gap-y-8">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Имя</label>
              <input 
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700"
                value={profile.first_name}
                onChange={(e) => setProfile({...profile, first_name: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Фамилия</label>
              <input 
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700"
                value={profile.last_name}
                onChange={(e) => setProfile({...profile, last_name: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Должность</label>
              <input 
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 transition-all text-gray-700"
                value={profile.job_title}
                onChange={(e) => setProfile({...profile, job_title: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">О себе</label>
              <textarea 
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-4 h-32 outline-none resize-none focus:border-blue-500 transition-all text-gray-700"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-[#1677FF] text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 disabled:bg-gray-300"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Сохранить профиль
              </button>
            </div>
          </form>
        </section>

        {/* --- СЕКЦИЯ TELEGRAM --- */}
        <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center text-white shadow-md">
                <Send size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">Telegram интеграция</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${tgStatus?.is_linked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {tgStatus?.is_linked ? 'Подключен' : 'Не подключен'}
                </span>
              </div>
            </div>
            {tgStatus?.is_linked && (
              <button onClick={handleTgUnlink} className="flex items-center gap-2 text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                <Trash2 size={16}/> Отвязать
              </button>
            )}
          </div>

          {/* Состояние: УЖЕ ПРИВЯЗАНО */}
          {tgStatus?.is_linked ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Связанный аккаунт:</p>
                  <p className="text-lg font-bold text-blue-600">@{tgStatus.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Дата привязки</p>
                  <p className="text-sm font-bold text-gray-700">{new Date(tgStatus.linked_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white text-blue-500 rounded-xl shadow-sm"><Send size={20}/></div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-800">Уведомления в боте</p>
                    <p className="text-xs text-gray-400 font-medium">Отчеты и задачи будут приходить в мессенджер</p>
                  </div>
                </div>
                <button 
                  onClick={handleToggleNotif}
                  className={`w-14 h-7 rounded-full transition-all relative ${tgStatus.telegram_notifications_enabled ? 'bg-[#1677FF]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${tgStatus.telegram_notifications_enabled ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
            </div>
          ) : (
            /* Состояние: НЕ ПРИВЯЗАНО */
            <div className="flex flex-col gap-6">
              {!linkData ? (
                /* Шаг 0: Кнопка начать привязку */
                <>
                  <p className="text-[15px] text-gray-500 leading-relaxed max-w-2xl">
                    Привяжите аккаунт, чтобы мгновенно получать уведомления о новых задачах, дедлайнах и сгенерированных ИИ-отчетах прямо в ваш Telegram.
                  </p>
                  <button 
                    onClick={handleTgLinkRequest}
                    disabled={tgLoading}
                    className="bg-[#0088cc] text-white px-10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#0077b3] transition-all w-fit shadow-lg shadow-blue-100 disabled:bg-gray-300"
                  >
                    {tgLoading ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
                    Привязать Telegram
                  </button>
                </>
              ) : (
                /* Шаг 1: Инструкция с большой синей кнопкой (как на ваших скриншотах) */
                <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-300">
                  <a 
                    href={linkData.deep_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#0088cc] text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-[#0077b3] hover:translate-y-[-2px] transition-all active:scale-95"
                  >
                    <ExternalLink size={24} />
                    Открыть в Telegram
                  </a>

                  <p className="text-sm text-gray-500 text-center max-w-sm leading-relaxed font-medium">
                    Если ссылка не открылась, скопируйте этот код и отправьте его нашему боту:
                  </p>

                  <div className="flex items-center gap-4 bg-[#F9FAFB] border-2 border-dashed border-blue-200 px-8 py-4 rounded-2xl group">
                    <code className="text-2xl font-mono font-black text-gray-800 tracking-[0.2em]">
                      {linkData.code}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(linkData.code)}
                      className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                    >
                      <Copy size={20} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Код активен до:</p>
                    <p className="text-sm font-black text-gray-700">
                      {new Date(linkData.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>

                  <button 
                    onClick={() => setLinkData(null)}
                    className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-red-500 mt-4 transition-colors"
                  >
                    Отменить запрос
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};