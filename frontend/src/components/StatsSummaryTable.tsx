import { useEffect, useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import useLanguage from '../hooks/useLanguage';
import type { ApiResponse } from '../interfaces/Loan';
import api from '../services/api';

const NUMERIC_COLUMNS: Array<{ key: string; labelKey: string; fallback: string }> = [
  { key: 'credit_score', labelKey: 'data_col_credit_score', fallback: 'Credit Rating' },
  { key: 'income', labelKey: 'data_col_income', fallback: 'Income' },
  { key: 'loan_amount', labelKey: 'data_col_loan_amount', fallback: 'Loan amount' },
  { key: 'points', labelKey: 'data_col_points', fallback: 'Points' },
  { key: 'years_employed', labelKey: 'data_col_years_employed', fallback: 'Years employed' },
];

const METRICS: Array<{ key: string; labelKey: string; fallback: string }> = [
  { key: 'mean', labelKey: 'stats_mean', fallback: 'Mean' },
  { key: 'median', labelKey: 'stats_median', fallback: 'Median' },
  { key: 'mode', labelKey: 'stats_mode', fallback: 'Mode' },
  { key: 'sum', labelKey: 'stats_sum', fallback: 'Sum' },
  { key: 'deviation', labelKey: 'stats_std_dev', fallback: 'Std. deviation' },
  { key: 'skewness', labelKey: 'stats_skewness', fallback: 'Skewness' },
  { key: 'kurtosis', labelKey: 'stats_kurtosis', fallback: 'Kurtosis' },
  { key: 'Q1', labelKey: 'stats_q1', fallback: 'Quartile Q1' },
  { key: 'Q2', labelKey: 'stats_q2', fallback: 'Quartile Q2' },
  { key: 'Q3', labelKey: 'stats_q3', fallback: 'Quartile Q3' },
];

const DEFAULT_LOCALE_MAP: Record<string, string> = {
  pl: 'pl-PL',
  en: 'en-US',
  de: 'de-DE',
  zh: 'zh-CN',
  ko: 'ko-KR',
};

const formatNumber = (v: unknown, locale: string) => {
  if (typeof v === 'number')
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(v);
  if (v === null || v === undefined) return '-';
  return String(v);
};

interface SummaryResponse {
  mean: Record<string, number>;
  median: Record<string, number>;
  mode: Record<string, number | string | null>;
  sum: Record<string, number>;
  deviation: Record<string, number>;
  skewness: Record<string, number>;
  kurtosis: Record<string, number>;
  Q1: Record<string, number>;
  Q2: Record<string, number>;
  Q3: Record<string, number>;
}

const StatsSummaryTable = ({ mode }: { mode: 'normal' | 'prognosis' | 'merged' }) => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  const locale = useMemo(() => DEFAULT_LOCALE_MAP[language] ?? 'pl-PL', [language]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiResponse<SummaryResponse>>('/summary', {
          params: { mode },
        });
        if (!res.data.success) throw new Error(res.data.error ?? 'Bad response');
        setSummary(res.data.result);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : t('error_unexpected', 'Wystąpił nieoczekiwany błąd.');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [language, mode, t]);

  return (
    <Card>
      <Card.Header>{t('ui_subtab_tables', 'Tabele')}</Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex align-items-center">
            <Spinner animation="border" role="status" size="sm" className="me-2" />
            <span>{t('stats_loading', 'Wczytywanie parametrów...')}</span>
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">
            {error}
          </Alert>
        ) : summary ? (
          <Table striped bordered responsive size="sm" className="mb-0">
            <thead>
              <tr>
                <th></th>
                {NUMERIC_COLUMNS.map((c) => (
                  <th key={c.key}>{t(c.labelKey, c.fallback)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{t(row.labelKey, row.fallback)}</th>
                  {NUMERIC_COLUMNS.map((c) => (
                    <td key={c.key}>{formatNumber(summary[row.key as keyof SummaryResponse]?.[c.key], locale)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : null}
      </Card.Body>
    </Card>
  );
};

export default StatsSummaryTable;
