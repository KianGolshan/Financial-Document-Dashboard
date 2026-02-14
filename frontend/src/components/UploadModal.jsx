import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { api } from "../api";

export default function UploadModal({ investmentId, securityId, onClose, onDone }) {
  const [files, setFiles] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  async function handleSubmit(e) {
    e.preventDefault();
    if (files.length === 0) return setError("Select at least one file");
    if (!documentName.trim()) return setError("Document name is required");

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      for (const f of files) {
        formData.append("files", f);
      }
      formData.append("document_name", documentName);
      if (documentDate) formData.append("document_date", documentDate);
      if (securityId) formData.append("security_id", securityId);

      await api.uploadDocuments(investmentId, formData);
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChooseFiles() {
    inputRef.current?.click();
  }

  function handleFileChange(e) {
    setFiles([...e.target.files]);
  }

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        style={{ position: "relative", zIndex: 10000 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Upload Documents</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* File picker */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Files (.pdf, .doc, .docx, .xlsx, .xls)
            </span>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xlsx,.xls"
              onChange={handleFileChange}
              style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}
            />
            <button
              type="button"
              onClick={handleChooseFiles}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
            >
              <span className="text-sm text-gray-600">
                {files.length === 0
                  ? "Click to choose files"
                  : `${files.length} file(s) selected`}
              </span>
            </button>
            {files.length > 0 && (
              <ul className="mt-2 text-xs text-gray-500 space-y-0.5">
                {[...files].map((f, i) => (
                  <li key={i}>
                    {f.name} ({(f.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Name
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g. Q1 Financial Report"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Document Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Date (optional)
            </label>
            <input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm px-4 py-2 rounded transition"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
