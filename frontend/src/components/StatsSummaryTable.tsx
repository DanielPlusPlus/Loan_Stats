import { useEffect, useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import useLanguage from '../hooks/useLanguage';
import type { ApiResponse } from '../interfaces/Loan';
import api from '../services/api';

const NUMERIC_COLUMNS: Array<{ key: string; labelKey: string; fallback: string }> = [
  { key: 'credit_score', labelKey: 'data_col_credit_score', fallback: 'Credit score' },
  { key: 'income', labelKey: 'data_col_income', fallback: 'Income' },
  { key: 'loan_amount', labelKey: 'data_col_loan_amount', fallback: 'Loan amount' },
  { key: 'points', labelKey: 'data_col_points', fallback: 'Points' },
  { key: 'years_employed', labelKey: 'data_col_years_employed', fallback: 'Years employed' },
];

const STAT_ROWS: Array<{ key: string; labelKey: string; fallback: string; endpoint: string }> = [
  { key: 'mean', labelKey: 'stats_mean', fallback: 'Mean', endpoint: '/mean' },
  { key: 'median', labelKey: 'stats_median', fallback: 'Median', endpoint: '/median' },
  { key: 'mode', labelKey: 'stats_mode', fallback: 'Mode', endpoint: '/mode' },
  { key: 'sum', labelKey: 'stats_sum', fallback: 'Sum', endpoint: '/sum' },
  {
    key: 'deviation',
    labelKey: 'stats_std_dev',
    fallback: 'Std. deviation',
    endpoint: '/deviation',
  },
  { key: 'skewness', labelKey: 'stats_skewness', fallback: 'Skewness', endpoint: '/skewness' },
  { key: 'kurtosis', labelKey: 'stats_kurtosis', fallback: 'Kurtosis', endpoint: '/kurtosis' },
  { key: 'q1', labelKey: 'stats_q1', fallback: 'Quartile Q1', endpoint: '/quartiles' },
  { key: 'q2', labelKey: 'stats_q2', fallback: 'Quartile Q2', endpoint: '/quartiles' },
  { key: 'q3', labelKey: 'stats_q3', fallback: 'Quartile Q3', endpoint: '/quartiles' },
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

const StatsSummaryTable = ({ mode }: { mode: 'normal' | 'prognosis' | 'merged' }) => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, Record<string, unknown>>>({});

  const locale = useMemo(() => DEFAULT_LOCALE_MAP[language] ?? 'pl-PL', [language]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const table: Record<string, Record<string, unknown>> = {};
        for (const stat of STAT_ROWS) {
          table[stat.key] = {};
          for (const col of NUMERIC_COLUMNS) {
            if (stat.endpoint === '/quartiles') {
              const res = await api.get<ApiResponse<{ Q1: number; Q2: number; Q3: number }>>(
                stat.endpoint,
                { params: { column_name: col.key, language, mode } }
              );
              if (!res.data.success) throw new Error(res.data.error ?? 'Bad response');
              const q = res.data.result;
              const pick = stat.key === 'q1' ? q.Q1 : stat.key === 'q2' ? q.Q2 : q.Q3;
              table[stat.key][col.key] = pick;
            } else {
              const res = await api.get<ApiResponse<number | string | null>>(stat.endpoint, {
                params: { column_name: col.key, language, mode },
              });
              if (!res.data.success) throw new Error(res.data.error ?? 'Bad response');
              table[stat.key][col.key] = res.data.result;
            }
          }
        }
        setValues(table);
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
        ) : (
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
              {STAT_ROWS.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{t(row.labelKey, row.fallback)}</th>
                  {NUMERIC_COLUMNS.map((c) => (
                    <td key={c.key}>{formatNumber(values[row.key]?.[c.key], locale)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatsSummaryTable;
