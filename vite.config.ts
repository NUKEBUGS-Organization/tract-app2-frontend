import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const vendorReact = ['react', 'react-dom', 'react-router-dom']
const vendorQuery = ['@tanstack/react-query', 'axios', 'zustand']
const vendorForms = ['react-hook-form', '@hookform/resolvers', 'zod']
const vendorUi = [
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-select',
  '@radix-ui/react-tabs',
  '@radix-ui/react-tooltip',
  '@radix-ui/react-popover',
  '@radix-ui/react-label',
  '@radix-ui/react-separator',
  '@radix-ui/react-slot',
  '@radix-ui/react-switch',
  '@radix-ui/react-accordion',
  '@radix-ui/react-avatar',
  '@radix-ui/react-progress',
]
const vendorIcons = ['lucide-react']
const vendorSocket = ['socket.io-client']
const vendorUtils = ['dayjs', 'sonner', 'clsx', 'tailwind-merge', 'class-variance-authority']

const chunkMap: Array<{ name: string; pkgs: string[] }> = [
  { name: 'vendor-react', pkgs: vendorReact },
  { name: 'vendor-query', pkgs: vendorQuery },
  { name: 'vendor-forms', pkgs: vendorForms },
  { name: 'vendor-ui', pkgs: vendorUi },
  { name: 'vendor-icons', pkgs: vendorIcons },
  { name: 'vendor-socket', pkgs: vendorSocket },
  { name: 'vendor-utils', pkgs: vendorUtils },
]

function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined
  for (const { name, pkgs } of chunkMap) {
    if (pkgs.some((pkg) => id.includes(`node_modules/${pkg}`))) {
      return name
    }
  }
  return undefined
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
