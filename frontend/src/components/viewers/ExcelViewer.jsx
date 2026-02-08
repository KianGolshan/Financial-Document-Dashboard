import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

export default function ExcelViewer({ url, searchQuery = "" }) {
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch file");
        const arrayBuffer = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const parsed = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          return { name, rows: json };
        });
        if (!cancelled) {
          setSheets(parsed);
          setActiveSheet(0);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [url]);

  // Scroll to first highlight
  useEffect(() => {
    if (!loading && containerRef.current && searchQuery) {
      const firstMark = containerRef.current.querySelector("mark");
      if (firstMark) {
        firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [loading, activeSheet, searchQuery]);

  function highlightCell(value) {
    if (!searchQuery || value == null) return String(value ?? "");
    const str = String(value);
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${escaped})`, "gi");
    return str.replace(re, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading spreadsheet...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  const current = sheets[activeSheet];
  if (!current) return null;

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div className="flex gap-1 px-4 pt-3 bg-gray-100 border-b border-gray-200">
          {sheets.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSheet(i)}
              className={`px-3 py-1.5 text-xs rounded-t border border-b-0 transition ${
                i === activeSheet
                  ? "bg-white text-gray-900 font-medium"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="border-collapse text-sm w-full">
          <tbody>
            {current.rows.map((row, ri) => (
              <tr key={ri} className={ri === 0 ? "bg-gray-100 font-semibold" : "hover:bg-blue-50"}>
                {(Array.isArray(row) ? row : []).map((cell, ci) => (
                  <td
                    key={ci}
                    className="border border-gray-300 px-3 py-1.5 whitespace-nowrap"
                    dangerouslySetInnerHTML={{
                      __html: highlightCell(cell),
                    }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
