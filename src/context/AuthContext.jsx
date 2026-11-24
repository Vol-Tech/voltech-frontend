import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = '/api/v1'; //esto usa la url de AuthController que esta en el MS de usuarios

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const jsonPayload = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recupera la sesión al recargar la pagina
  useEffect(() => {
    const savedToken = localStorage.getItem('voltech_token');
    const savedUser = localStorage.getItem('voltech_user') || localStorage.getItem('usuario');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser({
          ...parsedUser,
          rol: (parsedUser.rol || 'CLIENTE').toUpperCase(),
        });
      } catch {
        localStorage.removeItem('voltech_token');
        localStorage.removeItem('voltech_user');
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  const syncSession = (jwtToken, userData) => {
    const normalizedUser = {
      ...userData,
      rol: (userData?.rol || 'CLIENTE').toUpperCase(),
    };
    localStorage.setItem('voltech_token', jwtToken);
    localStorage.setItem('voltech_user', JSON.stringify(normalizedUser));
    localStorage.setItem('usuario', JSON.stringify(normalizedUser));
    setToken(jwtToken);
    setUser(normalizedUser);
  };

  const loginWithGoogle = async (credentialResponse) => {
    const credential = credentialResponse?.credential;

    if (!credential) {
      throw new Error('No se recibió credencial de Google');
    }

    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      throw new Error('El microservicio usuarios rechazo la credencial de Google');
    }

    const data = await response.json();

    if (!data.token || !data.usuario) {
      throw new Error('Respuesta incompleta de microservicio usuarios');
    }

    const googleProfile = decodeJwtPayload(credential);

    const usuario = {
      id: data.usuario.id,
      nombre: data.usuario.nombre,
      email: data.usuario.email,
      rol: data.usuario.rol,
      foto: googleProfile?.picture ?? null,
    };

    syncSession(data.token, usuario);
    return usuario;
  };

  const logout = () => {
    localStorage.removeItem('voltech_token');
    localStorage.removeItem('voltech_user');
    localStorage.removeItem('usuario');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.rol === 'ADMINISTRADOR',
    isVendedor: user?.rol === 'VENDEDOR',
    isCliente: user?.rol === 'CLIENTE',
    canAccessAdminPanel: user?.rol === 'ADMINISTRADOR' || user?.rol === 'VENDEDOR',
    syncSession,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}