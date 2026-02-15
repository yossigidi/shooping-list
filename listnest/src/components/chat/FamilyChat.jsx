import { useState, useEffect, useRef } from 'react';
import { useFamily } from '../../contexts/FamilyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db, firestore } from '../../services/firebase';

export function FamilyChat({ isOpen, onClose }) {
  const { family, activeUser } = useFamily();
  const { t, isRTL } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Subscribe to chat messages
  useEffect(() => {
    if (!family?.id || !isOpen) return;

    const chatRef = firestore.collection(db, 'family-chat');
    const q = firestore.query(
      chatRef,
      firestore.where('familyId', '==', family.id),
      firestore.orderBy('timestamp', 'asc'),
      firestore.limit(100)
    );

    const unsubscribe = firestore.onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach(doc => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error('Chat subscription error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [family?.id, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !family?.id || !activeUser || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await firestore.addDoc(firestore.collection(db, 'family-chat'), {
        familyId: family.id,
        text: messageText,
        senderId: activeUser.uid,
        senderName: activeUser.displayName || 'אנונימי',
        timestamp: firestore.serverTimestamp(),
        type: 'text'
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText); // Restore message on error
    }

    setSending(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'היום';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'אתמול';
    }
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const dateKey = message.timestamp ? formatDate(message.timestamp) : 'היום';
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
         onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 w-full sm:max-w-lg h-[85vh] sm:h-[600px] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h2 className="font-bold text-lg">{t('familyChat')}</h2>
              <p className="text-sm text-white/80">{family?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <span className="text-5xl mb-4">💬</span>
              <p className="text-lg font-medium">{t('noMessages')}</p>
              <p className="text-sm">{t('startConversation')}</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                    {date}
                  </span>
                </div>

                {/* Messages for this date */}
                {dateMessages.map((message) => {
                  const isOwn = message.senderId === activeUser?.uid;
                  const isReminder = message.type === 'reminder';

                  if (isReminder) {
                    return (
                      <div key={message.id} className="flex justify-center my-2">
                        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                          <span>🔔</span>
                          <span>{message.text}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-start' : 'justify-end'} mb-2`}>
                      <div className={`max-w-[75%] ${isOwn ? 'order-1' : 'order-2'}`}>
                        {!isOwn && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 mx-2">
                            {message.senderName}
                          </p>
                        )}
                        <div className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-purple-500 text-white rounded-br-sm'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm shadow'
                        }`}>
                          {message.imageUrl && (
                            <img
                              src={message.imageUrl}
                              alt="Shared image"
                              className="max-w-full rounded-lg mb-2"
                            />
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('typeMessage')}
              className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {sending ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FamilyChat;
