/**
 * Company Context for VetFinder
 * Phase 13: Global company state management with caching
 *
 * Follows object-literal pattern (no classes) - CLAUDE.md compliant
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Company, UpdateCompanyDTO } from '../types/company.types';
import * as api from '../services/api';
const ApiService = api.ApiService;
import { useAuth } from './AuthContext';

// ==================== CONTEXT TYPE DEFINITIONS ====================

interface CompanyContextType {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
  loadCompany: () => Promise<void>;
  updateCompany: (data: UpdateCompanyDTO) => Promise<void>;
  clearCompany: () => void;
  refreshCompany: () => Promise<void>;
  setCompany: (company: Company | null) => void;
}

// ==================== CONTEXT CREATION ====================

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// ==================== PROVIDER COMPONENT ====================

interface CompanyProviderProps {
  children: React.ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load company data from API
   * Caches result in state to avoid repeated API calls
   */
  const loadCompany = useCallback(async () => {
    // Only load for vetcompany users
    if (user?.role !== 'vetcompany') {
      console.log('⚠️ User is not a vetcompany, skipping company load');
      setCompany(null);
      return;
    }

    // Skip if already loaded
    if (company && !isLoading) {
      console.log('✅ Company already loaded, using cached data');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading company data from API...');

      const companyData = await ApiService.getMyCompany();

      if (companyData) {
        setCompany(companyData);
        console.log('✅ Company loaded successfully:', companyData.name);
      } else {
        setCompany(null);
        console.log('ℹ️ No company found for user');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load company';
      setError(errorMessage);
      setCompany(null);
      console.error('❌ Error loading company:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, company, isLoading]);

  /**
   * Update company data
   * Updates both API and local state
   */
  const updateCompany = useCallback(async (data: UpdateCompanyDTO) => {
    if (!company) {
      const errorMessage = 'No company to update';
      setError(errorMessage);
      console.error('❌', errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Updating company data...');

      const updatedCompany = await ApiService.updateCompany(company.id, data);

      setCompany(updatedCompany);
      console.log('✅ Company updated successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update company';
      setError(errorMessage);
      console.error('❌ Error updating company:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [company]);

  /**
   * Clear company state
   * Used during logout or when company is deleted
   */
  const clearCompany = useCallback(() => {
    setCompany(null);
    setError(null);
    setIsLoading(false);
    console.log('🧹 Company state cleared');
  }, []);

  /**
   * Refresh company data from API
   * Forces a fresh load even if data is cached
   */
  const refreshCompany = useCallback(async () => {
    if (user?.role !== 'vetcompany') {
      console.log('⚠️ User is not a vetcompany, skipping refresh');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Refreshing company data...');

      const companyData = await ApiService.getMyCompany();

      if (companyData) {
        setCompany(companyData);
        console.log('✅ Company refreshed successfully');
      } else {
        setCompany(null);
        console.log('ℹ️ No company found during refresh');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh company';
      setError(errorMessage);
      console.error('❌ Error refreshing company:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Auto-load company when user changes
   * Only loads for vetcompany users
   */
  useEffect(() => {
    if (user?.role === 'vetcompany' && !company && !isLoading) {
      console.log('👤 VetCompany user detected, auto-loading company...');
      loadCompany();
    } else if (user?.role !== 'vetcompany' && company) {
      // Clear company if user is no longer a vetcompany
      console.log('👤 User role changed, clearing company data');
      clearCompany();
    }
  }, [user, company, isLoading, loadCompany, clearCompany]);

  // Context value object
  const contextValue: CompanyContextType = {
    company,
    isLoading,
    error,
    loadCompany,
    updateCompany,
    clearCompany,
    refreshCompany,
    setCompany,
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};

// ==================== CUSTOM HOOK ====================

/**
 * Custom hook to use Company Context
 * Throws error if used outside CompanyProvider
 */
export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);

  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }

  return context;
};

// ==================== EXPORTS ====================

export default CompanyContext;
