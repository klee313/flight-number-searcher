import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import SettingsPage from '@/pages/SettingsPage';
import { useSearchStore } from '@/stores/useSearchStore';

function App() {
  const resetSearch = useSearchStore((state) => state.reset);

  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const hasSearchParams = url.searchParams.has('date') &&
        url.searchParams.has('airline') &&
        url.searchParams.has('origin') &&
        url.searchParams.has('destination');

      if (!hasSearchParams) {
        resetSearch();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [resetSearch]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
