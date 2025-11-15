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

const METRICS: Array<{ key: string; labelKey: string; fallback: string }> = [
  { key: 'mean', labelKey: 'stats_mean', fallback: 'Mean' },
  { key: 'median', labelKey: 'stats_median', fallback: 'Median' },
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
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 4,
      signDisplay: 'exceptZero',
    }).format(v);
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

const StatsDiffTable = () => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diffs, setDiffs] = useState<Record<string, Record<string, number>>>({});
  const [normal, setNormal] = useState<SummaryResponse | null>(null);
  const [prognosis, setPrognosis] = useState<SummaryResponse | null>(null);

  const locale = useMemo(() => DEFAULT_LOCALE_MAP[language] ?? 'pl-PL', [language]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [normalRes, progRes] = await Promise.all([
          api.get<ApiResponse<SummaryResponse>>('/summary', { params: { mode: 'normal' } }),
          api.get<ApiResponse<SummaryResponse>>('/summary', { params: { mode: 'prognosis' } }),
        ]);
        if (!normalRes.data.success) throw new Error(normalRes.data.error ?? 'Bad response');
        if (!progRes.data.success) throw new Error(progRes.data.error ?? 'Bad response');
        const normal = normalRes.data.result;
        const prognosis = progRes.data.result;
        setNormal(normal);
        setPrognosis(prognosis);
        const table: Record<string, Record<string, number>> = {};
        for (const m of METRICS) {
          table[m.key] = {};
          for (const col of NUMERIC_COLUMNS) {
            const n = (normal as any)[m.key]?.[col.key];
            const p = (prognosis as any)[m.key]?.[col.key];
            const canDiff = typeof n === 'number' && typeof p === 'number';
            table[m.key][col.key] = canDiff ? p - n : 0;
          }
        }
        setDiffs(table);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : t('error_unexpected', 'Wystąpił nieoczekiwany błąd.');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [language, t]);

  return (
    <Card className="mt-3">
      <Card.Header>{t('stats_diff_header', 'Różnice vs. normal')}</Card.Header>
      <Card.Body>
        <Alert variant="info" className="mb-3">
          <div className="fw-semibold">
            {t('stats_diff_explain_title', 'How to read differences')}
          </div>
          <div className="mb-2">
            {t(
              'stats_diff_explain_rule',
              'Values = Prognosis − Normal. Positive: prognosis higher. Negative: prognosis lower.'
            )}
          </div>
          <ul className="mb-2">
            <li>
              {t(
                'stats_diff_explain_mean',
                'Mean/Median/Sum: sign shows whether prognosis is higher or lower than original.'
              )}
            </li>
            <li>
              {t(
                'stats_diff_explain_std',
                'Std. deviation: positive = more spread/variability; negative = less spread.'
              )}
            </li>
            <li>
              {t(
                'stats_diff_explain_skew',
                'Skewness: positive = right‑skew (longer right tail); negative = left‑skew.'
              )}
            </li>
            <li>
              {t(
                'stats_diff_explain_kurt',
                'Kurtosis: positive = heavier tails/sharper peak; negative = flatter distribution.'
              )}
            </li>
            <li>
              {t(
                'stats_diff_explain_quartiles',
                'Q1/Q2/Q3: positive = quartile is higher; negative = lower (Q2 is the median).'
              )}
            </li>
          </ul>
          <div className="small text-muted">
            <div className="fw-semibold mb-1">{t('stats_diff_explain_by_column', 'By column')}</div>
            <ul className="mb-0">
              <li>
                {t(
                  'stats_diff_explain_col_income',
                  'Income: higher = prognosis predicts higher incomes; lower = lower incomes.'
                )}
              </li>
              <li>
                {t(
                  'stats_diff_explain_col_loan_amount',
                  'Loan amount: higher = prognosis predicts larger loans; lower = smaller loans.'
                )}
              </li>
              <li>
                {t(
                  'stats_diff_explain_col_credit_score',
                  'Credit score: higher = prognosis predicts better creditworthiness; lower = poorer creditworthiness (not a direct approval decision).'
                )}
              </li>
              <li>
                {t(
                  'stats_diff_explain_col_years_employed',
                  'Years employed: higher = longer tenure; lower = shorter tenure in prognosis.'
                )}
              </li>
              <li>
                {t(
                  'stats_diff_explain_col_points',
                  'Points: higher = more points in prognosis; lower = fewer points.'
                )}
              </li>
            </ul>
          </div>
        </Alert>
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
              {METRICS.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{t(row.labelKey, row.fallback)}</th>
                  {NUMERIC_COLUMNS.map((c) => {
                    const v = diffs[row.key]?.[c.key];
                    const color =
                      typeof v === 'number'
                        ? v > 0
                          ? '#1b5e20'
                          : v < 0
                          ? '#b71c1c'
                          : undefined
                        : undefined;
                    return (
                      <td key={c.key} style={color ? { color, fontWeight: 600 } : undefined}>
                        {formatNumber(v, locale)}
                        <div className="small text-muted">
                          {t('stats_diff_cell_abs', 'Prognoza')}:{' '}
                          {formatNumber((prognosis as any)?.[row.key]?.[c.key], locale)}
                        </div>
                        <div className="small text-muted">
                          {t('stats_diff_cell_base', 'Normalne')}:{' '}
                          {formatNumber((normal as any)?.[row.key]?.[c.key], locale)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatsDiffTable;
