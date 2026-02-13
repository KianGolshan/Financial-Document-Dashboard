import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import Sidebar from "./components/Sidebar";
import InvestmentPanel from "./components/InvestmentPanel";
import InvestmentForm from "./components/InvestmentForm";
import SecurityForm from "./components/SecurityForm";
import SearchTab from "./components/SearchTab";
import FinancialDataView from "./components/FinancialDataView";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [investments, setInvestments] = useState([]);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState(null);
  const [selectedSecurityId, setSelectedSecurityId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [securityFormOpen, setSecurityFormOpen] = useState(false);
  const [securityFormInvestmentId, setSecurityFormInvestmentId] = useState(null);
  const [editingSecurity, setEditingSecurity] = useState(null);
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

  const selected = investments.find((i) => i.id === selectedInvestmentId) || null;

  function handleSelectInvestment(investmentId) {
    setSelectedInvestmentId(investmentId);
    setSelectedSecurityId(null);
  }

  function handleSelectSecurity(investmentId, securityId) {
    setSelectedInvestmentId(investmentId);
    setSelectedSecurityId(securityId);
  }

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
      if (selectedInvestmentId === id) {
        setSelectedInvestmentId(null);
        setSelectedSecurityId(null);
      }
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

  function handleAddSecurity(investmentId) {
    setSecurityFormInvestmentId(investmentId);
    setEditingSecurity(null);
    setSecurityFormOpen(true);
  }

  function handleEditSecurity(investmentId, security) {
    setSecurityFormInvestmentId(investmentId);
    setEditingSecurity(security);
    setSecurityFormOpen(true);
  }

  function handleSecurityFormDone() {
    setSecurityFormOpen(false);
    setEditingSecurity(null);
    setSecurityFormInvestmentId(null);
    loadInvestments();
  }

  async function handleDeleteSecurity(investmentId, securityId) {
    if (!confirm("Delete this security and all its documents?")) return;
    try {
      await api.deleteSecurity(investmentId, securityId);
      if (selectedSecurityId === securityId) setSelectedSecurityId(null);
      loadInvestments();
    } catch (e) {
      setError(e.message);
    }
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
            onClick={() => setTab("financials")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition ${
              tab === "financials"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            Financials
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
            selectedInvestmentId={selectedInvestmentId}
            selectedSecurityId={selectedSecurityId}
            onSelectInvestment={handleSelectInvestment}
            onSelectSecurity={handleSelectSecurity}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddSecurity={handleAddSecurity}
            onDeleteSecurity={handleDeleteSecurity}
          />
          <main className="flex-1 overflow-auto p-6">
            {selected ? (
              <InvestmentPanel
                investment={selected}
                selectedSecurityId={selectedSecurityId}
                onSelectSecurity={(secId) => handleSelectSecurity(selected.id, secId)}
                onBackToInvestment={() => setSelectedSecurityId(null)}
                onEditSecurity={(sec) => handleEditSecurity(selected.id, sec)}
                onAddSecurity={() => handleAddSecurity(selected.id)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select an investment from the sidebar
              </div>
            )}
          </main>
        </div>
      ) : tab === "financials" ? (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            investments={investments}
            selectedInvestmentId={selectedInvestmentId}
            selectedSecurityId={selectedSecurityId}
            onSelectInvestment={handleSelectInvestment}
            onSelectSecurity={handleSelectSecurity}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddSecurity={handleAddSecurity}
            onDeleteSecurity={handleDeleteSecurity}
          />
          <main className="flex-1 overflow-auto p-6">
            {selected ? (
              <FinancialDataView
                investmentId={selected.id}
                investmentName={selected.investment_name}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select an investment to view financial data
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <SearchTab investments={investments} />
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

      {/* Security create/edit modal */}
      {securityFormOpen && (
        <SecurityForm
          investmentId={securityFormInvestmentId}
          security={editingSecurity}
          onClose={() => {
            setSecurityFormOpen(false);
            setEditingSecurity(null);
            setSecurityFormInvestmentId(null);
          }}
          onDone={handleSecurityFormDone}
        />
      )}
    </div>
  );
}
