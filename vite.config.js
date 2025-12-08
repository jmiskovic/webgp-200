import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  base: '/webgp-200/',
  server: {
    https: { // often browsers don't allow webMIDI if not using https
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem'),
    },
    host: '0.0.0.0',
    port: 5173
  }
})