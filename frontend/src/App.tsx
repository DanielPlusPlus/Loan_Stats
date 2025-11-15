import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import './App.css';
import ChernoffFacesTab from './components/ChernoffFacesTab';
import DataTab from './components/DataTab';
import LanguageSelector from './components/LanguageSelector';
import StatisticsMenu from './components/StatisticsMenu';
import { LanguageProvider } from './context/LanguageContext';
import useLanguage from './hooks/useLanguage';

const AppContent = () => {
  const { t } = useLanguage();
  return (
    <div className="container-fluid p-4" style={{ minHeight: '100vh' }}>
      <div className="d-flex justify-content-center align-items-center mb-4 position-relative app-header">
        <h1 className="mb-0">{t('ui_app_title', 'Loan Stats Dashboard')}</h1>
        <div className="position-absolute language-picker-wrapper" style={{ right: 0 }}>
          <LanguageSelector />
        </div>
      </div>

      <Tabs
        variant="pills"
        defaultActiveKey="data"
        className="mb-3 rainbow-tabs d-flex justify-content-center"
        mountOnEnter
        unmountOnExit
      >
        <Tab eventKey="data" title={t('ui_tab_data', 'Dane')}>
          <DataTab />
        </Tab>
        <Tab eventKey="statistics" title={t('ui_tab_statistics', 'Statystyka')}>
          <StatisticsMenu />
        </Tab>
        <Tab eventKey="chernoff-faces" title={t('ui_tab_chernoff_smile', 'Twarze :)')}>
          <ChernoffFacesTab />
        </Tab>
      </Tabs>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
