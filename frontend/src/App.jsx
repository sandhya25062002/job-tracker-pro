import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context'
import AppRoutes from '@/routes/AppRoutes'

/**
 * App.jsx — root component
 *
 * Provider order (outermost → innermost):
 *   BrowserRouter  → router context (must wrap everything using <Link> / hooks)
 *   AuthProvider   → global auth state (login, logout, user, isLoading)
 *   AppRoutes      → route tree (/login, /register, /dashboard)
 *   Toaster        → react-hot-toast notification portal
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />

        <Toaster
          position="bottom-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow:
                '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
              padding: '10px 14px',
            },
            success: {
              duration: 3500,
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              duration: 5000,
              iconTheme: { primary: '#f43f5e', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
