import { useCallback, useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import ToggleButton from 'react-bootstrap/ToggleButton';
import useLanguage from '../hooks/useLanguage';
import api from '../services/api';

import { extractErrorMessage } from '../utils/errors';

const ChernoffFacesTab = () => {
  const { language, t } = useLanguage();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [legendSrc, setLegendSrc] = useState<string | null>(null);
  const [qdSrc, setQdSrc] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [legendLoading, setLegendLoading] = useState(false);
  const [qdLoading, setQdLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legendError, setLegendError] = useState<string | null>(null);
  const [qdError, setQdError] = useState<string | null>(null);

  const [mode, setMode] = useState<'normal' | 'prognosis' | 'merged'>('normal');
  const [face, setFace] = useState<string>('all');
  const [qdCompare, setQdCompare] = useState<boolean>(false);

  const [showLegendModal, setShowLegendModal] = useState(false);
  const [showFacesModal, setShowFacesModal] = useState(false);
  const [showQdModal, setShowQdModal] = useState(false);

  const fetchChernoffFaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/chernoff-faces', {
        params: { language, mode, face: face !== 'all' ? face : undefined },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      setImageSrc(url);
    } catch (e) {
      setImageSrc(null);
      setError(extractErrorMessage(e, t));
    } finally {
      setLoading(false);
    }
  }, [language, mode, face, t]);

  const fetchChernoffLegend = useCallback(async () => {
    setLegendLoading(true);
    setLegendError(null);
    try {
      const res = await api.get('/chernoff-faces/legend', {
        params: { language },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      setLegendSrc(url);
    } catch (e) {
      setLegendSrc(null);
      setLegendError(extractErrorMessage(e, t));
    } finally {
      setLegendLoading(false);
    }
  }, [language, t]);

  const fetchQuantilesDistance = useCallback(async () => {
    setQdLoading(true);
    setQdError(null);
    try {
      const params: Record<string, string | boolean> = { language, mode, compare: qdCompare };
      if (face !== 'all') params.column = face;
      const res = await api.get('/quantiles-distance', { params, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      setQdSrc(url);
    } catch (e) {
      setQdSrc(null);
      setQdError(extractErrorMessage(e, t));
    } finally {
      setQdLoading(false);
    }
  }, [language, mode, face, qdCompare, t]);

  useEffect(() => {
    void fetchChernoffFaces();
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
    };
  }, [fetchChernoffFaces]);

  useEffect(() => {
    void fetchChernoffLegend();
    return () => {
      if (legendSrc && legendSrc.startsWith('blob:')) URL.revokeObjectURL(legendSrc);
    };
  }, [language, fetchChernoffLegend]);

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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <span className="text-nowrap">{t('chernoff_title', 'Twarze Chernoffa')}</span>
            <div className="d-flex flex-wrap align-items-center gap-2" style={{ minWidth: 0 }}>
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

              <Form.Group className="mb-0" style={{ minWidth: '200px' }}>
                <Form.Select
                  size="sm"
                  title={t('chernoff_select_attribute', 'Select attribute')}
                  value={face}
                  onChange={(e) => setFace(e.target.value)}
                  aria-label={t('chernoff_select_attribute', 'Select attribute')}
                >
                  <option value="all">{t('chernoff_face_all', 'Wszystkie')}</option>
                  <option value="credit_score">
                    {t('data_col_credit_score', 'Credit Rating')}
                  </option>
                  <option value="income">{t('data_col_income', 'Income')}</option>
                  <option value="loan_amount">{t('data_col_loan_amount', 'Loan amount')}</option>
                  <option value="points">{t('data_col_points', 'Points')}</option>
                  <option value="years_employed">
                    {t('data_col_years_employed', 'Years employed')}
                  </option>
                </Form.Select>
              </Form.Group>

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
                style={{ minWidth: '280px' }}
              />
            </div>
          </div>
        </Card.Header>

        <Card.Body
          className="d-flex flex-column align-items-center justify-content-start gap-4 overflow-auto"
          style={{ minHeight: 'auto', maxWidth: '100%' }}
        >
          <div
            className="w-100 d-flex align-items-center justify-content-center overflow-hidden"
            style={{ minHeight: '300px', cursor: 'pointer' }}
            onClick={() => setShowLegendModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowLegendModal(true)}
          >
            {legendLoading ? (
              <Spinner animation="border" />
            ) : legendError ? (
              <Alert variant="danger" className="w-100">
                {legendError}
              </Alert>
            ) : legendSrc ? (
              <Image
                src={legendSrc}
                alt={t('chernoff_legend_title', 'Legenda Twarzy Chernoffa')}
                fluid
                style={{
                  maxHeight: '45vh',
                  width: 'auto',
                  objectFit: 'contain',
                  cursor: 'pointer',
                }}
              />
            ) : null}
          </div>

          <hr className="w-100 my-2" />

          <div
            className="w-100 d-flex align-items-center justify-content-center overflow-hidden"
            style={{ minHeight: '400px', cursor: 'pointer' }}
            onClick={() => setShowFacesModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowFacesModal(true)}
          >
            {loading ? (
              <Spinner animation="border" role="status" />
            ) : error ? (
              <Alert variant="danger" className="w-100 text-center">
                {error}
              </Alert>
            ) : imageSrc ? (
              <Image
                src={imageSrc}
                alt={t('chernoff_title', 'Twarze Chernoffa')}
                fluid
                style={{
                  maxHeight: '50vh',
                  width: 'auto',
                  objectFit: 'contain',
                  cursor: 'pointer',
                }}
              />
            ) : (
              <span>{t('chernoff_no_data', 'Brak danych do wygenerowania wizualizacji.')}</span>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-3">
        <Card.Header>
          {t('chart_quantiles_distance_label', 'Odległość kwartylów od średniej')}
        </Card.Header>
        <Card.Body
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: 240, cursor: 'pointer' }}
          onClick={() => setShowQdModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setShowQdModal(true)}
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
              style={{ maxHeight: '50vh', width: '100%', objectFit: 'contain', cursor: 'pointer' }}
            />
          ) : (
            <span>{t('chart_select_to_display', 'Wybierz wykres, aby go wyświetlić.')}</span>
          )}
        </Card.Body>
      </Card>

      <Modal show={showLegendModal} onHide={() => setShowLegendModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('chernoff_legend_title', 'Legenda Twarzy Chernoffa')}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: '500px' }}
        >
          {legendSrc ? (
            <Image
              src={legendSrc}
              alt={t('chernoff_legend_title', 'Legenda Twarzy Chernoffa')}
              fluid
            />
          ) : null}
        </Modal.Body>
      </Modal>

      <Modal show={showFacesModal} onHide={() => setShowFacesModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('chernoff_title', 'Twarze Chernoffa')}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: '600px' }}
        >
          {imageSrc ? (
            <Image src={imageSrc} alt={t('chernoff_title', 'Twarze Chernoffa')} fluid />
          ) : null}
        </Modal.Body>
      </Modal>

      <Modal show={showQdModal} onHide={() => setShowQdModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {t('chart_quantiles_distance_label', 'Odległość kwartylów od średniej')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: '500px' }}
        >
          {qdSrc ? (
            <Image
              src={qdSrc}
              alt={t('chart_quantiles_distance_label', 'Odległość kwartylów od średniej')}
              fluid
            />
          ) : null}
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default ChernoffFacesTab;
