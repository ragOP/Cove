export function formatChatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();

  // Helper to zero-pad
  const pad = n => n.toString().padStart(2, '0');

  // Today
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  // This week
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const diff = now - date;
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return days[date.getDay()];
  }

  // Else, show date as DD/MM/YY
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date
    .getFullYear()
    .toString()
    .slice(-2)}`;
}
