import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: process.env.BASE_PATH || '/',
    plugins: [react()],
    server: {
        port: 5198,
        proxy: {
            '/api': {
                target: 'http://localhost:5199',
                changeOrigin: true,
            },
        },
    },
});
