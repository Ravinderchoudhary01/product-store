'use client';

import { useState } from 'react';

export default function DownloadButton({
  token,
}: {
  token: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (downloading) return;

    setDownloading(true);

    // Start the browser download
    window.location.href = `/api/download/${token}`;

    // Prevent double-clicking while the request is being processed
    setTimeout(() => {
      setDownloading(false);
    }, 15000);
  };

  return (
    <button
      type="button"
      className="btn"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? 'Downloading…' : 'Download file'}
    </button>
  );
}