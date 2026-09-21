// 'use client';

// import { useState } from 'react';

// export default function DownloadButton({
//   token,
// }: {
//   token: string;
// }) {
//   const [downloading, setDownloading] = useState(false);

//   const handleDownload = () => {
//     if (downloading) return;

//     setDownloading(true);

//     // Start the browser download
//     window.location.href = `/api/download/${token}`;

//     // Prevent double-clicking while the request is being processed
//     setTimeout(() => {
//       setDownloading(false);
//     }, 15000);
//   };

//   return (
//     <button
//       type="button"
//       className="btn"
//       onClick={handleDownload}
//       disabled={downloading}
//     >
//       {downloading ? 'Downloading…' : 'Download file'}
//     </button>
//   );
// }

'use client';

import { useState } from 'react';

export default function DownloadButton({
  token,
}: {
  token: string;
}) {
  const [downloading, setDownloading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleDownload = async () => {
    if (downloading) return;

    setDownloading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/download/${token}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to get download link'
        );
      }

      if (!data.downloadUrl) {
        throw new Error(
          'Download link is unavailable'
        );
      }

      // Open Google Drive
      window.location.href =
        data.downloadUrl;

    } catch (error: any) {
      console.error(
        'Download error:',
        error
      );

      setError(
        error.message ||
          'Unable to download the file'
      );

      setDownloading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn"
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading
          ? 'Opening download…'
          : 'Download file'}
      </button>

      {error && (
        <p
          className="error"
          style={{
            marginTop: 12,
          }}
        >
          {error}
        </p>
      )}
    </>
  );
}