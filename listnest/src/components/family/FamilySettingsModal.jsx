import { useState } from 'react';
import { useFamily } from '../../contexts/FamilyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import qrcode from 'qrcode-generator';
import { CreateChildAccountModal, ResetChildPinModal, GenerateChildQRModal } from '../modals';

export default function FamilySettingsModal({ onClose }) {
    const { family, leaveFamily, deleteEntireFamily, removeMember, isAdmin, canInvite, isTeen, deleteChildAccount } = useFamily();
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showDeleteFamilyConfirm, setShowDeleteFamilyConfirm] = useState(false);
    const [copied, setCopied] = useState(false);
    const [childLinkCopied, setChildLinkCopied] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showCreateChildModal, setShowCreateChildModal] = useState(false);
    const [showChildQRModal, setShowChildQRModal] = useState(false);
    const [showResetPinModal, setShowResetPinModal] = useState(null);
    const [deleteChildId, setDeleteChildId] = useState(null);
    const isRTL = language === 'he' || language === 'ar';

    const inviteLink = `https://yossigidi.github.io/shooping-list/?join=${family?.code}`;
    const childJoinLink = `${window.location.origin}${window.location.pathname}?childJoin=${family?.code}`;

    const copyChildLink = () => {
        navigator.clipboard.writeText(childJoinLink);
        setChildLinkCopied(true);
        setTimeout(() => setChildLinkCopied(false), 2000);
    };

    const shareChildLinkWhatsApp = () => {
        const text = encodeURIComponent(`היי! 👋\n\nהנה קישור להתחברות לרשימת הקניות של משפחת "${family.name}":\n\n${childJoinLink}\n\nפשוט לחץ/י על הקישור ובחר/י את השם שלך 😊`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const copyCode = () => {
        navigator.clipboard.writeText(family.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generateQRCode = () => {
        try {
            const qr = qrcode(0, 'M');
            qr.addData(inviteLink);
            qr.make();
            setQrCodeUrl(qr.createDataURL(6, 0));
            setShowShareOptions(true);
        } catch (e) {
            console.error('QR generation error:', e);
        }
    };

    const shareViaWhatsApp = () => {
        const text = encodeURIComponent(`הצטרף/י למשפחת "${family.name}" באפליקציית רשימת הקניות שלנו!\n\nקוד הצטרפות: ${family.code}\n\nאו לחץ על הקישור:\n${inviteLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent(`הזמנה להצטרף למשפחת ${family.name}`);
        const body = encodeURIComponent(`שלום!\n\nאני מזמין אותך להצטרף למשפחת "${family.name}" באפליקציית רשימת הקניות המשותפת שלנו.\n\nקוד הצטרפות: ${family.code}\n\nאו לחץ על הקישור הבא:\n${inviteLink}\n\nנתראה ברשימה!`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    };

    const handleLeave = async () => {
        await leaveFamily();
        onClose();
    };

    const handleDeleteFamily = async () => {
        await deleteEntireFamily();
        onClose();
    };

    const handleDeleteChild = async (childId) => {
        await deleteChildAccount(childId);
        setDeleteChildId(null);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">👨‍👩‍👧‍👦</span>
                        <span className="text-gradient">{family.name}</span>
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center glass rounded-full text-gray-500 hover:text-red-500 text-2xl hover:scale-110 hover:rotate-90 transition-all">×</button>
                </div>

                {/* Share Code */}
                <div className="glass rounded-xl p-4 mb-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">{t('inviteCode')}</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-indigo-100 dark:bg-indigo-900/50 px-4 py-3 rounded-lg text-center">
                            <span className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{family.code}</span>
                        </div>
                        <button onClick={copyCode} className="btn-gradient text-white px-4 py-3 rounded-lg hover:scale-105 transition-all">
                            {copied ? '✓' : '📋'}
                        </button>
                    </div>
                </div>

                {/* Share Options Button */}
                <button
                    onClick={generateQRCode}
                    className="w-full mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                    <span>📤</span> {t('shareWithFamily')}
                </button>

                {/* Share Options Modal */}
                {showShareOptions && (
                    <div className="glass rounded-xl p-4 mb-4 border-2 border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300">{t('shareOptions')}</h4>
                            <button onClick={() => setShowShareOptions(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {/* QR Code */}
                        {qrCodeUrl && (
                            <div className="flex justify-center mb-4">
                                <div className="bg-white p-3 rounded-xl">
                                    <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                                </div>
                            </div>
                        )}

                        {/* Share Buttons */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <button
                                onClick={shareViaWhatsApp}
                                className="flex flex-col items-center gap-1 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                            >
                                <span className="text-2xl">💬</span>
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">WhatsApp</span>
                            </button>
                            <button
                                onClick={shareViaEmail}
                                className="flex flex-col items-center gap-1 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                            >
                                <span className="text-2xl">📧</span>
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">{t('email')}</span>
                            </button>
                            <button
                                onClick={copyLink}
                                className="flex flex-col items-center gap-1 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                            >
                                <span className="text-2xl">🔗</span>
                                <span className="text-xs font-medium text-purple-700 dark:text-purple-400">{t('copyLink')}</span>
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('scanQR')}</p>
                    </div>
                )}

                {/* Members List */}
                <div className="mb-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">{t('familyMembers')} ({family.members?.length})</h3>
                    <div className="space-y-2">
                        {family.members?.map((member, idx) => (
                            <div key={idx} className="glass rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl">
                                        {member.familyRole === 'parent_father' ? '👨' : member.familyRole === 'parent_mother' ? '👩' : member.familyRole === 'teen' ? '🧑' : member.familyRole === 'child' ? '👦' : member.displayName?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div className="font-medium dark:text-white">{member.displayName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {member.familyRoleLabel || (member.role === 'admin' ? '👑 ' + t('admin') : member.role === 'teen' ? '🧑 ' + t('teen') : t('child'))}
                                            {(member.isParent || member.role === 'admin') && <span className="mr-1 text-green-600">• {t('admin')}</span>}
                                        </div>
                                    </div>
                                </div>
                                {isAdmin && member.userId !== user?.uid && (
                                    <button
                                        onClick={() => removeMember(member.userId)}
                                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors"
                                        title={t('removeMember')}
                                    >
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Child Accounts Section - Admin Only */}
                {isAdmin && (
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <span>👦</span>
                            {t('childAccounts')} ({family.childAccounts?.length || 0})
                        </h3>

                        {/* Child accounts list */}
                        {family.childAccounts?.length > 0 ? (
                            <div className="space-y-2 mb-3">
                                {family.childAccounts.map((child, idx) => (
                                    <div key={idx} className="glass rounded-lg p-3">
                                        {deleteChildId === child.childId ? (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-red-600 dark:text-red-400">{t('deleteChildAccount')}?</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDeleteChild(child.childId)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
                                                    >
                                                        {t('yes')}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteChildId(null)}
                                                        className="glass px-3 py-1 rounded-lg text-sm font-medium"
                                                    >
                                                        {t('no')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xl">
                                                        👦
                                                    </div>
                                                    <div>
                                                        <div className="font-medium dark:text-white">{child.displayName}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {child.pinHash ? '🔐 PIN' : '📱 QR'}
                                                            {child.lastLoginAt && (
                                                                <span className="mr-2">
                                                                    • {new Date(child.lastLoginAt.toDate ? child.lastLoginAt.toDate() : child.lastLoginAt).toLocaleDateString(language)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {child.pinHash && (
                                                        <button
                                                            onClick={() => setShowResetPinModal(child)}
                                                            className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-2 rounded-lg transition-colors"
                                                            title={t('resetPin')}
                                                        >
                                                            🔑
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteChildId(child.childId)}
                                                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors"
                                                        title={t('deleteChildAccount')}
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('noChildAccounts')}</p>
                        )}

                        {/* Add child account buttons */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setShowCreateChildModal(true)}
                                    className="flex items-center justify-center gap-2 py-2 px-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
                                >
                                    <span>➕</span>
                                    {t('addChildAccount')}
                                </button>
                                <button
                                    onClick={() => setShowChildQRModal(true)}
                                    className="flex items-center justify-center gap-2 py-2 px-3 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-lg font-medium hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors text-sm"
                                >
                                    <span>📱</span>
                                    {t('generateChildQR')}
                                </button>
                            </div>

                            {/* Send child join link */}
                            {family.childAccounts?.length > 0 && (
                                <div className="glass rounded-lg p-3 border-2 border-teal-200 dark:border-teal-800">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                                        {t('sendChildLinkDesc') || 'שלח קישור לילד - רק יבחר שם ויזין קוד'}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={copyChildLink}
                                            className="flex items-center justify-center gap-2 py-2 px-3 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg font-medium hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors text-sm"
                                        >
                                            <span>{childLinkCopied ? '✓' : '🔗'}</span>
                                            {childLinkCopied ? t('copied') : t('copyLink')}
                                        </button>
                                        <button
                                            onClick={shareChildLinkWhatsApp}
                                            className="flex items-center justify-center gap-2 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
                                        >
                                            <span>💬</span>
                                            WhatsApp
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Delete Family - Admin only */}
                {isAdmin && (
                    !showDeleteFamilyConfirm ? (
                        <button
                            onClick={() => setShowDeleteFamilyConfirm(true)}
                            className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-3 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            {'🗑 ' + t('deleteFamily')}
                        </button>
                    ) : (
                        <div className="glass rounded-xl p-4 border-2 border-red-300 dark:border-red-700">
                            <p className="text-center text-red-600 dark:text-red-400 mb-2 font-bold text-lg">
                                {t('deleteFamily')}
                            </p>
                            <p className="text-center text-red-500 dark:text-red-400 mb-4 text-sm">
                                {family.members?.length > 1
                                    ? `המשפחה כוללת ${family.members.length} חברים. כל הרשימות, הפריטים וההודעות יימחקו לצמיתות!`
                                    : 'המשפחה תימחק לצמיתות כולל כל הרשימות והפריטים.'}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={handleDeleteFamily} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700">
                                    {t('yes')}, {t('deleteFamily')}
                                </button>
                                <button onClick={() => setShowDeleteFamilyConfirm(false)} className="flex-1 glass py-2 rounded-lg font-semibold">
                                    {t('cancel')}
                                </button>
                            </div>
                        </div>
                    )
                )}

                {/* Leave Family - Non-admin members */}
                {!isAdmin && (
                    !showLeaveConfirm ? (
                        <button
                            onClick={() => setShowLeaveConfirm(true)}
                            className="w-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 py-3 rounded-xl font-semibold hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                        >
                            {'🚪 ' + t('leaveFamily')}
                        </button>
                    ) : (
                        <div className="glass rounded-xl p-4 border-2 border-orange-300 dark:border-orange-700">
                            <p className="text-center text-orange-600 dark:text-orange-400 mb-4 font-medium">
                                בטוח שברצונך לעזוב את המשפחה?
                            </p>
                            <div className="flex gap-2">
                                <button onClick={handleLeave} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600">
                                    {t('yes')}, {t('leaveFamily')}
                                </button>
                                <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 glass py-2 rounded-lg font-semibold">
                                    {t('cancel')}
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Child Account Modals */}
            {showCreateChildModal && (
                <CreateChildAccountModal
                    onClose={() => setShowCreateChildModal(false)}
                    onSuccess={() => {}}
                />
            )}
            {showChildQRModal && (
                <GenerateChildQRModal
                    onClose={() => setShowChildQRModal(false)}
                />
            )}
            {showResetPinModal && (
                <ResetChildPinModal
                    child={showResetPinModal}
                    onClose={() => setShowResetPinModal(null)}
                    onSuccess={() => {}}
                />
            )}
        </div>
    );
}
