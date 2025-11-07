import { useCallback, useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import api from "../services/api";
import useLanguage from "../hooks/useLanguage";
import type { ApiResponse } from "../interfaces/Loan";

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

  return "Nie udało się pobrać wizualizacji.";
};

const ChernoffFacesTab = () => {
  const { language } = useLanguage();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChernoffFaces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse<string>>("/chernoff-faces", {
        params: { language },
      });

      if (!response.data.success) {
        throw new Error(
          response.data.error ?? "Serwer zwrócił niepoprawną odpowiedź."
        );
      }

      setImageSrc(`data:image/png;base64,${response.data.result}`);
    } catch (requestError) {
      setImageSrc(null);
      setError(extractErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void fetchChernoffFaces();
  }, [fetchChernoffFaces]);

  return (
    <section>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Twarze Chernoffa</span>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => fetchChernoffFaces()}
            disabled={loading}
          >
            Odśwież
          </Button>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center">
          {loading ? (
            <Spinner animation="border" role="status" />
          ) : error ? (
            <Alert variant="danger" className="w-100 text-center">
              {error}
            </Alert>
          ) : imageSrc ? (
            <Image src={imageSrc} alt="Twarze Chernoffa" fluid />
          ) : (
            <span>Brak danych do wygenerowania wizualizacji.</span>
          )}
        </Card.Body>
      </Card>
    </section>
  );
};

export default ChernoffFacesTab;
