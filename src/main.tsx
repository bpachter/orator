import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import App from './App'
import { ThemeModeProvider } from './state/themeMode'
import { FilterProvider } from './state/filters'
import { SavedViewsProvider } from './state/savedViews'
import { CompareListProvider } from './state/compareList'
import { CustomDashboardsProvider } from './state/customDashboards'
import { initTelemetry } from './utils/telemetry'
import './index.css'

initTelemetry()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <QueryClientProvider client={queryClient}>
        <FilterProvider>
          <SavedViewsProvider>
            <CompareListProvider>
              <CustomDashboardsProvider>
                <App />
              </CustomDashboardsProvider>
            </CompareListProvider>
          </SavedViewsProvider>
        </FilterProvider>
      </QueryClientProvider>
    </ThemeModeProvider>
  </React.StrictMode>,
)
