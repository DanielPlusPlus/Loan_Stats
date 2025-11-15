import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import ToggleButton from 'react-bootstrap/ToggleButton';
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
  const [mode, setMode] = useState<'normal' | 'prognosis' | 'merged'>('normal');
  const [face, setFace] = useState<string>('all');
  const [qdSrc, setQdSrc] = useState<string | null>(null);
  const [qdLoading, setQdLoading] = useState(false);
  const [qdError, setQdError] = useState<string | null>(null);
  const [qdCompare, setQdCompare] = useState<boolean>(false);

  const fetchChernoffFaces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/chernoff-faces', {
        params: { language, mode, face: face !== 'all' ? face : undefined },
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
  }, [language, mode, face, t]);

  useEffect(() => {
    void fetchChernoffFaces();

    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [fetchChernoffFaces]);

  const fetchQuantilesDistance = useCallback(async () => {
    setQdLoading(true);
    setQdError(null);
    try {
      const params: Record<string, string | boolean> = { language, mode, compare: qdCompare };
      if (face !== 'all') {
        params.column = face;
      }
      const res = await api.get('/quantiles-distance', {
        params,
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      if (qdSrc && qdSrc.startsWith('blob:')) URL.revokeObjectURL(qdSrc);
      setQdSrc(url);
    } catch (e) {
      setQdSrc(null);
      setQdError(extractErrorMessage(e, t));
    } finally {
      setQdLoading(false);
    }
  }, [language, mode, face, qdCompare, t]);

  useEffect(() => {
    void fetchQuantilesDistance();
    return () => {
      if (qdSrc && qdSrc.startsWith('blob:')) URL.revokeObjectURL(qdSrc);
    };
  }, [fetchQuantilesDistance]);

  return (
    <section>
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <span>{t('chernoff_title', 'Twarze Chernoffa')}</span>
            <div className="d-flex align-items-center gap-2">
              <ButtonGroup>
                <ToggleButton
                  id="chernoff-mode-normal"
                  type="radio"
                  variant={mode === 'normal' ? 'primary' : 'outline-primary'}
                  name="mode"
                  value="normal"
                  checked={mode === 'normal'}
                  onChange={() => setMode('normal')}
                  size="sm"
                >
                  {t('ui_mode_normal', 'Normalne')}
                </ToggleButton>
                <ToggleButton
                  id="chernoff-mode-prog"
                  type="radio"
                  variant={mode === 'prognosis' ? 'primary' : 'outline-primary'}
                  name="mode"
                  value="prognosis"
                  checked={mode === 'prognosis'}
                  onChange={() => setMode('prognosis')}
                  size="sm"
                >
                  {t('ui_mode_prognosis', 'Prognoza')}
                </ToggleButton>
                <ToggleButton
                  id="chernoff-mode-merged"
                  type="radio"
                  variant={mode === 'merged' ? 'primary' : 'outline-primary'}
                  name="mode"
                  value="merged"
                  checked={mode === 'merged'}
                  onChange={() => setMode('merged')}
                  size="sm"
                >
                  {t('ui_mode_merged', 'Połączone')}
                </ToggleButton>
              </ButtonGroup>
              <Form.Select
                size="sm"
                style={{ width: 220 }}
                value={face}
                onChange={(e) => setFace(e.target.value)}
              >
                <option value="all">{t('chernoff_face_all', 'Wszystkie')}</option>
                <option value="credit_score">{t('data_col_credit_score', 'Credit score')}</option>
                <option value="income">{t('data_col_income', 'Income')}</option>
                <option value="loan_amount">{t('data_col_loan_amount', 'Loan amount')}</option>
                <option value="points">{t('data_col_points', 'Points')}</option>
                <option value="years_employed">
                  {t('data_col_years_employed', 'Years employed')}
                </option>
              </Form.Select>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => fetchChernoffFaces()}
                disabled={loading}
              >
                {t('chernoff_refresh', 'Odśwież')}
              </Button>
              <Form.Check
                type="switch"
                id="qd-compare"
                label={t('chart_compare_overlay', 'Porównaj (nakładka Normalne vs Prognoza)')}
                checked={qdCompare}
                onChange={(e) => setQdCompare(e.currentTarget.checked)}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: '65vh' }}
        >
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

      <Card className="mt-3">
        <Card.Header>
          {t('chart_quantiles_distance_label', 'Odległość kwartylów od średniej')}
        </Card.Header>
        <Card.Body
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: 240 }}
        >
          {qdLoading ? (
            <Spinner animation="border" role="status" />
          ) : qdError ? (
            <Alert variant="danger" className="w-100 text-center">
              {qdError}
            </Alert>
          ) : qdSrc ? (
            <Image
              src={qdSrc}
              alt={t('chart_quantiles_distance_label', 'Odległość kwartylów od średniej')}
              fluid
              style={{ maxHeight: '50vh', objectFit: 'contain' }}
            />
          ) : (
            <span>{t('chart_select_to_display', 'Wybierz wykres, aby go wyświetlić.')}</span>
          )}
        </Card.Body>
      </Card>
    </section>
  );
};

export default ChernoffFacesTab;
