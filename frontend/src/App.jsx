import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import Sidebar from "./components/Sidebar";
import InvestmentPanel from "./components/InvestmentPanel";
import InvestmentForm from "./components/InvestmentForm";
import SearchTab from "./components/SearchTab";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [investments, setInvestments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [error, setError] = useState("");

  const loadInvestments = useCallback(async () => {
    try {
      const data = await api.listInvestments();
      setInvestments(data.items);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const selected = investments.find((i) => i.id === selectedId) || null;

  function handleAdd() {
    setEditingInvestment(null);
    setFormOpen(true);
  }

  function handleEdit(inv) {
    setEditingInvestment(inv);
    setFormOpen(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this investment and all its documents?")) return;
    try {
      await api.deleteInvestment(id);
      if (selectedId === id) setSelectedId(null);
      loadInvestments();
    } catch (e) {
      setError(e.message);
    }
  }

  function handleFormDone() {
    setFormOpen(false);
    setEditingInvestment(null);
    loadInvestments();
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Finance Document Manager</h1>
        <nav className="flex gap-1">
          <button
            onClick={() => setTab("dashboard")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition ${
              tab === "dashboard"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTab("search")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition ${
              tab === "search"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            Search
          </button>
        </nav>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-red-700 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Main content */}
      {tab === "dashboard" ? (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            investments={investments}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <main className="flex-1 overflow-auto p-6">
            {selected ? (
              <InvestmentPanel investment={selected} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select an investment from the sidebar
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <SearchTab />
        </div>
      )}

      {/* Investment create/edit modal */}
      {formOpen && (
        <InvestmentForm
          investment={editingInvestment}
          onClose={() => {
            setFormOpen(false);
            setEditingInvestment(null);
          }}
          onDone={handleFormDone}
        />
      )}
    </div>
  );
}
