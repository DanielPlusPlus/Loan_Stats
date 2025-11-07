import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import api from "../services/api";
import useLanguage from "../hooks/useLanguage";
import type { ApiResponse } from "../interfaces/Loan";

interface ChartDefinition {
  id: string;
  endpoint: string;
  label: string;
  description?: string;
}

const CHARTS: ChartDefinition[] = [
  {
    id: "income-hist",
    endpoint: "/income-hist",
    label: "Rozkład dochodów wg decyzji",
    description: "Gęstość dochodów podzielona według decyzji kredytowej.",
  },
  {
    id: "credit-vs-loan",
    endpoint: "/credit-vs-loan",
    label: "Kwota pożyczki vs. Credit Score",
  },
  {
    id: "employment-box",
    endpoint: "/employment-box",
    label: "Staż pracy wg decyzji",
  },
  {
    id: "corr-heatmap",
    endpoint: "/corr-heatmap",
    label: "Macierz korelacji",
  },
  {
    id: "income-vs-score",
    endpoint: "/income-vs-score",
    label: "Dochód vs Credit Score",
  },
  {
    id: "income-vs-years",
    endpoint: "/income-vs-years",
    label: "Dochód vs staż pracy",
  },
  {
    id: "credit-violin",
    endpoint: "/credit-violin",
    label: "Rozkład Credit Score wg dochodu",
  },
  {
    id: "avg-income-by-city",
    endpoint: "/avg-income-by-city",
    label: "Średni dochód w miastach",
  },
  {
    id: "pairplot-main",
    endpoint: "/pairplot-main",
    label: "Relacje między zmiennymi",
  },
  {
    id: "loan-amount-box",
    endpoint: "/loan-amount-box",
    label: "Kwota pożyczki wg decyzji",
  },
  {
    id: "credit-score-hist",
    endpoint: "/credit-score-hist",
    label: "Rozkład Credit Score",
  },
  {
    id: "income-hist-density",
    endpoint: "/income-hist-density",
    label: "Histogram dochodów",
  },
  {
    id: "income-box",
    endpoint: "/income-box",
    label: "Boxplot dochodów",
  },
  {
    id: "income-ecdf",
    endpoint: "/income-ecdf",
    label: "Dystrybuanta dochodu",
  },
  {
    id: "income-frequency",
    endpoint: "/income-frequency",
    label: "Liczebność wg przedziałów dochodu",
  },
  {
    id: "income-relative-frequency",
    endpoint: "/income-relative-frequency",
    label: "Częstości względne dochodu",
  },
  {
    id: "loan-pie",
    endpoint: "/loan-pie",
    label: "Udział decyzji kredytowych",
  },
  {
    id: "loan-group-means",
    endpoint: "/loan-group-means",
    label: "Średnie cech wg decyzji",
  },
  {
    id: "income-radar",
    endpoint: "/income-radar",
    label: "Radar średnich wartości",
  },
  {
    id: "age-pyramid",
    endpoint: "/age-pyramid",
    label: "Piramida wieku (staż pracy)",
  },
  {
    id: "income-line",
    endpoint: "/income-line",
    label: "Wykres dochodu (sortowany)",
  },
  {
    id: "kurtosis-comparison",
    endpoint: "/kurtosis-comparison",
    label: "Porównanie kurtozy",
  },
];

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (typeof data?.error === "string") {
      return data.error;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Nie udało się pobrać wykresu.";
};

const ChartsTab = () => {
  const { language } = useLanguage();
  const [selectedChart, setSelectedChart] = useState<string>(
    CHARTS[0]?.id ?? ""
  );
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
        setError("Nieznany wykres.");
        return;
      }

      try {
        const response = await api.get<ApiResponse<string>>(
          definition.endpoint,
          {
            params: { language },
          }
        );

        if (!response.data.success) {
          throw new Error(
            response.data.error ?? "Serwer zwrócił niepoprawną odpowiedź."
          );
        }

        setChartSrc(`data:image/png;base64,${response.data.result}`);
      } catch (requestError) {
        setChartSrc(null);
        setError(extractErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    },
    [language]
  );

  useEffect(() => {
    if (selectedChart) {
      void fetchChart(selectedChart);
    }
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
            <Card.Header>Wybierz wykres</Card.Header>
            <Card.Body>
              <Form.Group controlId="chart-selector">
                <Form.Select value={selectedChart} onChange={handleChange}>
                  {CHARTS.map((chart) => (
                    <option key={chart.id} value={chart.id}>
                      {chart.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {selectedDefinition?.description && (
                <small className="text-muted d-block mt-2">
                  {selectedDefinition.description}
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={8} lg={9}>
          <Card className="h-100">
            <Card.Header>Podgląd</Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              {loading ? (
                <Spinner animation="border" role="status" />
              ) : error ? (
                <Alert variant="danger" className="w-100 text-center">
                  {error}
                </Alert>
              ) : chartSrc ? (
                <Image
                  src={chartSrc}
                  alt={selectedDefinition?.label ?? "Wykres"}
                  fluid
                />
              ) : (
                <span>Wybierz wykres, aby go wyświetlić.</span>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default ChartsTab;
