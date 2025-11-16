import axios from 'axios';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import useLanguage from '../hooks/useLanguage';
import api from '../services/api';

interface ChartDefinition {
  id: string;
  endpoint: string;
  labelKey: string;
  descriptionKey?: string;
  description?: string;
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
    descriptionKey: 'chart_income_hist_density_subtitle',
    description: 'Density of income divided by credit decision.',
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
  {
    id: 'dist-normal',
    endpoint: '/dist-normal',
    labelKey: 'chart_normal_dist_label',
  },
  {
    id: 'dist-student-t',
    endpoint: '/dist-student-t',
    labelKey: 'chart_student_t_dist_label',
  },
  {
    id: 'quantiles-distance',
    endpoint: '/quantiles-distance',
    labelKey: 'chart_quantiles_distance_label',
  },
];

const NUMERIC_COLUMNS: Array<{ key: string; labelKey: string; fallback: string }> = [
  { key: 'income', labelKey: 'data_col_income', fallback: 'Income' },
  { key: 'loan_amount', labelKey: 'data_col_loan_amount', fallback: 'Loan amount' },
  { key: 'credit_score', labelKey: 'data_col_credit_score', fallback: 'Credit Rating' },
  { key: 'years_employed', labelKey: 'data_col_years_employed', fallback: 'Years employed' },
  { key: 'points', labelKey: 'data_col_points', fallback: 'Points' },
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

type Mode = 'normal' | 'prognosis' | 'merged';

const ChartsTab = ({ mode = 'normal' }: { mode?: Mode }) => {
  const { language, t } = useLanguage();
  const [selectedChart, setSelectedChart] = useState<string>(CHARTS[0]?.id ?? '');
  const [chartSrc, setChartSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [descLoading, setDescLoading] = useState<boolean>(false);
  const [descError, setDescError] = useState<string | null>(null);
  const [qdColumn, setQdColumn] = useState<string>('income');
  const [qdCompare, setQdCompare] = useState<boolean>(false);

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
        const params: Record<string, string | boolean> = { language, mode };
        if (chartId === 'quantiles-distance') {
          params.column = qdColumn;
          params.compare = qdCompare;
        }
        const response = await api.get(definition.endpoint, {
          params,
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
    [language, mode, qdColumn, qdCompare, t]
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

  const fetchDescription = useCallback(
    async (chartId: string) => {
      if (!chartId) {
        setDescription('');
        return;
      }

      setDescLoading(true);
      setDescError(null);
      try {
        const params: Record<string, string | boolean> = { chart: chartId, language };
        if (chartId === 'quantiles-distance') {
          params.column = qdColumn;
          params.compare = qdCompare;
        }
        const res = await api.get('/chart-description', { params });
        if (
          res.data &&
          res.data.success &&
          res.data.result &&
          typeof res.data.result.description === 'string'
        ) {
          setDescription(res.data.result.description);
        } else {
          setDescription('');
        }
      } catch (e) {
        setDescError(extractErrorMessage(e, t));
        setDescription('');
      } finally {
        setDescLoading(false);
      }
    },
    [language, qdColumn, qdCompare, t]
  );

  useEffect(() => {
    if (selectedChart) {
      void fetchDescription(selectedChart);
    } else {
      setDescription('');
    }
  }, [fetchDescription, selectedChart]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedChart(event.target.value);
  };

  const selectedDefinition = CHARTS.find((chart) => chart.id === selectedChart);

  return (
    <section className="container-fluid px-0">
      <Card>
        <Card.Header>{t('charts_title', 'Wykresy')}</Card.Header>
        <Card.Body>
          <div className="mb-3" style={{ width: '100%' }}>
            <Form.Group controlId="chart-selector" style={{ maxWidth: 520, margin: '0 auto' }}>
              <Form.Label className="fw-semibold">
                {t('chart_select_chart', 'Wybierz wykres')}
              </Form.Label>
              <Form.Select value={selectedChart} onChange={handleChange}>
                {CHARTS.map((chart) => (
                  <option key={chart.id} value={chart.id}>
                    {t(chart.labelKey, chart.id)}
                  </option>
                ))}
              </Form.Select>
              {selectedChart === 'quantiles-distance' ? (
                <>
                  <div className="mt-3">
                    <Form.Group controlId="qd-column" className="mb-3">
                      <Form.Label className="fw-semibold">
                        {t('chart_quantiles_distance_select_column', 'Select column')}
                      </Form.Label>
                      <Form.Select value={qdColumn} onChange={(e) => setQdColumn(e.target.value)}>
                        {NUMERIC_COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {t(c.labelKey, c.fallback)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="qd-compare" className="mb-2">
                      <Form.Check
                        type="switch"
                        label={t('chart_compare_overlay', 'Compare (overlay Normal vs Prognosis)')}
                        checked={qdCompare}
                        onChange={(e) => setQdCompare(e.currentTarget.checked)}
                      />
                    </Form.Group>
                    <div style={{ minHeight: 22 }}>
                      {descLoading ? (
                        <small className="text-muted">
                          {t('chart_desc_loading', 'Loading description...')}
                        </small>
                      ) : descError ? (
                        <small className="text-danger">{descError}</small>
                      ) : description ? (
                        <small className="text-muted d-block" style={{ whiteSpace: 'pre-line' }}>
                          {description}
                        </small>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-2" style={{ minHeight: 22 }}>
                  {descLoading ? (
                    <small className="text-muted">
                      {t('chart_desc_loading', 'Loading description...')}
                    </small>
                  ) : descError ? (
                    <small className="text-danger">{descError}</small>
                  ) : description ? (
                    <small className="text-muted d-block" style={{ whiteSpace: 'pre-line' }}>
                      {description}
                    </small>
                  ) : null}
                </div>
              )}
            </Form.Group>
          </div>

          <div
            className="w-100 d-flex align-items-center justify-content-center"
            style={{ minHeight: 360 }}
          >
            {loading ? (
              <Spinner animation="border" role="status" />
            ) : error ? (
              <Alert variant="danger" className="w-100 text-center mx-2">
                {error}
              </Alert>
            ) : chartSrc ? (
              <Image
                src={chartSrc}
                alt={t(selectedDefinition?.labelKey ?? '', 'Wykres')}
                fluid
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
              />
            ) : (
              <span>{t('chart_select_to_display', 'Wybierz wykres, aby go wyświetlić.')}</span>
            )}
          </div>
        </Card.Body>
      </Card>
    </section>
  );
};

export default ChartsTab;
