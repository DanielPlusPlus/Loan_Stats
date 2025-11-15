import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import './App.css';
import ChartsTab from './components/ChartsTab';
import ChernoffFacesTab from './components/ChernoffFacesTab';
import LanguageSelector from './components/LanguageSelector';
import PredictionsTab from './components/PredictionsTab';
import StatisticsTab from './components/StatisticsTab';
import { LanguageProvider } from './context/LanguageContext';
import useLanguage from './hooks/useLanguage';

const AppContent = () => {
  const { t } = useLanguage();
  return (
    <Container className="py-4 rainbow-layout">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="mb-0">{t('ui_app_title', 'Loan Stats Dashboard')}</h1>
        </Col>
        <Col xs="auto">
          <LanguageSelector />
        </Col>
      </Row>

      <Tabs
        variant="pills"
        defaultActiveKey="statistics"
        className="mb-3 rainbow-tabs"
        mountOnEnter
        unmountOnExit
      >
        <Tab eventKey="statistics" title={t('ui_tab_statistics', 'Statystyki')}>
          <StatisticsTab />
        </Tab>
        <Tab eventKey="predictions" title={t('ui_tab_predictions', 'Predykcje')}>
          <PredictionsTab />
        </Tab>
        <Tab eventKey="charts" title={t('ui_tab_charts', 'Wykresy')}>
          <ChartsTab />
        </Tab>
        <Tab eventKey="chernoff-faces" title={t('ui_tab_chernoff', 'Twarze Chernoffa')}>
          <ChernoffFacesTab />
        </Tab>
      </Tabs>
    </Container>
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
