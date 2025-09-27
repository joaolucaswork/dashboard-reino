/**
 * Authentication debugging utilities
 * 
 * This module provides debugging functions to help diagnose authentication
 * persistence issues in the Comdinheiro integration.
 */

import { browser } from "$app/environment";

const STORAGE_KEY = "comdinheiro_credentials";

export interface AuthDebugInfo {
  hasLocalStorage: boolean;
  credentialsStored: boolean;
  credentialsValid: boolean;
  credentials?: {
    username: string;
    hasPassword: boolean;
  };
  error?: string;
}

/**
 * Get comprehensive authentication debug information
 */
export function getAuthDebugInfo(): AuthDebugInfo {
  const info: AuthDebugInfo = {
    hasLocalStorage: false,
    credentialsStored: false,
    credentialsValid: false,
  };

  if (!browser) {
    info.error = "Not running in browser environment";
    return info;
  }

  try {
    // Test localStorage availability
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    info.hasLocalStorage = true;
  } catch (error) {
    info.error = `LocalStorage not available: ${error}`;
    return info;
  }

  try {
    // Check if credentials are stored
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      info.credentialsStored = true;
      
      try {
        const credentials = JSON.parse(saved);
        if (credentials.username && credentials.password) {
          info.credentialsValid = true;
          info.credentials = {
            username: credentials.username,
            hasPassword: !!credentials.password,
          };
        } else {
          info.error = "Stored credentials are incomplete";
        }
      } catch (parseError) {
        info.error = `Failed to parse stored credentials: ${parseError}`;
      }
    } else {
      info.error = "No credentials found in localStorage";
    }
  } catch (error) {
    info.error = `Failed to access localStorage: ${error}`;
  }

  return info;
}

/**
 * Log authentication debug information to console
 */
export function logAuthDebugInfo(): void {
  if (!browser) return;

  const info = getAuthDebugInfo();
  
  console.group("🔐 Authentication Debug Info");
  console.log("Has localStorage:", info.hasLocalStorage);
  console.log("Credentials stored:", info.credentialsStored);
  console.log("Credentials valid:", info.credentialsValid);
  
  if (info.credentials) {
    console.log("Username:", info.credentials.username);
    console.log("Has password:", info.credentials.hasPassword);
  }
  
  if (info.error) {
    console.warn("Error:", info.error);
  }
  
  console.groupEnd();
}

/**
 * Test authentication persistence by simulating a page reload
 */
export function testAuthPersistence(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!browser) {
      resolve(false);
      return;
    }

    const info = getAuthDebugInfo();
    
    console.group("🧪 Testing Authentication Persistence");
    console.log("Initial state:", info);
    
    if (info.credentialsValid) {
      console.log("✅ Credentials should persist across page reload");
      resolve(true);
    } else {
      console.log("❌ Credentials will not persist - user will need to login again");
      console.log("Reason:", info.error || "Unknown");
      resolve(false);
    }
    
    console.groupEnd();
  });
}

/**
 * Clear all authentication data (for testing)
 */
export function clearAuthData(): void {
  if (!browser) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("comdinheiro_username"); // Legacy key
    localStorage.removeItem("comdinheiro_password"); // Legacy key
    console.log("🧹 Authentication data cleared");
  } catch (error) {
    console.error("Failed to clear authentication data:", error);
  }
}

/**
 * Save test credentials (for testing)
 */
export function saveTestCredentials(username: string, password: string): boolean {
  if (!browser) return false;

  try {
    const credentials = { username, password };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
    console.log("💾 Test credentials saved:", { username, hasPassword: !!password });
    return true;
  } catch (error) {
    console.error("Failed to save test credentials:", error);
    return false;
  }
}

/**
 * Monitor authentication state changes
 */
export function monitorAuthState(): void {
  if (!browser) return;

  // Log initial state
  logAuthDebugInfo();

  // Monitor localStorage changes
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      console.log("🔄 Authentication credentials changed:", {
        oldValue: event.oldValue,
        newValue: event.newValue,
      });
      logAuthDebugInfo();
    }
  });

  // Monitor page visibility changes (to detect potential issues)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.log("👁️ Page became visible - checking auth state");
      logAuthDebugInfo();
    }
  });
}
