// src/utils/getBaseDateTime.js
export const getBaseDateTime = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const base_date = `${yyyy}${mm}${dd}`;

  const minutes = now.getMinutes();
  let hour = now.getHours();

  let base_time = '';
  if (minutes < 30) {
    hour -= 1;
  }
  base_time = `${String(hour).padStart(2, '0')}30`;

  return { base_date, base_time };
};