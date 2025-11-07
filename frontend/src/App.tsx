import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import "./App.css";
import { LanguageProvider } from "./context/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";
import StatisticsTab from "./components/StatisticsTab";
import ChartsTab from "./components/ChartsTab";
import ChernoffFacesTab from "./components/ChernoffFacesTab";
import PredictionsTab from "./components/PredictionsTab";

const AppContent = () => (
  <Container className="py-4">
    <Row className="align-items-center mb-4">
      <Col>
        <h1 className="mb-0">Loan Stats Dashboard</h1>
      </Col>
      <Col xs="auto">
        <LanguageSelector />
      </Col>
    </Row>

    <Tabs variant="pills" defaultActiveKey="statistics" className="mb-3">
      <Tab eventKey="statistics" title="Statystyki">
        <StatisticsTab />
      </Tab>
      <Tab eventKey="predictions" title="Predykcje">
        <PredictionsTab />
      </Tab>
      <Tab eventKey="charts" title="Wykresy">
        <ChartsTab />
      </Tab>
      <Tab eventKey="chernoff-faces" title="Twarze Chernoffa">
        <ChernoffFacesTab />
      </Tab>
    </Tabs>
  </Container>
);

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
