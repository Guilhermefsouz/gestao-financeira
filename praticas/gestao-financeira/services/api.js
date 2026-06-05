/**
 * URL base da API.
 * - Emulador Android: 10.0.2.2 mapeia para localhost da máquina hospedeira.
 * - Device físico:    troque para o IP da sua máquina (ex.: http://192.168.0.10:3000).
 * - iOS Simulator:   http://localhost:3000 funciona normalmente.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

/** Token JWT armazenado em memória após o login. */
let _token = null;

/** Define o token após um login bem-sucedido. */
export function setAuthToken(token) {
  _token = token;
}

/** Remove o token (logout). */
export function clearAuthToken() {
  _token = null;
}

/**
 * Executa uma requisição HTTP e padroniza o tratamento de erros.
 *
 * @param {string} path - Caminho da rota (ex.: "/categories").
 * @param {RequestInit} [options] - Opções do fetch.
 * @returns {Promise<any|null>} Corpo JSON ou null (204).
 * @throws {Error} Quando status HTTP fora da faixa 2xx.
 */
async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  /** Registra novo usuário. */
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  /**
   * Autentica usuário.
   * @returns {{ token: string, user: { id, name, email } }}
   */
  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  // ── Categorias ──────────────────────────────────────────────────────────────
  listCategories:  ()       => request("/categories"),
  createCategory:  (data)   => request("/categories",       { method: "POST",   body: JSON.stringify(data) }),
  updateCategory:  (id, d)  => request(`/categories/${id}`, { method: "PUT",    body: JSON.stringify(d) }),
  deleteCategory:  (id)     => request(`/categories/${id}`, { method: "DELETE" }),

  // ── Transações ──────────────────────────────────────────────────────────────
  /**
   * Lista transações, com filtro opcional de mês/ano.
   * @param {{ month?: number, year?: number }} [filter]
   */
  listTransactions: (filter) => {
    const qs = filter?.month && filter?.year
      ? `?month=${filter.month}&year=${filter.year}`
      : "";
    return request(`/transactions${qs}`);
  },
  createTransaction: (data)  => request("/transactions",        { method: "POST",   body: JSON.stringify(data) }),
  updateTransaction: (id, d) => request(`/transactions/${id}`,  { method: "PUT",    body: JSON.stringify(d) }),
  deleteTransaction: (id)    => request(`/transactions/${id}`,  { method: "DELETE" }),
};
