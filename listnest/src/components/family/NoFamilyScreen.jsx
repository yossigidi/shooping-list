import { useState, useEffect } from 'react';
import { useFamily } from '../../contexts/FamilyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

function NoFamilyScreen() {
    const [mode, setMode] = useState('choose'); // choose, create, join
    const [familyName, setFamilyName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdCode, setCreatedCode] = useState('');
    const [selectedRole, setSelectedRole] = useState(''); // parent_father, parent_mother, child
    const [pendingInvite, setPendingInvite] = useState(false);
    const { createFamily, joinFamily } = useFamily();
    const { user, logout } = useAuth();
    const { t, language } = useLanguage();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedDark = localStorage.getItem('darkMode') === 'true';
        if (savedDark) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }

        // Check for pending join code from invite link
        const pendingCode = localStorage.getItem('pendingJoinCode');
        if (pendingCode && pendingCode.length === 6) {
            setJoinCode(pendingCode);
            setMode('join');
            setPendingInvite(true);
            // Clear the pending code
            localStorage.removeItem('pendingJoinCode');
        }
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!familyName.trim()) {
            setError(t('enterFamilyName'));
            return;
        }
        if (!selectedRole) {
            setError(t('selectRole'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const newFamily = await createFamily(familyName.trim(), selectedRole);
            setCreatedCode(newFamily.code);
            setMode('created');
        } catch (err) {
            setError(t('errorCreatingFamily'));
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!joinCode.trim() || joinCode.trim().length !== 6) {
            setError(t('enterCode'));
            return;
        }
        if (!selectedRole) {
            setError(t('selectRole'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await joinFamily(joinCode.trim(), selectedRole);
            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError(t('errorJoining'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', String(newMode));
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div className="glass rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <button onClick={toggleDarkMode} className="absolute top-6 left-6 p-2.5 rounded-xl bg-white/50 dark:bg-gray-700/50 text-2xl hover:scale-110 transition-all">
                    {darkMode ? '☀️' : '🌙'}
                </button>

                <button onClick={handleLogout} className="absolute top-6 right-6 p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50 text-sm text-red-600 dark:text-red-400 hover:scale-105 transition-all">
                    התנתק
                </button>

                <div className="text-center mb-8 pt-8">
                    <div className="text-7xl mb-4 float">👨‍👩‍👧‍👦</div>
                    <h1 className="text-2xl font-bold text-gradient mb-2">{t('welcome')}, {user?.displayName || 'משתמש'}!</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('createNewFamily')} / {t('joinExistingFamily')}</p>
                </div>

                {mode === 'choose' && (
                    <div className="space-y-4">
                        <button onClick={() => setMode('create')} className="w-full btn-gradient text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-3">
                            <span className="text-2xl">🏠</span>
                            {t('createNewFamily')}
                        </button>
                        <button onClick={() => setMode('join')} className="w-full glass border-2 border-indigo-300 dark:border-indigo-600 py-4 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-3 text-gray-700 dark:text-gray-200">
                            <span className="text-2xl">🔗</span>
                            {t('joinExistingFamily')}
                        </button>
                    </div>
                )}

                {mode === 'create' && (
                    <form onSubmit={handleCreate} className="space-y-4">
                        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">{t('createFamily')}</h2>

                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('familyName')}</label>
                            <input
                                type="text"
                                value={familyName}
                                onChange={e => setFamilyName(e.target.value)}
                                placeholder={t('familyNameExample')}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('selectRole')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('parent_father')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                        selectedRole === 'parent_father'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                                    }`}
                                >
                                    <span className="text-3xl">👨</span>
                                    <span className="font-medium text-gray-800 dark:text-white">{t('father')}</span>
                                    <span className="text-xs text-green-600">{t('admin')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('parent_mother')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                        selectedRole === 'parent_mother'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                                    }`}
                                >
                                    <span className="text-3xl">👩</span>
                                    <span className="font-medium text-gray-800 dark:text-white">{t('mother')}</span>
                                    <span className="text-xs text-green-600">{t('admin')}</span>
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !selectedRole} className="w-full btn-gradient text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                            {loading ? t('loading') : t('createFamily')}
                        </button>

                        <button type="button" onClick={() => { setMode('choose'); setError(''); setSelectedRole(''); }} className="w-full text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                            חזור
                        </button>
                    </form>
                )}

                {mode === 'join' && (
                    <form onSubmit={handleJoin} className="space-y-4">
                        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">{t('joinFamily')}</h2>

                        {pendingInvite && (
                            <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm text-center mb-2">
                                הוזמנת להצטרף למשפחה! בחר את תפקידך והצטרף
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('familyCode')}</label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="ABC123"
                                maxLength={6}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-indigo-500 text-center text-2xl tracking-widest font-mono"
                                dir="ltr"
                                required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">{t('shareCode')}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('selectRole')}</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('parent_father')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                        selectedRole === 'parent_father'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                                    }`}
                                >
                                    <span className="text-2xl">👨</span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-white">{t('father')}</span>
                                    <span className="text-xs text-green-600">{t('admin')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('parent_mother')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                        selectedRole === 'parent_mother'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                                    }`}
                                >
                                    <span className="text-2xl">👩</span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-white">{t('mother')}</span>
                                    <span className="text-xs text-green-600">{t('admin')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('teen')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                        selectedRole === 'teen'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                                    }`}
                                >
                                    <span className="text-2xl">🧑</span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-white">{t('teen')}</span>
                                    <span className="text-xs text-blue-600">{t('canInviteMembers')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('child')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                        selectedRole === 'child'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                                    }`}
                                >
                                    <span className="text-2xl">👦</span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-white">{t('child')}</span>
                                    <span className="text-xs text-amber-600">{t('limited')}</span>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                {selectedRole === 'teen' ? t('teenPermissions') : t('childPermissions')}
                            </p>
                        </div>

                        <button type="submit" disabled={loading || !selectedRole} className="w-full btn-gradient text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                            {loading ? t('loading') : t('joinFamily')}
                        </button>

                        <button type="button" onClick={() => { setMode('choose'); setError(''); }} className="w-full text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                            {t('back')}
                        </button>
                    </form>
                )}

                {mode === 'created' && (
                    <div className="text-center space-y-4">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-xl font-bold text-gradient">{t('familyCreated')}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{t('shareCodeWith')}</p>
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 px-6 py-4 rounded-xl">
                            <div className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{createdCode}</div>
                        </div>
                        <button
                            onClick={() => navigator.clipboard.writeText(createdCode)}
                            className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
                        >
                            📋 העתק קוד
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('pageRefresh')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NoFamilyScreen;
