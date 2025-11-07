import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import axios from "axios";
import api from "../services/api";
import useLanguage from "../hooks/useLanguage";
import type { Loan, ApiResponse } from "../interfaces/Loan";
import type { LanguageCode } from "../context/LanguageContext";

interface Quartiles {
  Q1: number;
  Q2: number;
  Q3: number;
}

type StatKey =
  | "mean"
  | "sum"
  | "quartiles"
  | "median"
  | "mode"
  | "skewness"
  | "kurtosis"
  | "deviation";

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
  { key: "mean", label: "Średnia", endpoint: "/mean" },
  { key: "median", label: "Mediana", endpoint: "/median" },
  { key: "mode", label: "Dominanta", endpoint: "/mode" },
  { key: "sum", label: "Suma", endpoint: "/sum" },
  { key: "deviation", label: "Odchylenie standardowe", endpoint: "/deviation" },
  { key: "skewness", label: "Skośność", endpoint: "/skewness" },
  { key: "kurtosis", label: "Kurtoza", endpoint: "/kurtosis" },
  { key: "quartiles", label: "Kwartyle", endpoint: "/quartiles" },
];

const DEFAULT_LOCALE_MAP: Record<LanguageCode, string> = {
  pl: "pl-PL",
  en: "en-US",
  de: "de-DE",
  zh: "zh-CN",
  ko: "ko-KR",
};

const PAGE_SIZE = 100;

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (typeof data?.error === "string") {
      return data.error;
    }
    if (typeof error.message === "string" && error.message.length > 0) {
      return error.message;
    }
    return "Wystąpił błąd połączenia z serwerem.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Wystąpił nieoczekiwany błąd.";
};

const shouldRetryLegacyStatsRequest = (
  error: unknown,
  selectedColumn: string,
  selectedLanguage: LanguageCode
): boolean => {
  if (selectedLanguage === selectedColumn) {
    return false;
  }

  const message = extractErrorMessage(error);
  return (
    message.includes("Column") &&
    message.includes("not found") &&
    message.includes(selectedLanguage)
  );
};

const formatNumber = (
  value: number,
  locale: string,
  maximumFractionDigits = 2
): string => {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(value);
};

const formatCellValue = (value: unknown, locale: string): string => {
  if (typeof value === "number") {
    return formatNumber(value, locale, 2);
  }
  if (typeof value === "boolean") {
    return value ? "Tak" : "Nie";
  }
  if (value === null || value === undefined) {
    return "-";
  }
  return String(value);
};

