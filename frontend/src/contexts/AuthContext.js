import React, { createContext, useState, useContext, useEffect } from 'react';
import { connectToServer, getConnectionStatus, logoutWhatsApp } from '../services/api';
import { storage } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [linkCode, setLinkCode] = useState(null); // ✅ ADD THIS
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedPhone = await storage.getItem('userPhone');
      console.log('🔹 Stored phone:', storedPhone);
      if (storedPhone) {
        const status = await checkStatus(storedPhone);
        console.log('🔹 Stored user status check:', status);
        if (status === 'connected') {
          setUser({ phone: storedPhone });
          setConnectionStatus('connected');
        } else {
          await storage.deleteItem('userPhone');
        }
      }
    } catch (error) {
      console.error('❌ Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (phone) => {
    try {
      const response = await getConnectionStatus(phone);
      console.log('🔹 getConnectionStatus response:', response.data);
      return response.data.status || response.data.connected ? 'connected' : 'disconnected';
    } catch (error) {
      console.error('❌ Error checking status:', error);
      return 'disconnected';
    }
  };

  const login = async (phone) => {
    try {
      setLoading(true);
      setConnectionStatus('connecting');
      console.log('🔹 [AUTH] Starting login for phone:', phone);

      const response = await connectToServer(phone);
      const data = response.data;
      console.log('🔹 [AUTH] Full backend response:', JSON.stringify(data, null, 2));

      // ✅ Handle QR or Link Code from backend
      if (data.qrCode || data.linkCode) {
        console.log('🔹 [AUTH] ✅ QR/Link code received!');
        console.log('🔹 [AUTH] QR Code length:', data.qrCode?.length || 0);
        console.log('🔹 [AUTH] Link Code:', data.linkCode);
        
        // ✅ STORE BOTH IN STATE
        setQrCode(data.qrCode || null);
        setLinkCode(data.linkCode || null); // ✅ ADD THIS LINE
        setConnectionStatus('qr_ready');
        
        const result = {
          success: true,
          qrCode: data.qrCode || null,
          linkCode: data.linkCode || null,
        };
        console.log('🔹 [AUTH] Returning result:', JSON.stringify(result, null, 2));
        return result;
      }

      // ✅ Handle already connected
      if (data.connected || data.status === 'connected') {
        console.log('🔹 [AUTH] Device already connected.');
        await storage.setItem('userPhone', phone);
        setUser({ phone });
        setConnectionStatus('connected');
        setQrCode(null);
        setLinkCode(null); // ✅ ADD THIS LINE
        return { success: true, connected: true };
      }

      // ❌ Fallback for unexpected response
      console.warn('⚠️ [AUTH] Unexpected response from backend:', data);
      setConnectionStatus('error');
      return { success: false, error: 'Unexpected response from server.' };

    } catch (error) {
      console.error('❌ [AUTH] Login error:', error);
      console.error('❌ [AUTH] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setConnectionStatus('error');
      const errorMsg = error.response?.data?.error || error.message || 'Unable to connect to server. Please check your internet connection and try again.';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
      console.log('🔹 [AUTH] Login attempt completed');
    }
  };

  const logout = async () => {
    try {
      if (user?.phone) {
        console.log('🔹 Logging out user:', user.phone);
        await logoutWhatsApp(user.phone);
        await storage.deleteItem('userPhone');
      }
      setUser(null);
      setQrCode(null);
      setLinkCode(null); // ✅ ADD THIS LINE
      setConnectionStatus('disconnected');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const updateConnectionStatus = (status) => {
    console.log('🔹 Updating connection status:', status);
    setConnectionStatus(status);
    if (status === 'connected') {
      setQrCode(null);
      setLinkCode(null); // ✅ ADD THIS LINE
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        qrCode,
        linkCode, // ✅ ADD THIS TO THE CONTEXT
        connectionStatus,
        login,
        logout,
        updateConnectionStatus,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
