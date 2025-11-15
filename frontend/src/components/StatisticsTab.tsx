import axios from 'axios';
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import type { LanguageCode } from '../context/LanguageContext';
import useLanguage from '../hooks/useLanguage';
import type { ApiResponse, Loan, PaginatedData } from '../interfaces/Loan';
import api from '../services/api';
type Row = Loan & { [key: string]: unknown };
interface Quartiles {
  Q1: number;
  Q2: number;
  Q3: number;
}

type StatKey =
  | 'mean'
  | 'sum'
  | 'quartiles'
  | 'median'
  | 'mode'
  | 'skewness'
  | 'kurtosis'
  | 'deviation';

type StatValue = number | string | null | Quartiles;

interface ColumnStats {
  mean?: number;
  sum?: number;
  quartiles?: Quartiles;
  median?: number;
  mode?: number | string | null;
  skewness?: number;
  kurtosis?: number;
  deviation?: number;
}

interface StatDefinition {
  key: StatKey;
  label: string;
  endpoint: string;
}

const STAT_DEFINITIONS: StatDefinition[] = [
  { key: 'mean', label: 'Średnia', endpoint: '/mean' },
  { key: 'median', label: 'Mediana', endpoint: '/median' },
  { key: 'mode', label: 'Dominanta', endpoint: '/mode' },
  { key: 'sum', label: 'Suma', endpoint: '/sum' },
  { key: 'deviation', label: 'Odchylenie standardowe', endpoint: '/deviation' },
  { key: 'skewness', label: 'Skośność', endpoint: '/skewness' },
  { key: 'kurtosis', label: 'Kurtoza', endpoint: '/kurtosis' },
  { key: 'quartiles', label: 'Kwartyle', endpoint: '/quartiles' },
];

const DEFAULT_LOCALE_MAP: Record<LanguageCode, string> = {
  pl: 'pl-PL',
  en: 'en-US',
  de: 'de-DE',
  zh: 'zh-CN',
  ko: 'ko-KR',
};

const COLUMN_LABEL_KEYS: Partial<Record<keyof Loan, string>> = {
  city: 'data_col_city',
  credit_score: 'data_col_credit_score',
  income: 'data_col_income',
  loan_amount: 'data_col_loan_amount',
  loan_approved: 'data_col_loan_approved',
  name: 'data_col_name',
  points: 'data_col_points',
  years_employed: 'data_col_years_employed',
};

const getColumnLabel = (key: keyof Loan, t: (k: string, fallback?: string) => string): string =>
  t(COLUMN_LABEL_KEYS[key] ?? String(key), String(key));

const extractErrorMessage = (
  error: unknown,
  t: (key: string, fallback?: string) => string
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (typeof data?.error === 'string') {
      return data.error;
    }
    if (typeof error.message === 'string' && error.message.length > 0) {
      return error.message;
    }
    return t('error_connection', 'Wystąpił błąd połączenia z serwerem.');
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return t('error_unexpected', 'Wystąpił nieoczekiwany błąd.');
};

const getRawErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (typeof data?.error === 'string') return data.error;
    if (typeof error.message === 'string') return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return '';
};

const shouldRetryLegacyStatsRequest = (
  error: unknown,
  selectedColumn: string,
  selectedLanguage: LanguageCode
): boolean => {
  if (selectedLanguage === selectedColumn) {
    return false;
  }

  const message = getRawErrorMessage(error);
  return (
    message.includes('Column') &&
    message.includes('not found') &&
    message.includes(selectedLanguage)
  );
};

const formatNumber = (value: number, locale: string, maximumFractionDigits = 2): string => {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(value);
};

const toBoolLoose = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (
      lowered === 'true' ||
      lowered === 'yes' ||
      lowered === 'y' ||
      lowered === '1' ||
      lowered === 'tak' ||
      lowered === 'ja' ||
      lowered === '是' ||
      lowered === '예'
    )
      return true;
    if (
      lowered === 'false' ||
      lowered === 'no' ||
      lowered === 'n' ||
      lowered === '0' ||
      lowered === 'nie' ||
      lowered === 'nein' ||
      lowered === '否' ||
      lowered === '아니오'
    )
      return false;
  }
  return null;
};

const formatCellValue = (
  value: unknown,
  locale: string,
  t: (key: string, fallback?: string) => string
): string => {
  if (typeof value === 'number') {
    return formatNumber(value, locale, 2);
  }
  const boolNormalized = toBoolLoose(value);
  if (boolNormalized !== null) {
    return boolNormalized ? t('bool_true', 'Tak') : t('bool_false', 'Nie');
  }
  if (value === null || value === undefined) {
    return '-';
  }
  return String(value);
};

