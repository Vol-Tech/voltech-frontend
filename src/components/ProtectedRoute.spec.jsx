import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute - Restricciones de Acceso por Rol (IE3.3.3)', () => {
  let container;
  let root;

  const renderRuta = (initialRoute) =>
    new Promise((resolve) => {
      root.render(
        <AuthProvider>
          <MemoryRouter key={initialRoute} initialEntries={[initialRoute]}>
            <Routes>
              <Route path="/" element={<div>Tienda Pública</div>} />
              <Route path="/login" element={<div>Página de Login</div>} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
                    <div>Panel Administrador</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/productos"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'VENDEDOR']}>
                    <div>Listado Productos Panel</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
                    <div>Gestión de Usuarios</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );
      setTimeout(resolve, 30);
    });

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    localStorage.clear();
  });

  it('debe redirigir a /login si el usuario no ha iniciado sesión', async () => {
    await renderRuta('/admin');
    expect(container.textContent).toContain('Página de Login');
  });

  it('debe bloquear el acceso a /admin para un usuario con rol CLIENTE y redirigirlo a la tienda', async () => {
    localStorage.setItem('voltech_token', 'token-cliente');
    localStorage.setItem('voltech_user', JSON.stringify({ nombre: 'Cliente', rol: 'CLIENTE' }));

    await renderRuta('/admin');
    expect(container.textContent).toContain('Tienda Pública');
    expect(container.textContent).not.toContain('Panel Administrador');
  });

  it('debe permitir al VENDEDOR ver /admin/productos pero bloquearle /admin/usuarios', async () => {
    localStorage.setItem('voltech_token', 'token-vendedor');
    localStorage.setItem('voltech_user', JSON.stringify({ nombre: 'Vendedor', rol: 'VENDEDOR' }));

    await renderRuta('/admin/productos');
    expect(container.textContent).toContain('Listado Productos Panel');

    await renderRuta('/admin/usuarios');
    expect(container.textContent).not.toContain('Gestión de Usuarios');
    expect(container.textContent).toContain('Listado Productos Panel');
  });

  it('debe permitir acceso total a /admin y /admin/usuarios para el rol ADMINISTRADOR', async () => {
    localStorage.setItem('voltech_token', 'token-admin');
    localStorage.setItem('voltech_user', JSON.stringify({ nombre: 'Admin', rol: 'ADMINISTRADOR' }));

    await renderRuta('/admin');
    expect(container.textContent).toContain('Panel Administrador');

    await renderRuta('/admin/usuarios');
    expect(container.textContent).toContain('Gestión de Usuarios');
  });
});