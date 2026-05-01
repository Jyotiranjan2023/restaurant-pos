import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCustomers, searchCustomers } from '../services/customerService';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  const loadPage = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchCustomers(page);
      setCustomers(result.content);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(0); }, [loadPage]);

  const search = useCallback((query) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!query || query.trim().length === 0) {
      loadPage(0);
      return;
    }

    if (query.trim().length >= 2) {
      debounceTimer.current = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);
          const list = await searchCustomers(query.trim());
          setCustomers(list);
          setTotalPages(1);
          setCurrentPage(0);
          setTotalElements(list.length);
        } catch (err) {
          setError(err?.response?.data?.message || 'Search failed');
        } finally {
          setLoading(false);
        }
      }, 400);
    }
  }, [loadPage]);

  return {
    customers, totalPages, currentPage, totalElements,
    loading, error,
    search,
    goToPage: loadPage,
    refresh: loadPage,
  };
};