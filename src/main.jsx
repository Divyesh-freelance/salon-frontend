import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 min — don't refetch fresh data
      gcTime: 1000 * 60 * 10,          // keep cache for 10 min
      refetchOnWindowFocus: false,     // KEY: stops a burst of 5–8 requests every tab-switch
      refetchOnReconnect: false,       // don't spam on network flap
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1b1c1c',
              color: '#fbf9f9',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
              borderRadius: '2px',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