const StatisticsTab = () => {
  const { language, t } = useLanguage();
  const [loans, setLoans] = useState<Row[]>([]);
  const [headerLabels, setHeaderLabels] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [datasetFilter, setDatasetFilter] = useState<'all' | 'normal' | 'prognosis'>('all');
  const [mode, setMode] = useState<'normal' | 'prognosis' | 'merged'>('normal');

  const [numericColumns, setNumericColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [stats, setStats] = useState<ColumnStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const locale = useMemo(() => DEFAULT_LOCALE_MAP[language] ?? 'pl-PL', [language]);

  const discoverNumericColumns = useCallback((rows: Loan[]) => {
    if (!rows.length) {
      return;
    }

    const candidateColumns = Object.keys(rows[0]).filter((column) => {
      const value = rows[0][column as keyof Loan];
      return typeof value === 'number';
    });

    setNumericColumns(candidateColumns);

    if (candidateColumns.length > 0) {
      setSelectedColumn((current) => current || (candidateColumns[0] ?? ''));
    }
  }, []);

  const fetchTableData = useCallback(
    async (page: number) => {
      setTableLoading(true);
      setTableError(null);

      try {
        const response = await api.get<ApiResponse<PaginatedData>>('/data', {
          params: { page, language, mode },
        });

        if (!response.data.success) {
          throw new Error(response.data.error ?? 'Serwer zwrócił niepoprawną odpowiedź.');
        }

        const paginatedData = response.data.result;
        setLoans(paginatedData.data as unknown as Row[]);
        setCurrentPage(page);
        setHasNextPage(paginatedData.has_next);
        discoverNumericColumns(paginatedData.data);
      } catch (error) {
        const message = extractErrorMessage(error, t);
        setTableError(message);
      } finally {
        setTableLoading(false);
      }
    },
    [t, language, discoverNumericColumns]
  );

  useEffect(() => {
    void fetchTableData(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    void fetchTableData(1);
  }, [language, mode]);

  useEffect(() => {
    const fetchHeaderLabels = async () => {
      try {
        const response = await api.get<ApiResponse<Record<string, string>>>('/headers-localized', {
          params: { language },
        });
        if (response.data.success && response.data.result) {
          setHeaderLabels(response.data.result);
        }
      } catch {
        setHeaderLabels({});
      }
    };
    void fetchHeaderLabels();
  }, [language]);

  const fetchStatisticValue = useCallback(
    async (endpoint: string, column: string): Promise<StatValue> => {
      const performRequest = async (params: Record<string, string>): Promise<StatValue> => {
        const response = await api.get<ApiResponse<StatValue>>(endpoint, {
          params,
        });

        if (!response.data.success) {
          throw new Error(
            response.data.error ?? t('error_bad_response', 'Serwer zwrócił niepoprawną odpowiedź.')
          );
        }

        return response.data.result;
      };

      try {
        return await performRequest({ column_name: column, language, mode });
      } catch (error) {
        if (shouldRetryLegacyStatsRequest(error, column, language)) {
          try {
            return await performRequest({
              column_name: column,
              language: column,
            });
          } catch (legacyError) {
            throw new Error(extractErrorMessage(legacyError, t));
          }
        }

        throw new Error(extractErrorMessage(error, t));
      }
    },
    [language, t]
  );

  const fetchStatistics = useCallback(
    async (column: string) => {
      setStatsLoading(true);
      setStatsError(null);

      const freshStats: ColumnStats = {};

      try {
        for (const statDefinition of STAT_DEFINITIONS) {
          const value = await fetchStatisticValue(statDefinition.endpoint, column);

          switch (statDefinition.key) {
            case 'quartiles':
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                freshStats.quartiles = value as Quartiles;
              }
              break;
            case 'mode':
              freshStats.mode = (value as number | string | null) ?? null;
              break;
            default:
              if (typeof value === 'number') {
                (freshStats as Record<string, number | undefined>)[statDefinition.key] = value;
              }
              break;
          }
        }

        setStats(freshStats);
      } catch (error) {
        setStats(null);
        setStatsError(extractErrorMessage(error, t));
      } finally {
        setStatsLoading(false);
      }
    },
    [fetchStatisticValue, t]
  );

  useEffect(() => {
    if (selectedColumn) {
      void fetchStatistics(selectedColumn);
    }
  }, [fetchStatistics, selectedColumn]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) {
      return;
    }

    if (nextPage > currentPage && !hasNextPage) {
      return;
    }

    void fetchTableData(nextPage);
  };

  const sortedAndFilteredLoans = useMemo(() => {
    let rows = loans.slice();
    if (datasetFilter !== 'all') {
      rows = rows.filter((r) => String(r.dataset_code ?? 'normal').toLowerCase() === datasetFilter);
    }
    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        if (sortKey === 'dataset') {
          const codeA = String(a.dataset_code ?? 'normal').toLowerCase();
          const codeB = String(b.dataset_code ?? 'normal').toLowerCase();
          const orderAsc = ['prognosis', 'normal'];
          const orderDesc = ['normal', 'prognosis'];
          const order = dir === 1 ? orderAsc : orderDesc;
          const idxA = order.indexOf(codeA);
          const idxB = order.indexOf(codeB);
          const aRank = idxA === -1 ? Number.POSITIVE_INFINITY : idxA;
          const bRank = idxB === -1 ? Number.POSITIVE_INFINITY : idxB;
          return aRank - bRank;
        }
        const va = a[sortKey as keyof Row];
        const vb = b[sortKey as keyof Row];
        const na = typeof va === 'number' ? va : Number(va);
        const nb = typeof vb === 'number' ? vb : Number(vb);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * dir;
        const sa = String(va ?? '');
        const sb = String(vb ?? '');
        return sa.localeCompare(sb) * dir;
      });
    }
    return rows;
  }, [loans, sortKey, sortDir, datasetFilter]);

  const onHeaderClick = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleColumnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(event.target.value);
  };

  const renderStatisticsContent = () => {
    if (statsLoading) {
      return (
        <div className="d-flex align-items-center">
          <Spinner animation="border" role="status" size="sm" className="me-2" />
          <span>{t('stats_loading', 'Wczytywanie parametrów...')}</span>
        </div>
      );
    }

    if (statsError) {
      return (
        <Alert variant="danger" className="mb-0">
          {statsError}
        </Alert>
      );
    }

    if (!stats) {
      return (
        <span>{t('stats_select_column_hint', 'Wybierz kolumnę, aby zobaczyć parametry.')}</span>
      );
    }

    return (
      <Table striped bordered responsive size="sm" className="mb-0">
        <tbody>
          {typeof stats.mean === 'number' && (
            <tr>
              <th scope="row">{t('stats_mean', 'Średnia')}</th>
              <td>{formatNumber(stats.mean, locale, 2)}</td>
            </tr>
          )}
          {typeof stats.median === 'number' && (
            <tr>
              <th scope="row">{t('stats_median', 'Mediana')}</th>
              <td>{formatNumber(stats.median, locale, 2)}</td>
            </tr>
          )}
          {typeof stats.mode !== 'undefined' && (
            <tr>
              <th scope="row">{t('stats_mode', 'Dominanta')}</th>
              <td>
                {stats.mode !== null
                  ? formatCellValue(stats.mode, locale, t)
                  : t('stats_none', 'brak')}
              </td>
            </tr>
          )}
          {typeof stats.sum === 'number' && (
            <tr>
              <th scope="row">{t('stats_sum', 'Suma')}</th>
              <td>{formatNumber(stats.sum, locale, 0)}</td>
            </tr>
          )}
          {typeof stats.deviation === 'number' && (
            <tr>
              <th scope="row">{t('stats_std_dev', 'Odchylenie standardowe')}</th>
              <td>{formatNumber(stats.deviation, locale, 2)}</td>
            </tr>
          )}
          {typeof stats.skewness === 'number' && (
            <tr>
              <th scope="row">{t('stats_skewness', 'Skośność')}</th>
              <td>{formatNumber(stats.skewness, locale, 4)}</td>
            </tr>
          )}
          {typeof stats.kurtosis === 'number' && (
            <tr>
              <th scope="row">{t('stats_kurtosis', 'Kurtoza')}</th>
              <td>{formatNumber(stats.kurtosis, locale, 4)}</td>
            </tr>
          )}
          {stats.quartiles && (
            <>
              <tr>
                <th scope="row">{t('stats_q1', 'Kwartyl Q1')}</th>
                <td>{formatNumber(stats.quartiles.Q1, locale, 2)}</td>
              </tr>
              <tr>
                <th scope="row">{t('stats_q2', 'Kwartyl Q2')}</th>
                <td>{formatNumber(stats.quartiles.Q2, locale, 2)}</td>
              </tr>
              <tr>
                <th scope="row">{t('stats_q3', 'Kwartyl Q3')}</th>
                <td>{formatNumber(stats.quartiles.Q3, locale, 2)}</td>
              </tr>
            </>
          )}
        </tbody>
      </Table>
    );
  };

  return (
    <section className="container-fluid px-0">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <span>{t('ui_tab_statistics', 'Statystyki')}</span>
            <ButtonGroup>
              <Button
                variant={mode === 'normal' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setMode('normal')}
                disabled={tableLoading && mode === 'normal'}
              >
                {t('ui_mode_normal', 'Normalne')}
              </Button>
              <Button
                variant={mode === 'prognosis' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setMode('prognosis')}
                disabled={tableLoading && mode === 'prognosis'}
              >
                {t('ui_mode_prognosis', 'Prognoza')}
              </Button>
              <Button
                variant={mode === 'merged' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setMode('merged')}
                disabled={tableLoading && mode === 'merged'}
              >
                {t('ui_mode_merged', 'Połączone')}
              </Button>
            </ButtonGroup>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-4 text-center">
            <Form.Group
              controlId="statistics-column"
              className="mb-3"
              style={{ maxWidth: 400, margin: '0 auto' }}
            >
              <Form.Label className="fw-semibold" style={{ color: '#212529' }}>
                {t('stats_select_column', 'Wybierz kolumnę')}
              </Form.Label>
              <Form.Select value={selectedColumn} onChange={handleColumnChange}>
                <option value="" disabled>
                  {t('stats_select_placeholder', '-- wybierz --')}
                </option>
                {numericColumns.map((column) => (
                  <option key={column} value={column}>
                    {headerLabels[column] ?? getColumnLabel(column as keyof Loan, t)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {renderStatisticsContent()}
          </div>

          <Table
            striped
            bordered
            hover
            responsive
            className="mb-0 align-middle w-100"
            style={{
              background: 'var(--bs-white)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
            }}
          >
            <thead style={{ background: 'var(--bs-primary)', color: 'white' }}>
              <tr>
                {loans.length > 0 &&
                  (Object.keys(loans[0]) as Array<keyof Loan>).map((key) => {
                    const k = String(key);
                    const sortable = k !== 'dataset';
                    return (
                      <th
                        key={k}
                        className="text-nowrap"
                        style={{ cursor: sortable ? 'pointer' : 'default' }}
                        onClick={sortable ? () => onHeaderClick(k) : undefined}
                        title={sortable ? t('click_to_sort', 'Kliknij, aby sortować') : undefined}
                      >
                        {headerLabels[k] ?? getColumnLabel(key, t)}
                        {sortable && sortKey === k ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td
                    colSpan={loans.length > 0 ? Object.keys(loans[0]).length : 1}
                    className="text-center py-5"
                  >
                    <Spinner animation="border" role="status" />
                  </td>
                </tr>
              ) : tableError ? (
                <tr>
                  <td
                    colSpan={loans.length > 0 ? Object.keys(loans[0]).length : 1}
                    className="text-center text-danger"
                  >
                    {tableError}
                  </td>
                </tr>
              ) : (
                sortedAndFilteredLoans.map((row, index) => (
                  <tr key={index}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={key}>
                        {key === 'dataset'
                          ? (() => {
                              const code = String(
                                (row as any)['dataset_code'] ?? 'normal'
                              ).toLowerCase();
                              const label = String(value ?? '');
                              const variant =
                                code === 'prognosis'
                                  ? 'success'
                                  : code === 'normal'
                                  ? 'secondary'
                                  : 'info';
                              return (
                                <span
                                  className={`badge bg-${variant}`}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() =>
                                    setDatasetFilter((cur) =>
                                      cur === code ? 'all' : (code as 'normal' | 'prognosis')
                                    )
                                  }
                                  title={
                                    datasetFilter === code
                                      ? t('click_to_clear_filter', 'Kliknij, aby usunąć filtr')
                                      : t('click_to_filter', 'Kliknij, aby przefiltrować')
                                  }
                                >
                                  {label}
                                </span>
                              );
                            })()
                          : formatCellValue(value, locale, t)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 stack-on-short">
            <span className="text-secondary">
              {t('data_on_page', 'Na stronie:')} {loans.length}
            </span>
            {datasetFilter !== 'all' && (
              <span className="text-secondary">
                {t('active_filter', 'Aktywny filtr:')}{' '}
                {datasetFilter === 'normal'
                  ? t('ui_mode_normal', 'Normalne')
                  : t('ui_mode_prognosis', 'Prognoza')}
              </span>
            )}
            <ButtonGroup>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={tableLoading || currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                {t('ui_prev', 'Poprzednia')}
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={tableLoading || !hasNextPage}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                {t('ui_next', 'Następna')}
              </Button>
            </ButtonGroup>
          </div>
        </Card.Footer>
      </Card>
    </section>
  );
};

export default StatisticsTab;
