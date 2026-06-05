import { createContext, useCallback, useEffect, useState } from "react";
import { api, setAuthToken, clearAuthToken } from "../services/api";

export const MoneyContext = createContext();

function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}
function storageRemove(key) {
  try { localStorage.removeItem(key); } catch {}
}


const savedToken = storageGet("token");
const savedUser  = (() => {
  try { return JSON.parse(storageGet("user") || "null"); } catch { return null; }
})();
if (savedToken) setAuthToken(savedToken);

export default function GlobalState({ children }) {
  const [user, setUser]                 = useState(savedUser);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const now = new Date();
  const [filter, setFilter] = useState({
    month: now.getMonth() + 1,
    year:  now.getFullYear(),
  });

  const login = useCallback(async ({ email, password }) => {
    const result = await api.login({ email, password });
    setAuthToken(result.token);
    storageSet("token", result.token);
    storageSet("user", JSON.stringify(result.user));
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    storageRemove("token");
    storageRemove("user");
    setUser(null);
    setTransactions([]);
    setCategories([]);
  }, []);

  const register = useCallback(async (data) => {
    return api.register(data);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [cats, txs] = await Promise.all([
        api.listCategories(),
        api.listTransactions(filter),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (e) {
      setError(e.message ?? "Falha ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTransaction = useCallback(async (data) => {
    const created = await api.createTransaction(data);
    setTransactions((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTransaction = useCallback(async (id, data) => {
    const updated = await api.updateTransaction(id, data);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    );
    return updated;
  }, []);

  const removeTransaction = useCallback(async (id) => {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addCategory = useCallback(async (data) => {
    const created = await api.createCategory(data);
    setCategories((prev) =>
      [...prev, created].sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      )
    );
    return created;
  }, []);

  const removeCategory = useCallback(async (id) => {
    await api.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <MoneyContext.Provider
      value={{
        user, login, logout, register,
        transactions, categories, loading, error, refresh,
        filter, setFilter,
        addTransaction, updateTransaction, removeTransaction,
        addCategory, removeCategory,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
}