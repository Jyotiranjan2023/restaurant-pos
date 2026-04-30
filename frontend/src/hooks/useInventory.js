import { useState, useEffect, useCallback } from 'react';
import {
  fetchIngredients, fetchUsageLogs,
  createIngredient, updateIngredient,
  deleteIngredient, restockIngredient
} from '../services/inventoryService';

export const useInventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ings, usageLogs] = await Promise.all([
        fetchIngredients(),
        fetchUsageLogs(),
      ]);
      setIngredients(ings);
      setLogs(usageLogs);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addIngredient = async (payload) => {
    await createIngredient(payload);
    await load();
  };

  const editIngredient = async (id, payload) => {
    await updateIngredient(id, payload);
    await load();
  };

  const removeIngredient = async (id) => {
    await deleteIngredient(id);
    await load();
  };

  const restock = async (id, payload) => {
    await restockIngredient(id, payload);
    await load();
  };

  return {
    ingredients, logs, loading, error,
    refresh: load, addIngredient, editIngredient, removeIngredient, restock
  };
};