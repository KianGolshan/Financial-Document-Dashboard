import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

const STATEMENT_TABS = [
  { key: "income_statement", label: "Income Statement" },
  { key: "balance_sheet", label: "Balance Sheet" },
  { key: "cash_flow", label: "Cash Flow" },
];

const REVIEW_BADGES = {
  pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-700" },
  reviewed: { label: "Reviewed", cls: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-700" },
};

function formatNumber(value) {
  if (value == null) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function ReviewBadge({ status }) {
  const badge = REVIEW_BADGES[status] || REVIEW_BADGES.pending;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${badge.cls}`}>
      {badge.label}
    </span>
  );
}

function EditableCell({ item, field, onSave, locked }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");

  const isValue = field === "value";
  const current = isValue
    ? item.edited_value ?? item.value
    : item.edited_label ?? item.label;

  function startEdit() {
    if (locked) return;
    setVal(current != null ? String(current) : "");
    setEditing(true);
  }

  function save() {
    setEditing(false);
    const payload = isValue
      ? { edited_value: val === "" ? null : parseFloat(val) }
      : { edited_label: val || null };
    onSave(item.id, payload);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={isValue ? "number" : "text"}
        step="any"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className="w-full px-1 py-0.5 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
    );
  }

  const display = isValue ? formatNumber(current) : current;
  const modified = item.is_user_modified && (
    isValue ? item.edited_value != null : item.edited_label != null
  );

  return (
    <span
      onClick={startEdit}
      className={`cursor-pointer hover:bg-purple-50 px-1 rounded ${
        modified ? "bg-purple-50 border-b border-purple-300" : ""
      } ${locked ? "cursor-default" : ""}`}
      title={modified ? "User edited" : locked ? "Locked" : "Click to edit"}
    >
      {display || <span className="text-gray-300">-</span>}
    </span>
  );
}

function ComparisonTable({ data, showEdited, locked, onSaveItem }) {
  if (!data || !data.periods || data.periods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No data available for this statement type.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
            <th className="px-4 py-3 sticky left-0 bg-gray-50">Line Item</th>
            {data.periods.map((p) => (
              <th key={p} className="px-4 py-3 text-right whitespace-nowrap">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.rows.map((row, idx) => (
            <tr
              key={idx}
              className={row.is_total ? "bg-gray-50 font-bold" : "hover:bg-gray-50"}
            >
              <td
                className="px-4 py-2 sticky left-0 bg-inherit whitespace-nowrap"
                style={{ paddingLeft: `${1 + row.indent_level * 1.25}rem` }}
              >
                {row.canonical_label}
              </td>
              {data.periods.map((p) => {
                const val = row.values[p];
                return (
                  <td
                    key={p}
                    className={`px-4 py-2 text-right font-mono ${
                      val != null && val < 0 ? "text-red-600" : ""
                    }`}
                  >
                    {formatNumber(val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatementCard({ statement, showEdited, onSaveItem }) {
  const locked = statement.locked;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <span className="font-medium text-gray-900 text-sm">
            {statement.fiscal_period_label || statement.period}
          </span>
          {statement.period_end_date && (
            <span className="ml-2 text-xs text-gray-400">
              ending {statement.period_end_date}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ReviewBadge status={statement.review_status} />
          {locked && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
              Locked
            </span>
          )}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
            <th className="px-4 py-2">Line Item</th>
            <th className="px-4 py-2 text-right">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {(statement.line_items || []).map((item) => (
            <tr
              key={item.id}
              className={item.is_total ? "bg-gray-50" : "hover:bg-gray-50"}
            >
              <td
                className={`px-4 py-2 ${item.is_total ? "font-bold" : ""}`}
                style={{ paddingLeft: `${1 + item.indent_level * 1.25}rem` }}
              >
                <EditableCell
                  item={item}
                  field="label"
                  onSave={onSaveItem}
                  locked={locked}
                />
              </td>
              <td className={`px-4 py-2 text-right font-mono ${item.is_total ? "font-bold" : ""}`}>
                <EditableCell
                  item={item}
                  field="value"
                  onSave={onSaveItem}
                  locked={locked}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FinancialDataView({ investmentId, investmentName }) {
  const [statements, setStatements] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("income_statement");
  const [viewMode, setViewMode] = useState("statements"); // statements | comparison
  const [showEdited, setShowEdited] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stmts, dashboard] = await Promise.all([
        api.getInvestmentFinancials(investmentId),
        api.getDashboardFinancials(investmentId),
      ]);
      setStatements(stmts);
      setDashboardData(dashboard);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [investmentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveItem(lineItemId, data) {
    try {
      await api.editLineItem(lineItemId, data);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleReview(statementId, status) {
    try {
      await api.reviewStatement(statementId, { review_status: status });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleLock(statementId) {
    if (!confirm("Lock this statement? No further edits will be allowed.")) return;
    try {
      await api.lockStatement(statementId);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleNormalize() {
    try {
      const result = await api.normalizeInvestmentLabels(investmentId);
      alert(`Normalized ${result.normalized_count} line items`);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  const filteredStatements = statements.filter(
    (s) => s.statement_type === activeTab
  );
  const availableTabs = STATEMENT_TABS.filter((tab) =>
    statements.some((s) => s.statement_type === tab.key)
  );
  const comparisonData =
    dashboardData?.statement_types?.[activeTab] || null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          Financial Data — {investmentName}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNormalize}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
          >
            Normalize Labels
          </button>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="statements">Statement View</option>
            <option value="comparison">Period Comparison</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-red-700 text-sm mb-4">
          {error}
          <button onClick={() => setError("")} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(availableTabs.length > 0 ? availableTabs : STATEMENT_TABS).map((tab) => {
          const count = statements.filter(
            (s) => s.statement_type === tab.key
          ).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === tab.key
                  ? "bg-white text-purple-700 shadow"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 text-xs text-gray-400">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      )}

      {!loading && statements.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No financial statements have been mapped to this investment yet.
          <br />
          <span className="text-sm">
            Parse a PDF document first, then map statements to this investment.
          </span>
        </div>
      )}

      {!loading && viewMode === "comparison" && (
        <ComparisonTable
          data={comparisonData}
          showEdited={showEdited}
        />
      )}

      {!loading && viewMode === "statements" && (
        <div>
          {filteredStatements.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No {STATEMENT_TABS.find((t) => t.key === activeTab)?.label} found.
            </div>
          ) : (
            filteredStatements.map((stmt) => (
              <div key={stmt.id}>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => handleReview(stmt.id, "reviewed")}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleReview(stmt.id, "approved")}
                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                  >
                    Approve
                  </button>
                  {!stmt.locked && (
                    <button
                      onClick={() => handleLock(stmt.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Lock
                    </button>
                  )}
                </div>
                <StatementCard
                  statement={stmt}
                  showEdited={showEdited}
                  onSaveItem={handleSaveItem}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
