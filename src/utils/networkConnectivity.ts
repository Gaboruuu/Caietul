/**
 * Network Connectivity Detection
 * Monitors online/offline status and provides connectivity information
 */

type ConnectivityListener = (isOnline: boolean) => void;

const listeners = new Set<ConnectivityListener>();
let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

/**
 * Initialize network connectivity listeners
 */
export const initializeNetworkConnectivity = (): void => {
  if (typeof window === "undefined") return;

  const handleOnline = () => {
    isOnline = true;
    notifyListeners(true);
  };

  const handleOffline = () => {
    isOnline = false;
    notifyListeners(false);
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
};

/**
 * Check if the network is currently online
 */
export const isNetworkOnline = (): boolean => isOnline;

/**
 * Attempt to verify server connectivity with a HEAD request
 * This helps detect cases where the device is online but server is unreachable
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/health", {
      method: "HEAD",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Subscribe to connectivity changes
 */
export const onConnectivityChange = (
  listener: ConnectivityListener,
): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Get current connectivity status (network + server check)
 */
export const getConnectivityStatus = async (): Promise<{
  isNetworkOnline: boolean;
  isServerReachable: boolean;
}> => {
  const networkOnline = isNetworkOnline();

  let serverReachable = false;
  if (networkOnline) {
    serverReachable = await checkServerConnectivity();
  }

  return {
    isNetworkOnline: networkOnline,
    isServerReachable: serverReachable,
  };
};

/**
 * Internal function to notify all listeners
 */
const notifyListeners = (online: boolean): void => {
  listeners.forEach((listener) => {
    try {
      listener(online);
    } catch (error) {
      console.error("Error in connectivity listener:", error);
    }
  });
};

// Re-fetch server status when coming back online
if (typeof window !== "undefined") {
  window.addEventListener("online", async () => {
    // Give the network a moment to stabilize
    await new Promise((resolve) => setTimeout(resolve, 500));
    const serverReachable = await checkServerConnectivity();
    if (serverReachable) {
      // Trigger sync when connection is re-established
      const event = new CustomEvent("server-reconnected");
      window.dispatchEvent(event);
    }
  });
}
