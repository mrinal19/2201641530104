import React, { useState } from 'react';

/**
 * Minimal frontend to test the URL shortener backend.
 * Plain React + fetch so it works without extra deps.
 */

export default function App() {
  const [url, setUrl] = useState('');
  const [validity, setValidity] = useState('');
  const [shortcode, setShortcode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API || 'http://localhost:4000';

  const create = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL.');
      return;
    }

    const body = { url: url.trim() };
    if (validity.trim()) body.validity = Number(validity.trim());
    if (shortcode.trim()) body.shortcode = shortcode.trim();

    try {
      const res = await fetch(`${API_BASE}/shorturls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || JSON.stringify(data));
      } else {
        setResult(data);
        // clear inputs (optional)
        setUrl('');
        setValidity('');
        setShortcode('');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 6 }}>URL Shortener — Frontend</h1>
      <p style={{ marginTop: 0, color: '#666' }}>Simple UI to create a short URL using your backend at <code>{API_BASE}</code></p>

      <form onSubmit={create} style={{ marginTop: 20, marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Long URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/path"
            style={{ width: '100%', padding: 8, fontSize: 14 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Validity (minutes) — optional</label>
            <input
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              placeholder="30"
              style={{ width: '100%', padding: 8, fontSize: 14 }}
            />
          </div>

          <div style={{ width: 220 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Shortcode — optional</label>
            <input
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              placeholder="myCode1"
              style={{ width: '100%', padding: 8, fontSize: 14 }}
            />
          </div>
        </div>

        <div>
          <button type="submit" style={{ padding: '8px 14px', fontSize: 14 }}>Create short link</button>
        </div>
      </form>

      {error && (
        <div style={{ marginBottom: 12, color: 'white', background: '#c62828', padding: 10, borderRadius: 4 }}>
          Error: {String(error)}
        </div>
      )}

      {result && (
        <div style={{ padding: 12, borderRadius: 6, background: '#f4f6f8', border: '1px solid #ddd' }}>
          <div><strong>Short Link:</strong></div>
          <div style={{ marginTop: 6 }}>
            <a href={result.shortLink} target="_blank" rel="noreferrer">{result.shortLink}</a>
          </div>
          <div style={{ marginTop: 10 }}>
            <strong>Expiry:</strong> {result.expiry}
          </div>
        </div>
      )}

      <hr style={{ margin: '22px 0' }} />

      <div style={{ color: '#666' }}>
        Tip: After creating a short link, open it in a new tab to confirm redirect, then fetch stats from the backend with:
        <pre style={{ background: '#222', color: '#fff', padding: 8, borderRadius: 6 }}>
{`curl http://localhost:4000/shorturls/<code>/stats`}
        </pre>
      </div>
    </div>
  );
}
