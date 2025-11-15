import { useEffect, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import useLanguage from '../hooks/useLanguage';
import type { ApiResponse } from '../interfaces/Loan';
import api from '../services/api';

interface PrognosisDetails {
  source_rows: number;
  total_count: number;
  numeric: Record<string, { samples: number[]; mu: number; sigma: number; distribution: string }>;
  categorical: Record<
    string,
    { samples: (string | number | boolean)[]; choices: (string | number | boolean)[] }
  >;
}

const PrognosisProcessPanel = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<PrognosisDetails | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiResponse<PrognosisDetails>>('/prognosis-process');
        if (!res.data.success) throw new Error(res.data.error ?? 'Bad response');
        setDetails(res.data.result);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center mt-3">
        <Spinner animation="border" role="status" size="sm" className="me-2" />
        <span>{t('stats_loading', 'Wczytywanie parametrów...')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className="mt-3">
        {error}
      </Alert>
    );
  }

  if (!details) return null;

  return (
    <Card className="mt-3">
      <Card.Header>{t('prognosis_process_header', 'Proces tworzenia danych prognozy')}</Card.Header>
      <Card.Body>
        <p className="mb-2">
          {t('prognosis_process_summary', 'Na podstawie pierwszych {rows} rekordów.').replace(
            '{rows}',
            String(details.source_rows)
          )}
        </p>
        <Accordion alwaysOpen>
          <Accordion.Item eventKey="numeric">
            <Accordion.Header>
              {t('prognosis_numeric_params', 'Parametry numeryczne')}
            </Accordion.Header>
            <Accordion.Body>
              <div className="small text-muted mb-3 fst-italic">
                {t(
                  'prognosis_param_mu',
                  'μ (średnia) - wartość centralna rozkładu, wokół której generowane są nowe dane'
                )}
                <br />
                {t(
                  'prognosis_param_sigma',
                  'σ (odchylenie standardowe) - rozrzut danych, określa jak bardzo wartości różnią się od średniej'
                )}
                <br />
                {t(
                  'prognosis_param_samples_info',
                  'Próbki - przykładowe wartości wygenerowane z tego rozkładu dla nowych rekordów'
                )}
              </div>
              <ListGroup>
                {Object.entries(details.numeric).map(([col, info]) => (
                  <ListGroup.Item key={col}>
                    <div className="fw-semibold">{col}</div>
                    <div className="small text-muted mb-1">
                      {t('prognosis_distribution', 'Rozkład')}:{' '}
                      {t(`dist_type_${info.distribution}`, info.distribution)}
                    </div>
                    <div className="small">
                      μ = {info.mu.toFixed(4)}, σ = {info.sigma.toFixed(4)}
                    </div>
                    <div className="small">
                      {t('prognosis_samples', 'Próbki')}:{' '}
                      {info.samples.map((v) => v.toFixed(2)).join(', ')}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="categorical">
            <Accordion.Header>
              {t('prognosis_categorical_params', 'Parametry kategoryczne')}
            </Accordion.Header>
            <Accordion.Body>
              <ListGroup>
                {Object.entries(details.categorical).map(([col, info]) => (
                  <ListGroup.Item key={col}>
                    <div className="fw-semibold">{col}</div>
                    <div className="small">
                      {t('prognosis_samples', 'Próbki')}: {info.samples.join(', ')}
                    </div>
                    <div className="small">
                      {t('prognosis_choices', 'Możliwe wartości')}: {info.choices.join(', ')}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default PrognosisProcessPanel;
