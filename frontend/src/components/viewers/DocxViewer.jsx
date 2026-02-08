import { useState, useEffect, useRef } from "react";
import mammoth from "mammoth";

export default function DocxViewer({ url, searchQuery = "" }) {
  const [html, setHtml] = useState("");
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
        if (!res.ok) throw new Error("Failed to fetch document");
        const arrayBuffer = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (!cancelled) setHtml(result.value);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [url]);

  // Highlight search query and scroll to first match
  const highlightedHtml = (() => {
    if (!searchQuery || !html) return html;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${escaped})`, "gi");
    return html.replace(re, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
  })();

  useEffect(() => {
    if (!loading && containerRef.current && searchQuery) {
      const firstMark = containerRef.current.querySelector("mark");
      if (firstMark) {
        firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [loading, highlightedHtml, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading document...
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

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-full">
      <div
        ref={containerRef}
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
