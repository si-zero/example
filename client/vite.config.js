import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',  // 상대경로로 바꾸면 빌드나 개발 서버에서 경로 문제 완화됨
})