const StatisticsTab = () => {
  const { language } = useLanguage();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  const [numericColumns, setNumericColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [stats, setStats] = useState<ColumnStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const locale = useMemo(
    () => DEFAULT_LOCALE_MAP[language] ?? "pl-PL",
    [language]
  );

  const discoverNumericColumns = useCallback(
    (rows: Loan[]) => {
      if (!rows.length) {
        return;
      }

      const candidateColumns = Object.keys(rows[0]).filter((column) => {
        const value = rows[0][column as keyof Loan];
        return typeof value === "number";
      });

      setNumericColumns(candidateColumns);

      if (!selectedColumn && candidateColumns.length > 0) {
        setSelectedColumn(candidateColumns[0]);
      }
    },
    [selectedColumn]
  );

  const fetchTableData = useCallback(
    async (page: number) => {
      setTableLoading(true);
      setTableError(null);

      try {
        const response = await api.get<ApiResponse<Loan[]>>("/data", {
          params: { page },
        });

        if (!response.data.success) {
          throw new Error(
            response.data.error ?? "Serwer zwrócił niepoprawną odpowiedź."
          );
        }

        setLoans(response.data.result);
        setCurrentPage(page);
        setHasNextPage(response.data.result.length === PAGE_SIZE);
        discoverNumericColumns(response.data.result);
      } catch (error) {
        const message = extractErrorMessage(error);
        setTableError(message);
      } finally {
        setTableLoading(false);
      }
    },
    [discoverNumericColumns]
  );

  useEffect(() => {
    void fetchTableData(1);
  }, [fetchTableData]);

  const fetchStatisticValue = useCallback(
    async (endpoint: string, column: string): Promise<StatValue> => {
      const performRequest = async (
        params: Record<string, string>
      ): Promise<StatValue> => {
        const response = await api.get<ApiResponse<StatValue>>(endpoint, {
          params,
        });

        if (!response.data.success) {
          throw new Error(
            response.data.error ?? "Serwer zwrócił niepoprawną odpowiedź."
          );
        }

        return response.data.result;
      };

      try {
        return await performRequest({ column_name: column, language });
      } catch (error) {
        if (shouldRetryLegacyStatsRequest(error, column, language)) {
          try {
            return await performRequest({
              column_name: column,
              language: column,
            });
          } catch (legacyError) {
            throw new Error(extractErrorMessage(legacyError));
          }
        }

        throw new Error(extractErrorMessage(error));
      }
    },
    [language]
  );

  const fetchStatistics = useCallback(
    async (column: string) => {
      setStatsLoading(true);
      setStatsError(null);

      const freshStats: ColumnStats = {};

      try {
        for (const statDefinition of STAT_DEFINITIONS) {
          const value = await fetchStatisticValue(
            statDefinition.endpoint,
            column
          );

          switch (statDefinition.key) {
            case "quartiles":
              if (value && typeof value === "object" && !Array.isArray(value)) {
                freshStats.quartiles = value as Quartiles;
              }
              break;
            case "mode":
              freshStats.mode = (value as number | string | null) ?? null;
              break;
            default:
              if (typeof value === "number") {
                (freshStats as Record<string, number | undefined>)[
                  statDefinition.key
                ] = value;
              }
              break;
          }
        }

        setStats(freshStats);
      } catch (error) {
        setStats(null);
        setStatsError(extractErrorMessage(error));
      } finally {
        setStatsLoading(false);
      }
    },
    [fetchStatisticValue]
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

  const handleColumnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(event.target.value);
  };

  const renderStatisticsContent = () => {
    if (statsLoading) {
      return (
        <div className="d-flex align-items-center">
          <Spinner
            animation="border"
            role="status"
            size="sm"
            className="me-2"
          />
          <span>Wczytywanie parametrów...</span>
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
      return <span>Wybierz kolumnę, aby zobaczyć parametry.</span>;
    }

    return (
      <Table striped bordered responsive size="sm" className="mb-0">
        <tbody>
          {typeof stats.mean === "number" && (
            <tr>
              <th scope="row">Średnia</th>
              <td>{formatNumber(stats.mean, locale, 2)}</td>
            </tr>
          )}
          {typeof stats.median === "number" && (
            <tr>
              <th scope="row">Mediana</th>
              <td>{formatNumber(stats.median, locale, 2)}</td>
            </tr>
          )}
          {typeof stats.mode !== "undefined" && (
            <tr>
              <th scope="row">Dominanta</th>
              <td>
                {stats.mode !== null
                  ? formatCellValue(stats.mode, locale)
                  : "brak"}
              </td>
            </tr>
          )}
          {typeof stats.sum === "number" && (
            <tr>
              <th scope="row">Suma</th>
              <td>{formatNumber(stats.sum, locale, 0)}</td>
            </tr>
          )}
          {typeof stats.deviation === "number" && (
            <tr>
              <th scope="row">Odchylenie standardowe</th>
              <td>{formatNumber(stats.deviation, locale, 2)}</td>
            </tr>
          )}
          {typeof stats.skewness === "number" && (
            <tr>
              <th scope="row">Skośność</th>
              <td>{formatNumber(stats.skewness, locale, 4)}</td>
            </tr>
          )}
          {typeof stats.kurtosis === "number" && (
            <tr>
              <th scope="row">Kurtoza</th>
              <td>{formatNumber(stats.kurtosis, locale, 4)}</td>
            </tr>
          )}
          {stats.quartiles && (
            <>
              <tr>
                <th scope="row">Kwartyl Q1</th>
                <td>{formatNumber(stats.quartiles.Q1, locale, 2)}</td>
              </tr>
              <tr>
                <th scope="row">Kwartyl Q2</th>
                <td>{formatNumber(stats.quartiles.Q2, locale, 2)}</td>
              </tr>
              <tr>
                <th scope="row">Kwartyl Q3</th>
                <td>{formatNumber(stats.quartiles.Q3, locale, 2)}</td>
              </tr>
            </>
          )}
        </tbody>
      </Table>
    );
  };

  return (
    <section>
      <Row className="gy-3">
        <Col lg={4}>
          <Card>
            <Card.Header>Parametry kolumny</Card.Header>
            <Card.Body>
              <Form.Group controlId="statistics-column">
                <Form.Label>Wybierz kolumnę</Form.Label>
                <Form.Select
                  value={selectedColumn}
                  onChange={handleColumnChange}
                >
                  <option value="" disabled>
                    -- wybierz --
                  </option>
                  {numericColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>Bieżące parametry</Card.Header>
            <Card.Body>{renderStatisticsContent()}</Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Header>Dane (strona {currentPage})</Card.Header>
            <Card.Body className="p-0">
              {tableLoading ? (
                <div className="d-flex justify-content-center align-items-center py-4">
                  <Spinner animation="border" role="status" />
                </div>
              ) : tableError ? (
                <Alert variant="danger" className="m-3">
                  {tableError}
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    className="mb-0 small"
                  >
                    <thead>
                      <tr>
                        {loans.length > 0 &&
                          Object.keys(loans[0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((row, index) => (
                        <tr key={index}>
                          {Object.entries(row).map(([key, value]) => (
                            <td key={key}>{formatCellValue(value, locale)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between align-items-center">
              <span>Na stronie: {loans.length}</span>
              <ButtonGroup>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={tableLoading || currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Poprzednia
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={tableLoading || !hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Następna
                </Button>
              </ButtonGroup>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default StatisticsTab;
