import { FC } from 'react';
import useLanguage from '../hooks/useLanguage';

interface DescriptionProps {
  description: string;
  loading: boolean;
  error: string | null;
}

const Description: FC<DescriptionProps> = ({ description, loading, error }) => {
  const { t } = useLanguage();

  if (loading) {
    return <small className="text-muted">{t('chart_desc_loading', 'Loading description...')}</small>;
  }

  if (error) {
    return <small className="text-danger">{error}</small>;
  }

  if (description) {
    return <small className="text-muted d-block" style={{ whiteSpace: 'pre-line' }}>{description}</small>;
  }

  return null;
};

export default Description;
