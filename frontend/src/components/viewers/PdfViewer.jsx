import { useEffect, useRef } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

export default function PdfViewer({ url, searchQuery = "" }) {
  const searchPluginInstance = searchPlugin({
    keyword: searchQuery || undefined,
  });
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
  });

  const { highlight } = searchPluginInstance;
  const didSearch = useRef(false);

  useEffect(() => {
    if (searchQuery && !didSearch.current) {
      // Small delay to allow the PDF to render
      const timer = setTimeout(() => {
        highlight(searchQuery);
        didSearch.current = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, highlight]);

  return (
    <div className="h-full">
      <Worker workerUrl="/pdf.worker.min.js">
        <Viewer
          fileUrl={url}
          plugins={[searchPluginInstance, defaultLayoutPluginInstance]}
        />
      </Worker>
    </div>
  );
}
