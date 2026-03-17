export const formatPhoneNumber = (phoneNumberString) => {
  if (!phoneNumberString) return '—';

  // Оставляем только цифры
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  
  // Если это стандартный 11-значный номер (начинается с 8 или 7)
  if (cleaned.length === 11) {
    // Заменяем начальную 8 на 7 для единообразия
    const standard = cleaned.startsWith('8') ? '7' + cleaned.substring(1) : cleaned;
    
    const match = standard.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
  }

  // Если номер короче (например, городской 6-значный), просто возвращаем как есть или добавляем код
  return phoneNumberString;
};