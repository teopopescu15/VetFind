/**
 * Company Context for VetFinder
 * Phase 13: Global company state management with caching
 *
 * Follows object-literal pattern (no classes) - CLAUDE.md compliant
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Company, UpdateCompanyDTO } from '../types/company.types';
import { ApiService } from '../services/api';
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
  // Get auth state - including isLoading to wait for auth verification
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [company, setCompanyState] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already attempted to load company data for the current user
  // This prevents infinite loops when API returns 404 (no company found)
  const hasAttemptedLoad = useRef<boolean>(false);

  // Track previous user ID to detect real logout vs initial mount
  // undefined = initial mount, null = logged out, string = user id
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  // Wrapper for setCompany that also resets hasAttemptedLoad when company is set
  const setCompany = useCallback((newCompany: Company | null) => {
    setCompanyState(newCompany);
    // If we're setting a valid company, mark as loaded
    if (newCompany) {
      hasAttemptedLoad.current = true;
    }
  }, []);

  /**
   * Load company data from API
   * Caches result in state to avoid repeated API calls
   */
  const loadCompany = useCallback(async () => {
    // Only load for authenticated vetcompany users
    if (!isAuthenticated) {
      console.log('⚠️ User is not authenticated, skipping company load');
      return;
    }

    if (user?.role !== 'vetcompany') {
      console.log('⚠️ User is not a vetcompany, skipping company load');
      setCompanyState(null);
      return;
    }

    // Skip if already loaded
    if (company && !isLoading) {
      console.log('✅ Company already loaded, using cached data');
      return;
    }

    // Skip if we've already attempted to load for this user (prevents infinite loop)
    if (hasAttemptedLoad.current) {
      console.log('⏭️ Already attempted to load company, skipping');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      hasAttemptedLoad.current = true; // Mark as attempted BEFORE the API call
      console.log('🔄 Loading company data from API...');

      const companyData = await ApiService.getMyCompany();

      if (companyData) {
        setCompanyState(companyData);
        console.log('✅ Company loaded successfully:', companyData.name);
      } else {
        setCompanyState(null);
        console.log('ℹ️ No company found for user');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load company';
      setError(errorMessage);
      setCompanyState(null);
      // 404 means no company exists yet - this is expected for new vetcompany users
      // 401 means auth issue - also expected if token is stale
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        console.log('ℹ️ No company found for user (this is expected for new users)');
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        console.log('⚠️ Auth error loading company (token may be stale)');
      } else {
        console.error('❌ Error loading company:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, company, isLoading]);

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
   * NOTE: Does NOT reset hasAttemptedLoad - that's handled separately on real logout
   */
  const clearCompany = useCallback(() => {
    setCompanyState(null);
    setError(null);
    setIsLoading(false);
    // Don't reset hasAttemptedLoad here - it causes infinite loops
    // The hasAttemptedLoad is reset in the useEffect when detecting real logout
    console.log('🧹 Company state cleared');
  }, []);

  /**
   * Refresh company data from API
   * Forces a fresh load even if data is cached
   */
  const refreshCompany = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('⚠️ User is not authenticated, skipping refresh');
      return;
    }

    if (user?.role !== 'vetcompany') {
      console.log('⚠️ User is not a vetcompany, skipping refresh');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      hasAttemptedLoad.current = true; // Mark as attempted
      console.log('🔄 Refreshing company data...');

      const companyData = await ApiService.getMyCompany();

      if (companyData) {
        setCompanyState(companyData);
        console.log('✅ Company refreshed successfully');
      } else {
        setCompanyState(null);
        console.log('ℹ️ No company found during refresh');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh company';
      setError(errorMessage);
      // Don't set company to null on refresh error - keep existing data if any
      console.error('❌ Error refreshing company:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Auto-load company when user changes
   * Only loads for vetcompany users who are properly authenticated
   *
   * Key logic:
   * 1. Wait for AuthContext to finish loading before doing anything
   * 2. Only attempt to load company when user is authenticated as vetcompany
   * 3. Reset hasAttemptedLoad only on REAL logout (user was logged in, now logged out)
   * 4. Don't reset on initial mount when user starts as null
   */
  useEffect(() => {
    // 1. Don't do anything while auth is still loading
    if (isAuthLoading) {
      console.log('⏳ Auth is loading, waiting...');
      return;
    }

    const currentUserId = user?.id ?? null;
    const isInitialMount = previousUserIdRef.current === undefined;
    const didLogin = isInitialMount && currentUserId !== null;
    const didLogout = !isInitialMount && previousUserIdRef.current !== null && currentUserId === null;
    const didSwitchUser = !isInitialMount && previousUserIdRef.current !== null && currentUserId !== null && previousUserIdRef.current !== currentUserId;

    // Update the ref for next comparison
    previousUserIdRef.current = currentUserId;

    // 2. Handle logout - reset state so next login can load fresh
    if (didLogout) {
      console.log('👤 User logged out, resetting company state');
      hasAttemptedLoad.current = false;
      setCompanyState(null);
      setError(null);
      return;
    }

    // 3. Handle user switch - reset and potentially load new company
    if (didSwitchUser) {
      console.log('👤 User switched, resetting company state');
      hasAttemptedLoad.current = false;
      setCompanyState(null);
      setError(null);
      // Fall through to check if new user is vetcompany
    }

    // 4. Auto-load for authenticated vetcompany users who haven't had a load attempt yet
    if (isAuthenticated && user?.role === 'vetcompany' && !hasAttemptedLoad.current && !isLoading) {
      console.log('👤 VetCompany user detected, auto-loading company...');
      loadCompany();
    }
  }, [isAuthLoading, isAuthenticated, user, isLoading, loadCompany]);

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
