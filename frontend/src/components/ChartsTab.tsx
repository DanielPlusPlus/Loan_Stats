import axios from 'axios';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import useLanguage from '../hooks/useLanguage';
import api from '../services/api';

interface ChartDefinition {
  id: string;
  endpoint: string;
  labelKey: string;
  descriptionKey?: string;
}

const CHARTS: ChartDefinition[] = [
  {
    id: 'income-hist',
    endpoint: '/income-hist',
    labelKey: 'chart_income_hist_label',
    descriptionKey: 'chart_income_hist_description',
  },
  {
    id: 'credit-vs-loan',
    endpoint: '/credit-vs-loan',
    labelKey: 'chart_credit_vs_loan_label',
  },
  {
    id: 'employment-box',
    endpoint: '/employment-box',
    labelKey: 'chart_employment_box_label',
  },
  {
    id: 'corr-heatmap',
    endpoint: '/corr-heatmap',
    labelKey: 'chart_corr_heatmap_label',
  },
  {
    id: 'income-vs-score',
    endpoint: '/income-vs-score',
    labelKey: 'chart_income_vs_score_label',
  },
  {
    id: 'income-vs-years',
    endpoint: '/income-vs-years',
    labelKey: 'chart_income_vs_years_label',
  },
  {
    id: 'credit-violin',
    endpoint: '/credit-violin',
    labelKey: 'chart_credit_violin_label',
  },
  {
    id: 'avg-income-by-city',
    endpoint: '/avg-income-by-city',
    labelKey: 'chart_avg_income_by_city_label',
  },
  {
    id: 'pairplot-main',
    endpoint: '/pairplot-main',
    labelKey: 'chart_pairplot_main_label',
  },
  {
    id: 'loan-amount-box',
    endpoint: '/loan-amount-box',
    labelKey: 'chart_loan_amount_box_label',
  },
  {
    id: 'credit-score-hist',
    endpoint: '/credit-score-hist',
    labelKey: 'chart_credit_score_hist_label',
  },
  {
    id: 'income-hist-density',
    endpoint: '/income-hist-density',
    labelKey: 'chart_income_hist_density_label',
  },
  {
    id: 'income-box',
    endpoint: '/income-box',
    labelKey: 'chart_income_box_label',
  },
  {
    id: 'income-ecdf',
    endpoint: '/income-ecdf',
    labelKey: 'chart_income_ecdf_label',
  },
  {
    id: 'income-frequency',
    endpoint: '/income-frequency',
    labelKey: 'chart_income_frequency_label',
  },
  {
    id: 'income-relative-frequency',
    endpoint: '/income-relative-frequency',
    labelKey: 'chart_income_relative_frequency_label',
  },
  {
    id: 'loan-pie',
    endpoint: '/loan-pie',
    labelKey: 'chart_loan_pie_label',
  },
  {
    id: 'loan-group-means',
    endpoint: '/loan-group-means',
    labelKey: 'chart_loan_group_means_label',
  },
  {
    id: 'income-radar',
    endpoint: '/income-radar',
    labelKey: 'chart_income_radar_label',
  },
  {
    id: 'age-pyramid',
    endpoint: '/age-pyramid',
    labelKey: 'chart_age_pyramid_label',
  },
  {
    id: 'income-line',
    endpoint: '/income-line',
    labelKey: 'chart_income_line_label',
  },
  {
    id: 'kurtosis-comparison',
    endpoint: '/kurtosis-comparison',
    labelKey: 'chart_kurtosis_comparison_label',
  },
];

const extractErrorMessage = (
  error: unknown,
  t: (key: string, fallback?: string) => string
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (typeof data?.error === 'string') {
      return data.error;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return t('chart_failed_to_fetch', 'Nie udało się pobrać wykresu.');
};

const ChartsTab = () => {
  const { language, t } = useLanguage();
  const [selectedChart, setSelectedChart] = useState<string>(CHARTS[0]?.id ?? '');
  const [chartSrc, setChartSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(
    async (chartId: string) => {
      if (!chartId) {
        setChartSrc(null);
        return;
      }

      setLoading(true);
      setError(null);

      const definition = CHARTS.find((chart) => chart.id === chartId);
      if (!definition) {
        setLoading(false);
        setChartSrc(null);
        setError(t('chart_unknown_chart', 'Nieznany wykres.'));
        return;
      }

      try {
        const response = await api.get(definition.endpoint, {
          params: { language },
          responseType: 'blob',
        });

        const imageUrl = URL.createObjectURL(response.data);
        setChartSrc(imageUrl);
      } catch (requestError) {
        setChartSrc(null);
        setError(extractErrorMessage(requestError, t));
      } finally {
        setLoading(false);
      }
    },
    [language, t]
  );

  useEffect(() => {
    if (selectedChart) {
      void fetchChart(selectedChart);
    }

    return () => {
      if (chartSrc && chartSrc.startsWith('blob:')) {
        URL.revokeObjectURL(chartSrc);
      }
    };
  }, [fetchChart, selectedChart]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedChart(event.target.value);
  };

  const selectedDefinition = CHARTS.find((chart) => chart.id === selectedChart);

  return (
    <section>
      <Row className="gy-3">
        <Col md={4} lg={3}>
          <Card>
            <Card.Header>{t('chart_select_chart', 'Wybierz wykres')}</Card.Header>
            <Card.Body>
              <Form.Group controlId="chart-selector">
                <Form.Select value={selectedChart} onChange={handleChange}>
                  {CHARTS.map((chart) => (
                    <option key={chart.id} value={chart.id}>
                      {t(chart.labelKey, chart.id)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {selectedDefinition?.descriptionKey && (
                <small className="text-muted d-block mt-2">
                  {t(selectedDefinition.descriptionKey, '')}
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={8} lg={9}>
          <Card className="h-100">
            <Card.Header>{t('chart_preview', 'Podgląd')}</Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              {loading ? (
                <Spinner animation="border" role="status" />
              ) : error ? (
                <Alert variant="danger" className="w-100 text-center">
                  {error}
                </Alert>
              ) : chartSrc ? (
                <Image src={chartSrc} alt={t(selectedDefinition?.labelKey ?? '', 'Wykres')} fluid />
              ) : (
                <span>{t('chart_select_to_display', 'Wybierz wykres, aby go wyświetlić.')}</span>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default ChartsTab;
