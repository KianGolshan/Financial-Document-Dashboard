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

  // Documents
  uploadDocuments: (investmentId, formData) =>
    request(`${API}/investments/${investmentId}/documents/bulk`, {
      method: "POST",
      body: formData,
    }),

  listDocuments: (investmentId) =>
    request(`${API}/investments/${investmentId}/documents/`),

  deleteDocument: (investmentId, docId) =>
    request(`${API}/investments/${investmentId}/documents/${docId}`, {
      method: "DELETE",
    }),

  downloadUrl: (investmentId, docId) =>
    `${API}/investments/${investmentId}/documents/${docId}/download`,

  // Search
  search: (query) => request(`${API}/search/?q=${encodeURIComponent(query)}`),
};
