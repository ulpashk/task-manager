export const formatPhoneNumber = (phoneNumberString) => {
  if (!phoneNumberString) return '—';

  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    const standard = cleaned.startsWith('8') ? '7' + cleaned.substring(1) : cleaned;
    
    const match = standard.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
  }

  return phoneNumberString;
};