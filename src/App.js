import { QueryClient, QueryClientProvider } from 'react-query';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ThemeSettings from './components/settings';
import ScrollToTop from './components/ScrollToTop';
import { ProgressBarStyle } from './components/ProgressBar';
import MotionLazyContainer from './components/animate/MotionLazyContainer';

// ----------------------------------------------------------------------

const queryClient = new QueryClient();
window.global = window;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionLazyContainer>
        <ThemeProvider>
          <ThemeSettings>
            <ProgressBarStyle />
            <ScrollToTop />
            <Router />
          </ThemeSettings>
        </ThemeProvider>
      </MotionLazyContainer>
    </QueryClientProvider>
  );
}
