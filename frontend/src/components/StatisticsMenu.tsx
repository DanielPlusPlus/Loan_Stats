import { useState } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ToggleButton from 'react-bootstrap/ToggleButton';
import useLanguage from '../hooks/useLanguage';
import ChartsTab from './ChartsTab';
import StatsDiffTable from './StatsDiffTable';
import StatsSummaryTable from './StatsSummaryTable';

type Mode = 'normal' | 'prognosis' | 'merged';

const StatisticsMenu = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('normal');

  return (
    <section className="container-fluid px-0">
      <Card>
        <Card.Header className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <span className="text-nowrap">{t('ui_tab_statistics', 'Statystyka')}</span>
          <ButtonGroup>
            <ToggleButton
              id="mode-normal"
              type="radio"
              variant={mode === 'normal' ? 'primary' : 'outline-primary'}
              name="mode"
              value="normal"
              checked={mode === 'normal'}
              onChange={() => setMode('normal')}
              size="sm"
            >
              {t('ui_mode_normal', 'Normalne')}
            </ToggleButton>
            <ToggleButton
              id="mode-prognosis"
              type="radio"
              variant={mode === 'prognosis' ? 'primary' : 'outline-primary'}
              name="mode"
              value="prognosis"
              checked={mode === 'prognosis'}
              onChange={() => setMode('prognosis')}
              size="sm"
            >
              {t('ui_mode_prognosis', 'Prognoza')}
            </ToggleButton>
            <ToggleButton
              id="mode-merged"
              type="radio"
              variant={mode === 'merged' ? 'primary' : 'outline-primary'}
              name="mode"
              value="merged"
              checked={mode === 'merged'}
              onChange={() => setMode('merged')}
              size="sm"
            >
              {t('ui_mode_merged', 'Połączone')}
            </ToggleButton>
          </ButtonGroup>
        </Card.Header>
        <Card.Body>
          <Tabs
            defaultActiveKey="tables"
            id="statistics-subtabs"
            className="mb-3"
            mountOnEnter
            unmountOnExit
          >
            <Tab eventKey="tables" title={t('ui_subtab_tables', 'Tabele')}>
              <StatsSummaryTable mode={mode} />
              <StatsDiffTable />
            </Tab>
            <Tab eventKey="charts" title={t('ui_subtab_charts', 'Wykresy')}>
              <ChartsTab mode={mode} />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </section>
  );
};

export default StatisticsMenu;
