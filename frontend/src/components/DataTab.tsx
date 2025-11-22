import { useCallback, useEffect, useMemo, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import useLanguage from '../hooks/useLanguage';
import type { ApiResponse, Loan, PaginatedData } from '../interfaces/Loan';
import api from '../services/api';
import PrognosisProcessPanel from './PrognosisProcessPanel';

type Row = Loan & { [key: string]: unknown };

const NUMERIC_COLUMNS = [
  { key: 'credit_score', labelKey: 'data_col_credit_score', fallback: 'Credit Rating' },
  { key: 'income', labelKey: 'data_col_income', fallback: 'Income' },
  { key: 'loan_amount', labelKey: 'data_col_loan_amount', fallback: 'Loan amount' },
  { key: 'points', labelKey: 'data_col_points', fallback: 'Points' },
  { key: 'years_employed', labelKey: 'data_col_years_employed', fallback: 'Years employed' },
];

const DEFAULT_LOCALE_MAP = {
  pl: 'pl-PL',
  en: 'en-US',
  de: 'de-DE',
  zh: 'zh-CN',
  ko: 'ko-KR',
} as const;

const formatNumber = (value: number, locale: string, maximumFractionDigits = 2): string => {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
};

const toBoolLoose = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (['true', 'yes', 'y', '1', 'tak', 'ja', '是', '예'].includes(lowered)) return true;
    if (['false', 'no', 'n', '0', 'nie', 'nein', '否', '아니오'].includes(lowered)) return false;
  }
  return null;
};

const formatCellValue = (
  value: unknown,
  locale: string,
  t: (key: string, fallback?: string) => string
): string => {
  if (typeof value === 'number') return formatNumber(value, locale, 2);
  const boolNormalized = toBoolLoose(value);
  if (boolNormalized !== null)
    return boolNormalized ? t('bool_true', 'Yes') : t('bool_false', 'No');
  if (value === null || value === undefined) return '-';
  return String(value);
};

