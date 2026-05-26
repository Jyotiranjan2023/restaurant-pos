import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify('rzp_test_St55psKycuDXog'),
  },
})