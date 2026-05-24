import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const toDateKey = (date) => date.toISOString().split('T')[0];

const SlotWeekPicker = ({ slots, selectedSlot, onSelectSlot }) => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const slotsByDate = useMemo(() => {
    return (slots || []).reduce((acc, slot) => {
      const key = slot.date.split('T')[0];
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    }, {});
  }, [slots]);

  const weekLabel = `${days[0].toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-ZM', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const todayKey = toDateKey(new Date());

  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="p-2 rounded-xl hover:bg-surface-100 text-slate-600 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-medium text-slate-700">{weekLabel}</p>
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="p-2 rounded-xl hover:bg-surface-100 text-slate-600 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {days.map((day) => {
          const key = toDateKey(day);
          const daySlots = slotsByDate[key] || [];
          const isToday = key === todayKey;
          const isPast = day < new Date(todayKey);

          return (
            <div
              key={key}
              className={`min-h-[100px] rounded-xl border p-1.5 md:p-2 ${
                isToday ? 'border-brand-300 bg-brand-50/50' : 'border-surface-200 bg-white'
              } ${isPast ? 'opacity-60' : ''}`}
            >
              <p className={`text-[10px] md:text-xs font-medium text-center mb-1.5 ${isToday ? 'text-brand-700' : 'text-slate-500'}`}>
                <span className="hidden sm:inline">{day.toLocaleDateString('en-ZM', { weekday: 'short' })} </span>
                {day.getDate()}
              </p>
              <div className="space-y-1">
                {daySlots.length === 0 ? (
                  <p className="text-[10px] text-slate-300 text-center py-2">—</p>
                ) : (
                  daySlots.map((slot) => {
                    const full = parseInt(slot.booked_count) >= slot.max_bookings;
                    const selected = selectedSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={full || isPast}
                        onClick={() => onSelectSlot(selected ? null : slot)}
                        className={`w-full rounded-lg px-1 py-1 text-[10px] md:text-xs leading-tight transition-all ${
                          full || isPast
                            ? 'bg-surface-100 text-slate-400 cursor-not-allowed'
                            : selected
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'bg-surface-50 text-slate-700 hover:bg-brand-50 hover:text-brand-800 border border-surface-200'
                        }`}
                      >
                        <Clock size={9} className="inline mr-0.5 opacity-70" />
                        {slot.start_time.slice(0, 5)}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlotWeekPicker;