const DataTab = () => {
  const { language, t } = useLanguage();
  const [loans, setLoans] = useState<Row[]>([]);
  const [headerLabels, setHeaderLabels] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [mode, setMode] = useState<'normal' | 'prognosis' | 'merged'>('normal');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [datasetFilter, setDatasetFilter] = useState<'all' | 'normal' | 'prognosis'>('all');
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(
    new Set(NUMERIC_COLUMNS.map((c) => c.key))
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const locale = useMemo(() => DEFAULT_LOCALE_MAP[language] ?? 'en-US', [language]);

  const fetchTableData = useCallback(
    async (page: number) => {
      setTableLoading(true);
      setTableError(null);
      try {
        const response = await api.get<ApiResponse<PaginatedData>>('/data', {
          params: { page, language, mode },
        });
        if (!response.data.success) throw new Error(response.data.error ?? 'Bad response');
        const paginatedData = response.data.result;
        setLoans(paginatedData.data as unknown as Row[]);
        setCurrentPage(page);
        setHasNextPage(paginatedData.has_next);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('error_unexpected', 'Wystąpił nieoczekiwany błąd.');
        setTableError(message);
      } finally {
        setTableLoading(false);
      }
    },
    [t, language, mode]
  );

  useEffect(() => {
    void fetchTableData(1);
  }, []);
  useEffect(() => {
    setCurrentPage(1);
    void fetchTableData(1);
  }, [language, mode, fetchTableData]);

  useEffect(() => {
    const fetchHeaderLabels = async () => {
      try {
        const response = await api.get<ApiResponse<Record<string, string>>>('/headers-localized', {
          params: { language },
        });
        if (response.data.success && response.data.result) setHeaderLabels(response.data.result);
      } catch {
        setHeaderLabels({});
      }
    };
    void fetchHeaderLabels();
  }, [language]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) return;
    if (nextPage > currentPage && !hasNextPage) return;
    void fetchTableData(nextPage);
  };

  const sortedAndFilteredLoans = useMemo(() => {
    let rows = loans.slice();
    if (datasetFilter !== 'all') {
      rows = rows.filter(
        (r) =>
          String(r.dataset_code ?? (mode === 'normal' ? 'normal' : '')).toLowerCase() ===
          datasetFilter
      );
    }
    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        if (sortKey === 'dataset') {
          const codeA = String(
            a.dataset_code ?? (mode === 'normal' ? 'normal' : a.dataset ?? '')
          ).toLowerCase();
          const codeB = String(
            b.dataset_code ?? (mode === 'normal' ? 'normal' : b.dataset ?? '')
          ).toLowerCase();
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
  }, [loans, sortKey, sortDir, datasetFilter, mode]);

  const onHeaderClick = (key: string) => {
    if (key === 'dataset_code') return;
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderCell = (key: string, value: unknown, row: Record<string, unknown>) => {
    if (key === 'dataset') {
      const code = String(row['dataset_code'] ?? (mode === 'normal' ? 'normal' : '')).toLowerCase();
      const variant = code === 'prognosis' ? 'success' : code === 'normal' ? 'secondary' : 'info';
      const label = String(value ?? '');
      return (
        <Badge
          bg={variant}
          style={{ cursor: mode === 'merged' ? 'pointer' : 'default' }}
          onClick={() => {
            if (mode !== 'merged') return;
            setDatasetFilter((cur) => (cur === code ? 'all' : (code as 'normal' | 'prognosis')));
          }}
          title={
            mode === 'merged'
              ? datasetFilter === code
                ? t('click_to_clear_filter', 'Kliknij, aby usunąć filtr')
                : t('click_to_filter', 'Kliknij, aby przefiltrować')
              : undefined
          }
        >
          {label}
        </Badge>
      );
    }
    return formatCellValue(value, locale, t);
  };

  const getVisibleColumns = (): string[] => {
    if (loans.length === 0) return [];
    const allKeys = Object.keys(loans[0]) as string[];
    const visibleColumns: string[] = [];

    if (allKeys.includes('name')) {
      visibleColumns.push('name');
    }

    visibleColumns.push('dataset');

    const selectedInOrder = NUMERIC_COLUMNS.filter((col) => selectedAttributes.has(col.key)).map(
      (col) => col.key
    );
    visibleColumns.push(...selectedInOrder);

    return visibleColumns;
  };

  return (
    <section className="container-fluid px-0">
      <Card>
        <Card.Header>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
            <span>{t('ui_tab_data', 'Dane')}</span>
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
            <div style={{ position: 'relative' }}>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowColumnPicker(!showColumnPicker)}
                style={{ minWidth: '200px' }}
              >
                {t('data_select_columns', 'Select columns')} ({selectedAttributes.size})
              </Button>
              {showColumnPicker && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
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
                      id={`col-${col.key}`}
                      label={t(col.labelKey, col.fallback)}
                      checked={selectedAttributes.has(col.key)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newSet = new Set(selectedAttributes);
                        if (e.currentTarget.checked) {
                          newSet.add(col.key);
                        } else {
                          newSet.delete(col.key);
                        }
                        setSelectedAttributes(newSet);
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
                  getVisibleColumns().map((key) => {
                    const sortable = key !== 'dataset';
                    return (
                      <th
                        key={String(key)}
                        className="text-nowrap"
                        style={{ cursor: sortable ? 'pointer' : 'default' }}
                        onClick={sortable ? () => onHeaderClick(key) : undefined}
                        title={sortable ? t('click_to_sort', 'Kliknij, aby sortować') : undefined}
                      >
                        {headerLabels[String(key)] ?? String(key)}
                        {sortable && sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td colSpan={getVisibleColumns().length} className="text-center py-5">
                    <Spinner animation="border" role="status" />
                  </td>
                </tr>
              ) : tableError ? (
                <tr>
                  <td colSpan={getVisibleColumns().length} className="text-center text-danger">
                    {tableError}
                  </td>
                </tr>
              ) : (
                sortedAndFilteredLoans.map((row, index) => (
                  <tr key={index}>
                    {getVisibleColumns().map((key) => (
                      <td key={key}>{renderCell(key, (row as any)[key], row)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <span className="text-secondary">
              {t('data_on_page', 'Na stronie:')} {loans.length}
            </span>
            {mode === 'merged' && datasetFilter !== 'all' && (
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
      <PrognosisProcessPanel />
    </section>
  );
};

export default DataTab;
