import { QueryClient, QueryClientProvider } from 'react-query';

import Router from './routes';
import ThemeProvider from './theme';
import ThemeSettings from './components/settings';
import ScrollToTop from './components/ScrollToTop';
import { ProgressBarStyle } from './components/ProgressBar';
import MotionLazyContainer from './components/animate/MotionLazyContainer';
import { SnackbarProvider } from './components/snackbar';

// ----------------------------------------------------------------------

const queryClient = new QueryClient();
window.global = window;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionLazyContainer>
        <ThemeProvider>
          <ThemeSettings>
            <SnackbarProvider>
              <ProgressBarStyle />
              <ScrollToTop />
              <Router />
            </SnackbarProvider>
          </ThemeSettings>
        </ThemeProvider>
      </MotionLazyContainer>
    </QueryClientProvider>
  );
}
