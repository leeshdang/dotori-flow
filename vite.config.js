import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function getDotoriVersion() {
  const now = new Date();
  // KST is UTC+9
  const kst = new Date(now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60000);
  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, '0');
  const dd = String(kst.getDate()).padStart(2, '0');
  const hh = String(kst.getHours()).padStart(2, '0');
  const min = String(kst.getMinutes()).padStart(2, '0');
  return `DF-${yyyy}${mm}${dd}_${hh}${min}`;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(getDotoriVersion())
  }
})

