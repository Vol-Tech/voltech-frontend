import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListadoProductos from './ListadoProductos';
import ListadoCategorias from './ListadoCategorias';
import ListadoOrdenes from './ListadoOrdenes';
import ListadoUsuarios from './ListadoUsuarios';
import Reportes from './Reportes';

const AdminDashboard = () => {
  const { user, isAdmin, isVendedor, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Si es Vendedor, arranca directo en 'productos' (o 'ordenes' según la URL); si es Admin, en 'dashboard'
  const obtenerSeccionInicial = () => {
    if (location.pathname.includes('/admin/ordenes')) return 'ordenes';
    if (location.pathname.includes('/admin/productos')) return 'productos';
    if (isVendedor) return 'productos';
    return 'dashboard';
  };

  const [seccionActual, setSeccionActual] = useState(obtenerSeccionInicial);

  useEffect(() => {
    if (location.pathname.includes('/admin/ordenes')) {
      setSeccionActual('ordenes');
    } else if (location.pathname.includes('/admin/productos')) {
      setSeccionActual('productos');
    } else if (isVendedor && !['productos', 'ordenes'].includes(seccionActual)) {
      setSeccionActual('productos');
    }
  }, [location.pathname, isVendedor]);

  const manejarCerrarSesion = (e) => {
    e.preventDefault();
    logout();
    alert('Sesión cerrada correctamente');
    navigate('/login');
  };

  return (
    <div className="container-fluid p-0 bg-light min-vh-100">
      {/* 1. Barra Superior del Panel */}
      <nav className="navbar navbar-dark bg-dark px-3 shadow-sm d-flex justify-content-between" style={{ height: '50px' }}>
        <span className="navbar-brand mb-0 h6 text-light">
          {isAdmin ? 'VolTech Admin Panel' : 'VolTech Panel Vendedor'}
        </span>
        {user && (
          <span className="text-light small">
            {user.nombre} <span className="badge bg-primary ms-1">{user.rol}</span>
          </span>
        )}
      </nav>

      <div className="row g-0">
        {/* 2. Menú Lateral (Sidebar Izquierdo filtrado por Rol) */}
        <div
          className="col-md-2 bg-white border-end min-vh-100 p-2 d-flex flex-column justify-content-between"
          style={{ minHeight: 'calc(100vh - 50px)' }}
        >
          <div>
            <ul className="nav flex-column gap-1">
              {/* Dashboard: solo Administrador */}
              {isAdmin && (
                <li className="nav-item">
                  <button
                    className={`nav-link w-100 text-start border-0 rounded py-2 px-3 fw-bold ${
                      seccionActual === 'dashboard' ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'
                    }`}
                    onClick={() => setSeccionActual('dashboard')}
                  >
                    🏠 Dashboard
                  </button>
                </li>
              )}

              {/* Órdenes: Administrador y Vendedor */}
              {(isAdmin || isVendedor) && (
                <li className="nav-item">
                  <button
                    className={`nav-link w-100 text-start border-0 rounded py-2 px-3 fw-bold ${
                      seccionActual === 'ordenes' ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'
                    }`}
                    onClick={() => setSeccionActual('ordenes')}
                  >
                    📋 Órdenes
                  </button>
                </li>
              )}

              {/* Productos: Administrador y Vendedor */}
              {(isAdmin || isVendedor) && (
                <li className="nav-item">
                  <button
                    className={`nav-link w-100 text-start border-0 rounded py-2 px-3 fw-bold ${
                      seccionActual === 'productos' ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'
                    }`}
                    onClick={() => setSeccionActual('productos')}
                  >
                    📦 Productos
                  </button>
                </li>
              )}

              {/* Categorías, Usuarios y Reportes: solo Administrador (ocultos para Vendedor) */}
              {isAdmin && (
                <>
                  <li className="nav-item">
                    <button
                      className={`nav-link w-100 text-start border-0 rounded py-2 px-3 fw-bold ${
                        seccionActual === 'categorias' ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'
                      }`}
                      onClick={() => setSeccionActual('categorias')}
                    >
                      🏷️ Categorías
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link w-100 text-start border-0 rounded py-2 px-3 fw-bold ${
                        seccionActual === 'usuarios' ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'
                      }`}
                      onClick={() => setSeccionActual('usuarios')}
                    >
                      👥 Usuarios
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link w-100 text-start border-0 rounded py-2 px-3 fw-bold ${
                        seccionActual === 'reportes' ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'
                      }`}
                      onClick={() => setSeccionActual('reportes')}
                    >
                      📊 Reportes
                    </button>
                  </li>
                </>
              )}
            </ul>

            {isAdmin && (
              <>
                <hr className="my-3 text-muted" />
                <ul className="nav flex-column">
                  <li className="nav-item">
                    <button
                      className={`nav-link w-100 text-start border-0 rounded py-2 px-3 fw-bold ${
                        seccionActual === 'perfil' ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'
                      }`}
                      onClick={() => setSeccionActual('perfil')}
                    >
                      👤 Perfil
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>

          {/* Botones inferiores del Sidebar */}
          <div className="mb-3 d-flex flex-column gap-2 px-2">
            <Link to="/" className="btn btn-dark text-start py-2 px-3 fw-bold shadow-sm">
              🛒 Tienda
            </Link>
            <button
              type="button"
              onClick={manejarCerrarSesion}
              className="btn btn-danger text-start py-2 px-3 fw-bold shadow-sm"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        {/* 3. Área de Contenido Principal */}
        <div className="col-md-10 p-4">
          {/* SECCIÓN 1: DASHBOARD (solo Administrador) */}
          {isAdmin && seccionActual === 'dashboard' && (
            <>
              <div className="mb-4">
                <h2 className="fw-bold text-dark m-0">Dashboard</h2>
                <p className="text-muted m-0">Resumen de las actividades diarias</p>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card text-white bg-primary border-0 shadow-sm rounded-3 p-2">
                    <div className="card-body">
                      <h5 className="card-title fs-5">🛒 Compras</h5>
                      <h2 className="display-5 fw-bold my-2">1,234</h2>
                      <p className="card-text small m-0 opacity-75">Probabilidad de aumento: 20%</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card text-white bg-success border-0 shadow-sm rounded-3 p-2">
                    <div className="card-body">
                      <h5 className="card-title fs-5">📦 Productos</h5>
                      <h2 className="display-5 fw-bold my-2">400</h2>
                      <p className="card-text small m-0 opacity-75">Inventario actual: 500</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card text-dark bg-warning border-0 shadow-sm rounded-3 p-2">
                    <div className="card-body">
                      <h5 className="card-title fs-5">👥 Usuarios</h5>
                      <h2 className="display-5 fw-bold my-2">890</h2>
                      <p className="card-text small m-0 opacity-75">Nuevos usuarios este mes: 120</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-3">
                  <div
                    className="card border shadow-sm rounded-3 text-center p-3 h-100 bg-white"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSeccionActual('dashboard')}
                  >
                    <div className="card-body d-flex flex-column justify-content-center">
                      <h5 className="text-dark fw-bold mb-2">📊 Dashboard</h5>
                      <p className="text-muted small m-0">
                        Visión general de todas las métricas y estadísticas clave del sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div
                    className="card border shadow-sm rounded-3 text-center p-3 h-100 bg-white"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSeccionActual('ordenes')}
                  >
                    <div className="card-body d-flex flex-column justify-content-center">
                      <h5 className="text-dark fw-bold mb-2">📋 Órdenes</h5>
                      <p className="text-muted small m-0">
                        Gestión y seguimiento de todas las órdenes de compra realizadas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div
                    className="card border shadow-sm rounded-3 text-center p-3 h-100 bg-white"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSeccionActual('productos')}
                  >
                    <div className="card-body d-flex flex-column justify-content-center">
                      <h5 className="text-dark fw-bold mb-2">📦 Productos</h5>
                      <p className="text-muted small m-0">
                        Administrar inventario y detalles de los productos disponibles.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div
                    className="card border shadow-sm rounded-3 text-center p-3 h-100 bg-white"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSeccionActual('categorias')}
                  >
                    <div className="card-body d-flex flex-column justify-content-center">
                      <h5 className="text-dark fw-bold mb-2">🏷️ Categorías</h5>
                      <p className="text-muted small m-0">
                        Organizar productos en categorías para facilitar su navegación.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SECCIÓN 2: LISTADO DE PRODUCTOS (Administrador y Vendedor) */}
          {seccionActual === 'productos' && <ListadoProductos soloLectura={isVendedor} />}

          {/* SECCIÓN 3: LISTADO DE CATEGORÍAS (solo Administrador) */}
          {isAdmin && seccionActual === 'categorias' && <ListadoCategorias />}

          {/* SECCIÓN 4: ÓRDENES (Administrador y Vendedor) */}
          {seccionActual === 'ordenes' && <ListadoOrdenes soloLectura={isVendedor} />}

          {/* SECCIÓN 5: USUARIOS (solo Administrador) */}
          {isAdmin && seccionActual === 'usuarios' && <ListadoUsuarios />}

          {/* SECCIÓN 6: REPORTES (solo Administrador) */}
          {isAdmin && seccionActual === 'reportes' && <Reportes />}

          {/* SECCIÓN PERFIL (solo Administrador) */}
          {isAdmin && seccionActual === 'perfil' && (
            <div className="bg-white p-5 rounded shadow-sm text-center">
              <h3 className="fw-bold text-dark">Perfil de {user?.nombre}</h3>
              <p className="text-muted mb-1">Correo: {user?.email}</p>
              <p className="text-muted mb-3">Rol asignado: {user?.rol}</p>
              <button className="btn btn-primary mt-2" onClick={() => setSeccionActual('dashboard')}>
                Volver al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;