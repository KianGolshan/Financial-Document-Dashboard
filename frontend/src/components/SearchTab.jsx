import { useState, useEffect } from "react";
import { api } from "../api";

export default function SearchTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.search(query);
        setResults(data.results);
        setTotal(data.total);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Search Documents
      </h2>

      {/* Search input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, phrase, or sentence..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        {loading && (
          <div className="absolute right-3 top-3.5 text-gray-400 text-sm">
            Searching...
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Results info */}
      {query.trim() && !loading && (
        <p className="text-sm text-gray-500 mb-4">
          {total} result{total !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Results list */}
      <div className="space-y-4">
        {results.map((r) => (
          <div
            key={r.document.id}
            className="bg-white rounded-lg shadow border border-gray-100 p-5"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {r.document.document_name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {r.document.original_filename}
                  {r.document.investment_series &&
                    ` \u00b7 ${r.document.investment_series}`}
                  {r.document.document_date &&
                    ` \u00b7 ${r.document.document_date}`}
                </p>
              </div>
              <a
                href={r.download_url}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition shrink-0 ml-4"
              >
                Download
              </a>
            </div>

            {/* Snippets with highlighted keywords */}
            {r.snippets.length > 0 && (
              <div className="mt-3 space-y-2">
                {r.snippets.map((snippet, i) => (
                  <p
                    key={i}
                    className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 leading-relaxed [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded"
                    dangerouslySetInnerHTML={{ __html: snippet }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {query.trim() && !loading && results.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No matching documents found
        </div>
      )}
    </div>
  );
}
