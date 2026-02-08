import { useEffect } from "react";
import { api } from "../api";
import PdfViewer from "./viewers/PdfViewer";
import DocxViewer from "./viewers/DocxViewer";
import ExcelViewer from "./viewers/ExcelViewer";

export default function DocumentViewer({
  investmentId,
  document,
  searchQuery = "",
  onClose,
}) {
  const viewUrl = api.viewUrl(investmentId, document.id);
  const ext = document.document_type?.toLowerCase();

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function renderViewer() {
    if (ext === ".pdf") {
      return <PdfViewer url={viewUrl} searchQuery={searchQuery} />;
    }
    if (ext === ".docx" || ext === ".doc") {
      return <DocxViewer url={viewUrl} searchQuery={searchQuery} />;
    }
    if (ext === ".xlsx" || ext === ".xls") {
      return <ExcelViewer url={viewUrl} searchQuery={searchQuery} />;
    }
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Preview not available for this file type ({ext})</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-semibold text-gray-900">
            {document.document_name}
          </h3>
          <p className="text-xs text-gray-500">{document.original_filename}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={api.downloadUrl(investmentId, document.id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Download
          </a>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Viewer body */}
      <div className="flex-1 overflow-auto bg-gray-100">
        {renderViewer()}
      </div>
    </div>
  );
}
