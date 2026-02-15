import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useChildAuth } from '../../contexts/ChildAuthContext';
import { db, firestore } from '../../services/firebase';

function ReminderModal({ onClose, family, onSendReminder }) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { childUser } = useChildAuth();
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'scheduled'
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedTime, setSelectedTime] = useState('17:00');
    const [scheduledReminders, setScheduledReminders] = useState(family?.reminderSettings?.scheduledReminders || []);
    const [savingSchedule, setSavingSchedule] = useState(false);

    const currentUserId = childUser?.childId || user?.uid;
    const currentUserName = childUser?.displayName || user?.displayName || user?.email || 'Anonymous';

    const dayNames = [
        { key: 0, label: t('sundayShort') },
        { key: 1, label: t('mondayShort') },
        { key: 2, label: t('tuesdayShort') },
        { key: 3, label: t('wednesdayShort') },
        { key: 4, label: t('thursdayShort') },
        { key: 5, label: t('fridayShort') },
        { key: 6, label: t('saturdayShort') }
    ];

    const timeOptions = [];
    for (let h = 6; h <= 22; h++) {
        timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
        timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
    }

    // Get family members excluding current user (includes both regular members and child accounts)
    const regularMembers = family?.members?.filter(m => m.userId !== currentUserId) || [];
    const childMembers = family?.childAccounts?.filter(c => c.childId !== currentUserId)?.map(c => ({
        userId: c.childId,
        name: c.displayName,
        isChild: true
    })) || [];
    const familyMembers = [...regularMembers, ...childMembers];

    const handleSendManualReminder = async () => {
        if (sending) return;
        setSending(true);
        try {
            const reminderText = message.trim() || t('reminderMessage');
            await onSendReminder(reminderText);
            setSent(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error sending reminder:', error);
            setSending(false);
        }
    };

    const toggleDay = (dayKey) => {
        setSelectedDays(prev =>
            prev.includes(dayKey)
                ? prev.filter(d => d !== dayKey)
                : [...prev, dayKey].sort()
        );
    };

    const handleSaveScheduledReminder = async () => {
        if (selectedDays.length === 0 || savingSchedule) return;
        setSavingSchedule(true);
        try {
            const newReminder = {
                id: crypto.randomUUID ? crypto.randomUUID() : `reminder_${Date.now()}`,
                createdBy: currentUserId,
                createdByName: currentUserName,
                days: selectedDays,
                time: selectedTime,
                message: message.trim() || t('reminderMessage'),
                enabled: true,
                lastSent: null,
                createdAt: new Date()
            };

            const updatedReminders = [...scheduledReminders, newReminder];

            await firestore.updateDoc(
                firestore.doc(db, 'families', family.id),
                {
                    'reminderSettings.scheduledReminders': updatedReminders
                }
            );

            setScheduledReminders(updatedReminders);
            setSelectedDays([]);
            setMessage('');
        } catch (error) {
            console.error('Error saving scheduled reminder:', error);
        } finally {
            setSavingSchedule(false);
        }
    };

    const handleDeleteReminder = async (reminderId) => {
        try {
            const updatedReminders = scheduledReminders.filter(r => r.id !== reminderId);
            await firestore.updateDoc(
                firestore.doc(db, 'families', family.id),
                {
                    'reminderSettings.scheduledReminders': updatedReminders
                }
            );
            setScheduledReminders(updatedReminders);
        } catch (error) {
            console.error('Error deleting reminder:', error);
        }
    };

    const toggleReminderEnabled = async (reminderId) => {
        try {
            const updatedReminders = scheduledReminders.map(r =>
                r.id === reminderId ? { ...r, enabled: !r.enabled } : r
            );
            await firestore.updateDoc(
                firestore.doc(db, 'families', family.id),
                {
                    'reminderSettings.scheduledReminders': updatedReminders
                }
            );
            setScheduledReminders(updatedReminders);
        } catch (error) {
            console.error('Error toggling reminder:', error);
        }
    };

    const formatScheduleDays = (days) => {
        return days.map(d => dayNames.find(dn => dn.key === d)?.label).join(', ');
    };

    if (sent) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="glass rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                    <div className="text-6xl mb-4 animate-bounce">&#x2705;</div>
                    <h2 className="text-xl font-bold text-gradient">{t('reminderSent')}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gradient flex items-center gap-2">
                        &#x1F514; {t('sendReminder')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        &#x2715;
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'manual'
                                ? 'bg-white dark:bg-gray-700 shadow text-teal-600 dark:text-teal-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        {t('manualReminder')}
                    </button>
                    <button
                        onClick={() => setActiveTab('scheduled')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'scheduled'
                                ? 'bg-white dark:bg-gray-700 shadow text-teal-600 dark:text-teal-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        {t('scheduledReminder')}
                    </button>
                </div>

                {/* Manual Tab */}
                {activeTab === 'manual' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('customMessage')}
                            </label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder={t('reminderMessage')}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-teal-500 resize-none"
                            />
                        </div>

                        {/* Recipients */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                            <div className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                                {t('whoWillReceive')}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {familyMembers.length > 0 ? (
                                    familyMembers.map((member, idx) => (
                                        <span key={member.userId || idx} className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg text-sm">
                                            {member.isChild ? '&#x1F476;' : '&#x1F464;'} {member.name || member.displayName || member.email}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500">{t('familyMembers')}</span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleSendManualReminder}
                            disabled={sending}
                            className="w-full btn-gradient text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {t('sending')}
                                </>
                            ) : (
                                <>&#x1F514; {t('sendNow')}</>
                            )}
                        </button>
                    </div>
                )}

                {/* Scheduled Tab */}
                {activeTab === 'scheduled' && (
                    <div className="space-y-4">
                        {/* Day Picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('selectDays')}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {dayNames.map(day => (
                                    <button
                                        key={day.key}
                                        onClick={() => toggleDay(day.key)}
                                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                                            selectedDays.includes(day.key)
                                                ? 'bg-teal-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('selectTime')}
                            </label>
                            <select
                                value={selectedTime}
                                onChange={e => setSelectedTime(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-teal-500"
                            >
                                {timeOptions.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>

                        {/* Custom Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('customMessage')}
                            </label>
                            <input
                                type="text"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder={t('reminderMessage')}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-teal-500"
                            />
                        </div>

                        {/* Preview */}
                        {selectedDays.length > 0 && (
                            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3 text-sm text-teal-800 dark:text-teal-300">
                                {t('reminderWillBeSent')} {formatScheduleDays(selectedDays)} {t('at')} {selectedTime}
                            </div>
                        )}

                        <button
                            onClick={handleSaveScheduledReminder}
                            disabled={selectedDays.length === 0 || savingSchedule}
                            className="w-full btn-gradient text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                        >
                            {savingSchedule ? t('saving') : t('addScheduledReminder')}
                        </button>

                        {/* Existing Scheduled Reminders */}
                        {scheduledReminders.length > 0 && (
                            <div className="border-t dark:border-gray-700 pt-4 mt-4">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    {t('scheduledReminder')}
                                </h3>
                                <div className="space-y-2">
                                    {scheduledReminders.map(reminder => (
                                        <div
                                            key={reminder.id}
                                            className={`flex items-center justify-between p-3 rounded-xl ${
                                                reminder.enabled
                                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                    : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {formatScheduleDays(reminder.days)} {t('at')} {reminder.time}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {reminder.createdByName}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleReminderEnabled(reminder.id)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                                        reminder.enabled
                                                            ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                                    }`}
                                                >
                                                    {reminder.enabled ? '&#x2713;' : '&#x25CB;'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReminder(reminder.id)}
                                                    className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50"
                                                >
                                                    &#x1F5D1;
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {scheduledReminders.length === 0 && (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                                <div className="text-3xl mb-2">&#x1F4C5;</div>
                                {t('noScheduledReminders')}
                            </div>
                        )}
                    </div>
                )}

                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    className="w-full mt-4 py-3 glass border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                >
                    {t('cancel')}
                </button>
            </div>
        </div>
    );
}

export default ReminderModal;
