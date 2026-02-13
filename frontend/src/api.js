const API = "/api/v1";

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Investments
  createInvestment: (data) =>
    request(`${API}/investments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  listInvestments: (page = 1, size = 100) =>
    request(`${API}/investments/?page=${page}&size=${size}`),

  getInvestment: (id) => request(`${API}/investments/${id}`),

  updateInvestment: (id, data) =>
    request(`${API}/investments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteInvestment: (id) =>
    request(`${API}/investments/${id}`, { method: "DELETE" }),

  // Securities
  createSecurity: (investmentId, data) =>
    request(`${API}/investments/${investmentId}/securities/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  listSecurities: (investmentId) =>
    request(`${API}/investments/${investmentId}/securities/`),

  updateSecurity: (investmentId, securityId, data) =>
    request(`${API}/investments/${investmentId}/securities/${securityId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteSecurity: (investmentId, securityId) =>
    request(`${API}/investments/${investmentId}/securities/${securityId}`, {
      method: "DELETE",
    }),

  // Documents
  uploadDocuments: (investmentId, formData) =>
    request(`${API}/investments/${investmentId}/documents/bulk`, {
      method: "POST",
      body: formData,
    }),

  listDocuments: (investmentId, securityId = null) => {
    let url = `${API}/investments/${investmentId}/documents/`;
    if (securityId) url += `?security_id=${securityId}`;
    return request(url);
  },

  deleteDocument: (investmentId, docId) =>
    request(`${API}/investments/${investmentId}/documents/${docId}`, {
      method: "DELETE",
    }),

  downloadUrl: (investmentId, docId) =>
    `${API}/investments/${investmentId}/documents/${docId}/download`,

  viewUrl: (investmentId, docId) =>
    `${API}/investments/${investmentId}/documents/${docId}/view`,

  // Financial Parsing
  triggerParsing: (investmentId, docId) =>
    request(
      `${API}/investments/${investmentId}/documents/${docId}/financials/parse`,
      { method: "POST" }
    ),

  getParseStatus: (investmentId, docId) =>
    request(
      `${API}/investments/${investmentId}/documents/${docId}/financials/status`
    ),

  getDocumentFinancials: (investmentId, docId) =>
    request(
      `${API}/investments/${investmentId}/documents/${docId}/financials/`
    ),

  exportFinancialsUrl: (investmentId, docId) =>
    `${API}/investments/${investmentId}/documents/${docId}/financials/export`,

  deleteFinancials: (investmentId, docId) =>
    request(
      `${API}/investments/${investmentId}/documents/${docId}/financials/`,
      { method: "DELETE" }
    ),

  // Review & Edit
  reviewStatement: (statementId, data) =>
    request(`${API}/financials/statements/${statementId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  lockStatement: (statementId) =>
    request(`${API}/financials/statements/${statementId}/lock`, {
      method: "POST",
    }),

  editLineItem: (lineItemId, data) =>
    request(`${API}/financials/line-items/${lineItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getLineItemHistory: (lineItemId) =>
    request(`${API}/financials/line-items/${lineItemId}/history`),

  // Investment mapping
  mapStatementToInvestment: (statementId, data) =>
    request(`${API}/financials/statements/${statementId}/map-investment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  suggestMapping: (statementId) =>
    request(`${API}/financials/statements/${statementId}/suggest-mapping`),

  getInvestmentFinancials: (investmentId) =>
    request(`${API}/investments/${investmentId}/financials`),

  // Dashboard
  getDashboardFinancials: (investmentId) =>
    request(`${API}/dashboard/financials/${investmentId}`),

  getFinancialTrends: (investmentId) =>
    request(`${API}/dashboard/financial-trends/${investmentId}`),

  normalizeInvestmentLabels: (investmentId) =>
    request(`${API}/dashboard/financials/${investmentId}/normalize`, {
      method: "POST",
    }),

  getDashboardStatements: (investmentId, statementType = null) => {
    let url = `${API}/dashboard/financials/${investmentId}/statements`;
    if (statementType) url += `?statement_type=${statementType}`;
    return request(url);
  },

  // Search
  search: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query });
    if (filters.investment_id) params.set("investment_id", filters.investment_id);
    if (filters.security_id) params.set("security_id", filters.security_id);
    if (filters.date_from) params.set("date_from", filters.date_from);
    if (filters.date_to) params.set("date_to", filters.date_to);
    return request(`${API}/search/?${params.toString()}`);
  },
};
