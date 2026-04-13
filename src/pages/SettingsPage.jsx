import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  User, Send, CheckCircle2, ExternalLink,
  Copy, Loader2, Save, AlertTriangle, Trash2,
  Camera, X, Lock, Brain
} from 'lucide-react';
import { profileService } from '../services/profileService';
import { telegramService } from '../services/telegramService';
import { llmModelService } from '../services/llmModelService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState({ first_name: '', last_name: '', job_title: '', bio: '', skills: '', email: '', avatar: null });
  const [tgStatus, setTgStatus] = useState(null);
  const [linkData, setLinkData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tgLoading, setTgLoading] = useState(false);

  // Avatar
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // LLM Models (manager only)
  const [llmModels, setLlmModels] = useState([]);
  const [orgDefaultModel, setOrgDefaultModel] = useState(null);
  const [llmSaving, setLlmSaving] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      const promises = [
        profileService.getProfile(),
        telegramService.getStatus()
      ];
      if (authUser?.role === 'manager') {
        promises.push(llmModelService.list());
        promises.push(llmModelService.getOrgDefault());
      }
      const results = await Promise.all(promises);
      setProfile(results[0]);
      setTgStatus(results[1]);
      if (authUser?.role === 'manager' && results[2]) {
        setLlmModels(results[2]);
        setOrgDefaultModel(results[3]?.default_llm_model?.id || null);
      }
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.role]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    let interval;
    if (linkData && !tgStatus?.is_linked) {
      interval = setInterval(async () => {
        try {
          const status = await telegramService.getStatus();
          if (status.is_linked) {
            setTgStatus(status);
            setLinkData(null);
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Status polling error");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [linkData, tgStatus]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.updateProfile(profile);
      alert(t('settings.profile_success'));
    } catch (err) {
      alert(t('settings.profile_error'));
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
      alert(t('settings.telegram_link_error'));
    } finally {
      setTgLoading(false);
    }
  };

  const handleTgUnlink = async () => {
    if (!window.confirm(t('settings.telegram_unlink_confirm'))) return;
    try {
      await telegramService.unlink();
      setTgStatus({ ...tgStatus, is_linked: false });
      setLinkData(null);
    } catch (err) {
      alert(t('settings.telegram_unlink_error'));
    }
  };

  const handleToggleNotif = async () => {
    try {
      const newVal = !tgStatus.telegram_notifications_enabled;
      await telegramService.toggleNotifications(newVal);
      setTgStatus({ ...tgStatus, telegram_notifications_enabled: newVal });
    } catch (err) {
      alert(t('settings.telegram_notif_error'));
    }
  };

  // Avatar handlers
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const updated = await profileService.uploadAvatar(file);
      setProfile(prev => ({ ...prev, avatar: updated.avatar }));
    } catch (err) {
      alert(t('settings.avatar_upload_error'));
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    if (!window.confirm(t('settings.avatar_remove'))) return;
    try {
      await profileService.removeAvatar();
      setProfile(prev => ({ ...prev, avatar: null }));
    } catch (err) {
      alert(t('settings.avatar_remove_error'));
    }
  };

  // Password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert(t('settings.password_mismatch'));
      return;
    }
    if (passwordForm.new_password.length < 8) {
      alert(t('settings.password_min_length'));
      return;
    }
    setPasswordSaving(true);
    try {
      await profileService.changePassword(passwordForm.current_password, passwordForm.new_password);
      alert(t('settings.password_success'));
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.current_password?.[0] || t('settings.password_error'));
    } finally {
      setPasswordSaving(false);
    }
  };

  // LLM default handler
  const handleSetOrgDefault = async (modelId) => {
    setLlmSaving(true);
    try {
      await llmModelService.setOrgDefault(modelId || null);
      setOrgDefaultModel(modelId || null);
    } catch (err) {
      alert(t('settings.llm_error'));
    } finally {
      setLlmSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(t('settings.telegram_code_copied'));
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <Loader2 className="animate-spin mr-2" /> {t('settings.loading')}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-4 font-sans pb-20">
      <div className="flex flex-col gap-8 max-w-4xl">

        {/* --- PROFILE SECTION --- */}
        <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-6 mb-10">
            <div className="relative group">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow-inner" />
              ) : (
                <div className="w-20 h-20 bg-[#1677FF] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="p-1.5 bg-white/90 rounded-full text-gray-700 hover:bg-white"
                >
                  {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                {profile.avatar && (
                  <button onClick={handleAvatarRemove} className="p-1.5 bg-white/90 rounded-full text-red-500 hover:bg-white">
                    <X size={14} />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800">{profile.first_name} {profile.last_name}</h3>
              <p className="text-gray-400 font-medium">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-2 gap-x-6 gap-y-8">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('settings.first_name')}</label>
              <input
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700"
                value={profile.first_name}
                onChange={(e) => setProfile({...profile, first_name: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('settings.last_name')}</label>
              <input
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700"
                value={profile.last_name}
                onChange={(e) => setProfile({...profile, last_name: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('settings.job_title')}</label>
              <input
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 transition-all text-gray-700"
                value={profile.job_title}
                onChange={(e) => setProfile({...profile, job_title: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('settings.bio')}</label>
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
                {t('settings.profile_save')}
              </button>
            </div>
          </form>
        </section>

        {/* --- PASSWORD SECTION --- */}
        <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
              <Lock size={22} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t('settings.password_title')}</h3>
          </div>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5 max-w-md">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('settings.password_current')}</label>
              <input
                type="password"
                required
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700"
                value={passwordForm.current_password}
                onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('settings.password_new')}</label>
              <input
                type="password"
                required
                minLength={8}
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700"
                value={passwordForm.new_password}
                onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('settings.password_confirm')}</label>
              <input
                type="password"
                required
                minLength={8}
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700"
                value={passwordForm.confirm_password}
                onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-700 transition-all w-fit disabled:opacity-50"
            >
              {passwordSaving ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              {t('settings.password_change')}
            </button>
          </form>
        </section>

        {/* --- LLM SECTION (manager only) --- */}
        {authUser?.role === 'manager' && (
          <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <Brain size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t('settings.llm_title')}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{t('settings.llm_description')}</p>
              </div>
            </div>
            <div className="max-w-md">
              <select
                className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700 w-full"
                value={orgDefaultModel || ''}
                onChange={e => handleSetOrgDefault(e.target.value ? Number(e.target.value) : null)}
                disabled={llmSaving}
              >
                <option value="">{t('settings.llm_system')}</option>
                {llmModels.map(m => (
                  <option key={m.id} value={m.id}>{m.display_name || m.model_id}</option>
                ))}
              </select>
              {llmSaving && <p className="text-xs text-blue-500 mt-2 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> {t('settings.llm_saving')}</p>}
            </div>
          </section>
        )}

        {/* --- TELEGRAM SECTION --- */}
        <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center text-white shadow-md">
                <Send size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t('settings.telegram_title')}</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${tgStatus?.is_linked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {tgStatus?.is_linked ? t('settings.telegram_connected') : t('settings.telegram_disconnected')}
                </span>
              </div>
            </div>
            {tgStatus?.is_linked && (
              <button onClick={handleTgUnlink} className="flex items-center gap-2 text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                <Trash2 size={16}/> {t('settings.telegram_unlink')}
              </button>
            )}
          </div>

          {tgStatus?.is_linked ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('settings.telegram_linked_account')}</p>
                  <p className="text-lg font-bold text-blue-600">@{tgStatus.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">{t('settings.telegram_linked_date')}</p>
                  <p className="text-sm font-bold text-gray-700">{new Date(tgStatus.linked_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white text-blue-500 rounded-xl shadow-sm"><Send size={20}/></div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-800">{t('settings.telegram_notifications')}</p>
                    <p className="text-xs text-gray-400 font-medium">{t('settings.telegram_notifications_desc')}</p>
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
            <div className="flex flex-col gap-6">
              {!linkData ? (
                <>
                  <p className="text-[15px] text-gray-500 leading-relaxed max-w-2xl">
                    {t('settings.telegram_desc')}
                  </p>
                  <button
                    onClick={handleTgLinkRequest}
                    disabled={tgLoading}
                    className="bg-[#0088cc] text-white px-10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#0077b3] transition-all w-fit shadow-lg shadow-blue-100 disabled:bg-gray-300"
                  >
                    {tgLoading ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
                    {t('settings.telegram_link')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-300">
                  <a
                    href={linkData.deep_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#0088cc] text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-[#0077b3] hover:translate-y-[-2px] transition-all active:scale-95"
                  >
                    <ExternalLink size={24} />
                    {t('settings.telegram_open')}
                  </a>

                  <p className="text-sm text-gray-500 text-center max-w-sm leading-relaxed font-medium">
                    {t('settings.telegram_code_instruction')}
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
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('settings.telegram_code_expires')}</p>
                    <p className="text-sm font-black text-gray-700">
                      {new Date(linkData.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>

                  <button
                    onClick={() => setLinkData(null)}
                    className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-red-500 mt-4 transition-colors"
                  >
                    {t('settings.telegram_cancel_request')}
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
