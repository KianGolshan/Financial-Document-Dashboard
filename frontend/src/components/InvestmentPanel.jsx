import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import UploadModal from "./UploadModal";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function InvestmentPanel({ investment }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.listDocuments(investment.id);
      setDocuments(data.items);
    } catch (e) {
      setError(e.message);
    }
  }, [investment.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(docId) {
    if (!confirm("Delete this document?")) return;
    try {
      await api.deleteDocument(investment.id, docId);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {investment.investment_name}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {investment.series && <span>{investment.series} &middot; </span>}
            {investment.description || "No description"}
          </p>
        </div>
        <button
          onClick={() => setUploading(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition"
        >
          Upload Documents
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No documents uploaded yet
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {doc.document_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                    {doc.original_filename}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {doc.document_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatSize(doc.file_size)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {doc.document_date || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a
                        href={api.downloadUrl(investment.id, doc.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {uploading && (
        <UploadModal
          investmentId={investment.id}
          onClose={() => setUploading(false)}
          onDone={() => {
            setUploading(false);
            load();
          }}
        />
      )}
    </div>
  );
}
