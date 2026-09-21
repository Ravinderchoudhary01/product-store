'use client';

import { useState } from 'react';

export default function AccessFileButton({
  token,
}: {
  token: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccessFile = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/download/${token}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to access your file'
        );
      }

      if (!data.downloadUrl) {
        throw new Error('File link is unavailable');
      }

      window.location.href = data.downloadUrl;
    } catch (error) {
      console.error('File access error:', error);

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to access your file'
      );

      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn"
        onClick={handleAccessFile}
        disabled={loading}
      >
        {loading ? 'Opening your file…' : 'Access your file'}
      </button>

      {error && (
        <p
          className="error"
          style={{ marginTop: 12 }}
        >
          {error}
        </p>
      )}
    </>
  );
}