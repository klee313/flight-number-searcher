import { useEffect } from 'react';
import { Settings } from 'lucide-react';
import SearchForm from './components/search/SearchForm';
import FlightList from './components/results/FlightList';
import SettingsModal from './components/settings/SettingsModal';
import FlightDetailModal from './components/details/FlightDetailModal';
import { t } from './data/locales';
import { PROVIDER } from './services/api';
import { qs } from './utils/utils';
import { useSettingsStore } from './stores/useSettingsStore';
import { useUIStore } from './stores/useUIStore';
import { useSearchStore } from './stores/useSearchStore';

function App() {
  const { apiKey } = useSettingsStore();
  const { openSettings } = useUIStore();
  const { criteria, searchFlights } = useSearchStore();

  // Initial Search from URL
  useEffect(() => {
    const date = qs.get('date');
    const airline = qs.get('airline');
    const origin = qs.get('origin');
    const destination = qs.get('destination');

    if (date && airline && origin && destination) {
      searchFlights({ date, airline, origin, destination }, apiKey);
    }
  }, []);

  return (
    <>
      <header>
        <h1><span className="dot"></span> {t('title')}</h1>
        <button
          className="icon-btn"
          title="Settings"
          onClick={openSettings}
        >
          <Settings size={24} />
        </button>
      </header>

      <div className="container">
        <SearchForm />

        <section id="result-section" className="panel">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div id="criteria" className="list" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {criteria && (
                <>
                  <span className="chip">{t('datePrefix')}: {criteria.date}</span>
                  <span className="chip">{t('airlinePrefix')}: {criteria.airline}</span>
                  <span className="chip">{t('routePrefix')}: {criteria.origin}→{criteria.destination}</span>
                  <span className="chip">{t('providerPrefix')}: {PROVIDER}</span>
                </>
              )}
            </div>
          </div>
          <div className="divider"></div>
          <FlightList />
        </section>

        <footer>
          <small>{t('footerText')}</small>
        </footer>
      </div>

      <SettingsModal />
      <FlightDetailModal />
    </>
  );
}

export default App;
