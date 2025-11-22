import { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
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
  [key: string]: Record<string, number | string | null>;
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
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(NUMERIC_COLUMNS.map((c) => c.key))
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);

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
            const n = (normal as SummaryResponse)[m.key]?.[col.key];
            const p = (prognosis as SummaryResponse)[m.key]?.[col.key];
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
    <>
      <Card className="mt-3">
        <Card.Header>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
            <span>{t('stats_diff_header', 'Różnice vs. normal')}</span>
            <div style={{ position: 'relative' }}>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowColumnPicker(!showColumnPicker)}
                style={{ minWidth: '200px' }}
              >
                {t('data_select_columns', 'Select columns')} ({selectedColumns.size})
              </Button>
              {showColumnPicker && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    minWidth: '250px',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                  }}
                >
                  {NUMERIC_COLUMNS.map((col) => (
                    <Form.Check
                      key={col.key}
                      type="checkbox"
                      id={`diff-col-${col.key}`}
                      label={t(col.labelKey, col.fallback)}
                      checked={selectedColumns.has(col.key)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newSet = new Set(selectedColumns);
                        if (e.currentTarget.checked) {
                          newSet.add(col.key);
                        } else {
                          newSet.delete(col.key);
                        }
                        setSelectedColumns(newSet);
                      }}
                      className="mb-1"
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card.Header>
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
            <Table
              striped
              bordered
              responsive
              size="sm"
              className="mb-0"
              style={{ marginBottom: 0 }}
            >
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: '0.95rem' }}></th>
                  {NUMERIC_COLUMNS.filter((c) => selectedColumns.has(c.key)).map((c) => (
                    <th
                      key={c.key}
                      style={{ padding: '12px 8px', fontWeight: 600, fontSize: '0.95rem' }}
                    >
                      {t(c.labelKey, c.fallback)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((row) => (
                  <tr key={row.key} style={{ verticalAlign: 'middle' }}>
                    <th
                      scope="row"
                      style={{
                        padding: '12px 8px',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      {t(row.labelKey, row.fallback)}
                    </th>
                    {NUMERIC_COLUMNS.filter((c) => selectedColumns.has(c.key)).map((c) => {
                      const v = diffs[row.key]?.[c.key];
                      const progValue = prognosis?.[row.key]?.[c.key];
                      const normalValue = normal?.[row.key]?.[c.key];
                      const color =
                        typeof v === 'number'
                          ? v > 0
                            ? '#1b5e20'
                            : v < 0
                            ? '#b71c1c'
                            : undefined
                          : undefined;
                      return (
                        <td key={c.key} style={{ padding: '12px 8px' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <strong
                              style={
                                color ? { color, fontSize: '1.05rem' } : { fontSize: '1.05rem' }
                              }
                            >
                              {formatNumber(v, locale)}
                            </strong>
                          </div>
                          <div
                            style={{ fontSize: '0.9rem', color: '#495057', marginBottom: '4px' }}
                          >
                            <div>
                              {t('stats_diff_cell_abs', 'Prognoza')}:{' '}
                              <strong>{formatNumber(progValue, locale)}</strong>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#495057' }}>
                            <div>
                              {t('stats_diff_cell_base', 'Normalne')}:{' '}
                              <strong>{formatNumber(normalValue, locale)}</strong>
                            </div>
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

      <Card className="mt-3">
        <Card.Header>
          <span className="fw-semibold">
            {t('stats_diff_explain_title', 'Jak interpretować różnice')}
          </span>
        </Card.Header>
        <Card.Body>
          <div
            className="mb-3 p-3 bg-light rounded-3 border-start border-5"
            style={{ borderColor: '#0066cc' }}
          >
            <div className="fw-bold mb-2">
              📊 {t('stats_diff_explain_rule', 'Wartości różnicy = Prognoza − Dane Normalne')}
            </div>
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <div className="d-flex gap-2 align-items-start">
                  <span
                    className="badge bg-success text-white"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                  >
                    +
                  </span>
                  <div className="small">
                    <div className="fw-semibold">
                      {t('stats_diff_label_positive', 'Dodatnia (np. +0.5)')}
                    </div>
                    <div className="text-muted">
                      {t('stats_diff_explain_positive', 'Zbiór prognostyczny ma WYŻSZE wartości')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex gap-2 align-items-start">
                  <span
                    className="badge bg-danger text-white"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                  >
                    −
                  </span>
                  <div className="small">
                    <div className="fw-semibold">
                      {t('stats_diff_label_negative', 'Ujemna (np. -0.5)')}
                    </div>
                    <div className="text-muted">
                      {t('stats_diff_explain_negative', 'Zbiór prognostyczny ma NIŻSZE wartości')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex gap-2 align-items-start">
                  <span
                    className="badge bg-secondary text-white"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                  >
                    0
                  </span>
                  <div className="small">
                    <div className="fw-semibold">{t('stats_diff_label_zero', 'Blisko zera')}</div>
                    <div className="text-muted">
                      {t(
                        'stats_diff_explain_zero',
                        'Rozkład wartości jest podobny w obu zbiorach danych'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <div
                className="p-3 border rounded-2 bg-light"
                style={{ borderLeft: '4px solid #198754' }}
              >
                <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>📈</span>
                  {t('stats_diff_explain_mean_label', 'Średnia / Mediana / Suma')}
                </div>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        className="badge bg-success text-white"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                      >
                        +
                      </span>
                      <div className="small">
                        <div className="fw-semibold">{t('stats_diff_label_plus', 'Plus (+)')}</div>
                        <div className="text-muted">
                          {t(
                            'stats_diff_explain_mean_plus',
                            'Wartości w prognozie są średnio większe'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        className="badge bg-danger text-white"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                      >
                        −
                      </span>
                      <div className="small">
                        <div className="fw-semibold">
                          {t('stats_diff_label_minus', 'Minus (−)')}
                        </div>
                        <div className="text-muted">
                          {t(
                            'stats_diff_explain_mean_minus',
                            'Wartości w prognozie są średnio mniejsze'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div
                className="p-3 border rounded-2 bg-light"
                style={{ borderLeft: '4px solid #0d6efd' }}
              >
                <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>📏</span>
                  {t('stats_diff_explain_std_label', 'Odchylenie standardowe (rozrzut danych)')}
                </div>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        className="badge bg-success text-white"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                      >
                        +
                      </span>
                      <div className="small">
                        <div className="fw-semibold">{t('stats_diff_label_plus', 'Plus (+)')}</div>
                        <div className="text-muted">
                          {t(
                            'stats_diff_explain_std_plus',
                            'Dane bardziej rozproszone (większa zmienność)'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        className="badge bg-danger text-white"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                      >
                        −
                      </span>
                      <div className="small">
                        <div className="fw-semibold">
                          {t('stats_diff_label_minus', 'Minus (−)')}
                        </div>
                        <div className="text-muted">
                          {t(
                            'stats_diff_explain_std_minus',
                            'Dane bardziej skupione (mniejsza zmienność)'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div
                className="p-3 border rounded-2 bg-light"
                style={{ borderLeft: '4px solid #ffc107' }}
              >
                <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>⚖️</span>
                  {t('stats_diff_explain_skew_label', 'Skośność (asymetria rozkładu)')}
                </div>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        className="badge bg-success text-white"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                      >
                        +
                      </span>
                      <div className="small">
                        <div className="fw-semibold">{t('stats_diff_label_plus', 'Plus (+)')}</div>
                        <div className="text-muted">
                          {t(
                            'stats_diff_explain_skew_plus',
                            'Dłuższy ogon po prawej (więcej wysokich wartości)'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        className="badge bg-danger text-white"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                      >
                        −
                      </span>
                      <div className="small">
                        <div className="fw-semibold">
                          {t('stats_diff_label_minus', 'Minus (−)')}
                        </div>
                        <div className="text-muted">
                          {t(
                            'stats_diff_explain_skew_minus',
                            'Dłuższy ogon po lewej (więcej niskich wartości)'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div
                className="p-3 border rounded-2 bg-light"
                style={{ borderLeft: '4px solid #dc3545' }}
              >
                <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>📉</span>
                  {t('stats_diff_explain_kurt_label', 'Kurtoza (ekstremalne wartości)')}
                </div>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        className="badge bg-success text-white"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                      >
                        +
                      </span>
                      <div className="small">
                        <div className="fw-semibold">
                          {t('stats_diff_label_positive', 'Dodatnia (np. +0.5)')}
                        </div>
                        <div className="text-muted">
                          {t(
                            'stats_diff_explain_kurt_positive',
                            'WIĘCEJ wartości skrajnych (więcej bardzo bogatych lub bardzo biednych klientów)'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        className="badge bg-danger text-white"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                      >
                        −
                      </span>
                      <div className="small">
                        <div className="fw-semibold">
                          {t('stats_diff_label_negative', 'Ujemna (np. -0.5)')}
                        </div>
                        <div className="text-muted">
                          {t(
                            'stats_diff_explain_kurt_negative',
                            'MNIEJ wartości skrajnych (większość klientów podobna do siebie)'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex gap-2 align-items-start">
                      <span
                        className="badge bg-secondary text-white"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                      >
                        0
                      </span>
                      <div className="small">
                        <div className="fw-semibold">
                          {t('stats_diff_label_zero', 'Blisko zera')}
                        </div>
                        <div className="text-muted">
                          {t(
                            'stats_diff_explain_kurt_zero',
                            'Rozkład wartości ekstremalnych podobny w obu zbiorach danych'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div
                className="p-3 border rounded-2 bg-light"
                style={{ borderLeft: '4px solid #6f42c1' }}
              >
                <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>📊</span>
                  {t(
                    'stats_diff_explain_quartiles_label',
                    'Kwartyle: Q1 (25%), Q2 (mediana 50%), Q3 (75%)'
                  )}
                </div>
                <div className="mb-3">
                  <table className="w-100 small">
                    <tbody>
                      <tr>
                        <td className="py-2 fw-semibold align-top" style={{ width: '80px' }}>
                          <span className="badge bg-info me-2">Q1</span>
                        </td>
                        <td className="py-2 text-muted">
                          {t('stats_diff_explain_q1', 'Dolne 25% ma wyższe wartości w prognozie')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 fw-semibold align-top">
                          <span className="badge bg-primary me-2">Q2</span>
                        </td>
                        <td className="py-2 text-muted">
                          {t(
                            'stats_diff_explain_q2',
                            'Połowa ludzi ma wyższe wartości w prognozie'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 fw-semibold align-top">
                          <span className="badge bg-warning me-2">Q3</span>
                        </td>
                        <td className="py-2 text-muted">
                          {t('stats_diff_explain_q3', 'Górne 75% ma wyższe wartości w prognozie')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-2 bg-white rounded-2 border-start border-3 border-info">
                  <div className="fw-semibold small mb-1">💡 Przykład</div>
                  <div className="text-muted small fst-italic">
                    {t(
                      'stats_diff_explain_quartiles_example',
                      'Jeśli różnica Q2 dla dochodu = +5000, to POŁOWA ludzi w prognozie zarabia o 5000 więcej niż w danych rzeczywistych'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default StatsDiffTable;
