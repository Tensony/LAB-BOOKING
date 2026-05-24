/** Whether a student can cancel this booking */
export const canCancelBooking = (booking) => {
  if (booking.status === 'pending') return true;
  if (booking.status !== 'approved') return false;

  const dateStr = booking.date.split('T')[0];
  const sessionStart = new Date(`${dateStr}T${booking.start_time}`);
  return sessionStart > new Date();
};
