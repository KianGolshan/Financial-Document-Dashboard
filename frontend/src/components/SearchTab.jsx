import { useState, useEffect } from "react";
import { api } from "../api";
import DocumentViewer from "./DocumentViewer";

export default function SearchTab({ investments = [] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterInvestmentId, setFilterInvestmentId] = useState("");
  const [filterSecurityId, setFilterSecurityId] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerQuery, setViewerQuery] = useState("");

  const selectedInvestment = investments.find(
    (i) => i.id === Number(filterInvestmentId)
  );
  const securities = selectedInvestment?.securities || [];

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
        const filters = {};
        if (filterInvestmentId) filters.investment_id = filterInvestmentId;
        if (filterSecurityId) filters.security_id = filterSecurityId;
        if (filterDateFrom) filters.date_from = filterDateFrom;
        if (filterDateTo) filters.date_to = filterDateTo;
        const data = await api.search(query, filters);
        setResults(data.results);
        setTotal(data.total);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, filterInvestmentId, filterSecurityId, filterDateFrom, filterDateTo]);

  function handleView(r) {
    setViewerDoc({ investmentId: r.document.investment_id, document: r.document });
    setViewerQuery(query);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Search Documents
      </h2>

      {/* Search input */}
      <div className="relative mb-4">
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

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {/* Filter bar */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Investment
            </label>
            <select
              value={filterInvestmentId}
              onChange={(e) => {
                setFilterInvestmentId(e.target.value);
                setFilterSecurityId("");
              }}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All investments</option>
              {investments.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.investment_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Security
            </label>
            <select
              value={filterSecurityId}
              onChange={(e) => setFilterSecurityId(e.target.value)}
              disabled={!filterInvestmentId}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">All securities</option>
              {securities.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.investment_round || sec.description || `Security #${sec.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

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
                  {r.investment_name && <span>{r.investment_name}</span>}
                  {r.investment_round && <span> &middot; {r.investment_round}</span>}
                  {r.document.original_filename &&
                    <span> &middot; {r.document.original_filename}</span>}
                  {r.document.document_date &&
                    <span> &middot; {r.document.document_date}</span>}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <button
                  onClick={() => handleView(r)}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded transition"
                >
                  View
                </button>
                <a
                  href={r.download_url}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition"
                >
                  Download
                </a>
              </div>
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

      {viewerDoc && (
        <DocumentViewer
          investmentId={viewerDoc.investmentId}
          document={viewerDoc.document}
          searchQuery={viewerQuery}
          onClose={() => {
            setViewerDoc(null);
            setViewerQuery("");
          }}
        />
      )}
    </div>
  );
}
