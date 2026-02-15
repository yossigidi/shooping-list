import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ISRAELI_HOLIDAYS, getUpcomingHolidays, getHolidayRecommendations } from '../../data/holidays';

export function CalendarModal({ isOpen, onClose, onAddItems }) {
  const { t, isRTL } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const upcomingHolidays = useMemo(() => getUpcomingHolidays(60), []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, holiday: null });
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const holiday = ISRAELI_HOLIDAYS.find(h =>
        h.dateObj.getFullYear() === year &&
        h.dateObj.getMonth() === month &&
        h.dateObj.getDate() === day
      );
      days.push({ day, date, holiday });
    }

    return days;
  }, [currentMonth]);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleHolidayClick = (holiday) => {
    setSelectedHoliday(holiday);
  };

  const handleAddRecommendations = () => {
    if (!selectedHoliday || !onAddItems) return;
    const recommendations = getHolidayRecommendations(selectedHoliday.name);
    onAddItems(recommendations.map(name => ({ name, quantity: 1, unit: 'pcs' })));
    setSelectedHoliday(null);
    onClose();
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
  };

  const weekDays = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl ${isRTL ? 'rtl' : 'ltr'}`}
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">📅</span>
              {t('calendar')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-100px)]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{formatMonth(currentMonth)}</h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {/* Week days header */}
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((item, idx) => (
              <div
                key={idx}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm ${
                  item.day
                    ? item.holiday
                      ? 'bg-blue-100 dark:bg-blue-900/30 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    : ''
                }`}
                onClick={() => item.holiday && handleHolidayClick(item.holiday)}>
                {item.day && (
                  <>
                    <span className={`${item.holiday ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-900 dark:text-white'}`}>
                      {item.day}
                    </span>
                    {item.holiday && (
                      <span className="text-lg">{item.holiday.icon}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Upcoming Holidays */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('upcomingHolidays')}</h4>
            <div className="space-y-2">
              {upcomingHolidays.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noUpcomingHolidays')}</p>
              ) : (
                upcomingHolidays.map((holiday, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHolidayClick(holiday)}
                    className={`w-full p-3 rounded-xl transition-all text-right ${
                      selectedHoliday?.name === holiday.name
                        ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{holiday.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{holiday.name}</span>
                        <span className="text-xl">{holiday.icon}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{holiday.reminder}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Selected Holiday Actions */}
          {selectedHoliday && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{selectedHoliday.icon}</span>
                <h4 className="font-bold text-gray-900 dark:text-white">{selectedHoliday.name}</h4>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t('recommendedProducts')}:</p>
                <div className="flex flex-wrap gap-2">
                  {getHolidayRecommendations(selectedHoliday.name).map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddRecommendations}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                {t('addToList')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarModal;
