import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store.js'
import { Provider } from 'react-redux'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key')
}


createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            appearance={{
                variables: {
                    colorPrimary: '#2563eb',
                    colorBackground: '#ffffff',
                    colorInputBackground: '#f8fafc',
                    colorInputText: '#0f172a',
                    colorText: '#0f172a',
                    colorTextSecondary: '#475569',
                    colorInputBorder: '#cbd5e1',
                    colorSuccess: '#16a34a',
                    colorDanger: '#dc2626',
                    borderRadius: '0.9rem',
                    fontFamily: 'Outfit, sans-serif',
                    spacingUnit: '0.75rem',
                },
                elements: {
                    card: 'shadow-2xl shadow-slate-200/60 border border-slate-200/80 bg-white/95 backdrop-blur',
                    headerTitle: 'text-slate-900 text-2xl font-semibold tracking-tight',
                    headerSubtitle: 'text-slate-500',
                    formFieldLabel: 'text-slate-700 font-medium',
                    formFieldInput:
                        'h-11 rounded-xl border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500',
                    formButtonPrimary:
                        'h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500',
                    formButtonSecondary:
                        'h-11 rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50',
                    socialButtonsBlockButton:
                        'h-11 rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50',
                    footerActionLink: 'text-blue-600 hover:text-indigo-600 font-medium',
                    identityPreviewText: 'text-slate-600',
                    identityPreviewEditButton: 'text-blue-600 hover:text-indigo-600',
                    otpCodeFieldInput:
                        'rounded-xl border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-blue-500',
                },
            }}
        >
            <Provider store={store}>
                <App />
            </Provider>
        </ClerkProvider>
    </BrowserRouter>,
)