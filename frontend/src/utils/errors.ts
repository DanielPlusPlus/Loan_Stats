import axios from 'axios';

export const extractErrorMessage = (
  error: unknown,
  t: (key: string, fallback?: string) => string
): string => {
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

  return t('chart_failed_to_fetch', 'Nie udało się pobrać wykresu.');
};
