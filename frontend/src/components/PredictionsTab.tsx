import Card from 'react-bootstrap/Card';
import useLanguage from '../hooks/useLanguage';

const PredictionsTab = () => {
  const { t } = useLanguage();
  return (
    <section>
      <Card>
        <Card.Header>{t('ui_tab_predictions', 'Predykcje')}</Card.Header>
        <Card.Body>
          <p className="mb-0">{t('predictions_in_progress', 'W budowie')}</p>
        </Card.Body>
      </Card>
    </section>
  );
};

export default PredictionsTab;
