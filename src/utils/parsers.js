export const parseFIO = (fio) => {
  const parts = fio.trim().split(/\s+/);
  return {
    last_name: parts[0] || '',
    first_name: parts.slice(1).join(' ') || ' '
  };
};