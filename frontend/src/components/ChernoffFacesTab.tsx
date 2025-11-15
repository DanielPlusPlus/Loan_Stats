import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import useLanguage from '../hooks/useLanguage';
import api from '../services/api';

const extractErrorMessage = (error: unknown, t: (k: string, f?: string) => string): string => {
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

  return t('chernoff_failed_to_fetch', 'Nie udało się pobrać wizualizacji.');
};

const ChernoffFacesTab = () => {
  const { language, t } = useLanguage();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChernoffFaces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/chernoff-faces', {
        params: { language },
        responseType: 'blob',
      });

      const imageUrl = URL.createObjectURL(response.data);
      setImageSrc(imageUrl);
    } catch (requestError) {
      setImageSrc(null);
      setError(extractErrorMessage(requestError, t));
    } finally {
      setLoading(false);
    }
  }, [language, t]);

  useEffect(() => {
    void fetchChernoffFaces();

    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [fetchChernoffFaces]);

  return (
    <section>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>{t('chernoff_title', 'Twarze Chernoffa')}</span>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => fetchChernoffFaces()}
            disabled={loading}
          >
            {t('chernoff_refresh', 'Odśwież')}
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
            <Image src={imageSrc} alt={t('chernoff_title', 'Twarze Chernoffa')} fluid />
          ) : (
            <span>{t('chernoff_no_data', 'Brak danych do wygenerowania wizualizacji.')}</span>
          )}
        </Card.Body>
      </Card>
    </section>
  );
};

export default ChernoffFacesTab;
