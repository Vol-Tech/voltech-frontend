import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './AuthContext';

function crearMockGoogleJwt(payloadObj) {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(payloadObj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${payload}.firma_simulada`;
}

describe('AuthContext - Gestión de Sesiones y Google Auth (IE3.3.2)', () => {
  let container;
  let root;
  let authRef;

  function TestConsumer() {
    authRef = useAuth();
    return <div data-testid="user-role">{authRef.user ? authRef.user.rol : 'ANONIMO'}</div>;
  }

  const renderAuth = () =>
    new Promise((resolve) => {
      root.render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      setTimeout(resolve, 30);
    });

  beforeEach(() => {
    localStorage.clear();
    authRef = null;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    localStorage.clear();
  });

  it('debe iniciar sin usuario autenticado cuando localStorage está vacío', async () => {
    await renderAuth();
    expect(authRef.isAuthenticated).toBe(false);
    expect(authRef.user).toBeNull();
  });

  it('debe autenticar con Google Auth y guardar token y usuario en localStorage', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response('', { status: 503 }))
    );
    await renderAuth();

    const mockToken = crearMockGoogleJwt({
      sub: 'google-123',
      name: 'Sarai Perez',
      email: 'sara.perez@duocuc.cl',
      picture: 'https://example.com/avatar.png',
    });

    const usuario = await authRef.loginWithGoogle({ credential: mockToken });
    await new Promise((r) => setTimeout(r, 20));

    expect(usuario.email).toBe('sara.perez@duocuc.cl');
    expect(usuario.rol).toBe('CLIENTE');
    expect(localStorage.getItem('voltech_token')).toBe(mockToken);
    expect(JSON.parse(localStorage.getItem('voltech_user')).nombre).toBe('Sarai Perez');
  });

  it('debe mantener la sesión activa al recargar la página desde localStorage', async () => {
    const usuarioGuardado = {
      id: 1,
      nombre: 'Admin VolTech',
      email: 'admin@duocuc.cl',
      rol: 'ADMINISTRADOR',
    };
    localStorage.setItem('voltech_token', 'jwt-token-persistente');
    localStorage.setItem('voltech_user', JSON.stringify(usuarioGuardado));

    await renderAuth();

    expect(authRef.isAuthenticated).toBe(true);
    expect(authRef.isAdmin).toBe(true);
    expect(authRef.user.email).toBe('admin@duocuc.cl');
  });

  it('debe limpiar completamente la sesión al ejecutar logout()', async () => {
    localStorage.setItem('voltech_token', 'jwt-token-activo');
    localStorage.setItem('voltech_user', JSON.stringify({ nombre: 'Vendedor', rol: 'VENDEDOR' }));
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Vendedor', rol: 'VENDEDOR' }));

    await renderAuth();
    expect(authRef.isAuthenticated).toBe(true);

    authRef.logout();
    await new Promise((r) => setTimeout(r, 20));

    expect(authRef.isAuthenticated).toBe(false);
    expect(authRef.user).toBeNull();
    expect(localStorage.getItem('voltech_token')).toBeNull();
    expect(localStorage.getItem('voltech_user')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });
});