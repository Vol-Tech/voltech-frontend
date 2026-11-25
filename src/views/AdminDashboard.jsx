import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerEstadisticasUsuarios } from '../services/api';
import ListadoProductos from './ListadoProductos';
import ListadoCategorias from './ListadoCategorias';
import ListadoOrdenes from './ListadoOrdenes';
import ListadoUsuarios from './ListadoUsuarios';
import Reportes from './Reportes';

export default function AdminDashboard() {
  const { user, isAdmin, isVendedor, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [estadisticasUsuarios, setEstadisticasUsuarios] = useState(null);

  const obtenerSeccion = () => {
    const ruta = location.pathname;

    if (ruta.startsWith('/admin/ordenes')) return 'ordenes';
    if (ruta.startsWith('/admin/productos')) return 'productos';
    if (ruta.startsWith('/admin/categorias')) return 'categorias';
    if (ruta.startsWith('/admin/usuarios')) return 'usuarios';
    if (ruta.startsWith('/admin/reportes')) return 'reportes';
    if (ruta.startsWith('/admin/perfil')) return 'perfil';

    return isVendedor ? 'productos' : 'dashboard';
  };

  const seccionActual = obtenerSeccion();

  useEffect(() => {
    if (isAdmin && seccionActual === 'dashboard') {
      obtenerEstadisticasUsuarios()
        .then(setEstadisticasUsuarios)
        .catch(console.error);
    }
  }, [isAdmin, seccionActual]);

  const cerrarSesion = () => {
    logout();
    navigate('/login');
  };

  const opcionesMenu = [
    { nombre: 'dashboard', texto: '🏠 Dashboard', ruta: '/admin', admin: true },
    { nombre: 'ordenes', texto: '📋 Órdenes', ruta: '/admin/ordenes' },
    { nombre: 'productos', texto: '📦 Productos', ruta: '/admin/productos' },
    { nombre: 'categorias', texto: '🏷️ Categorías', ruta: '/admin/categorias', admin: true },
    { nombre: 'usuarios', texto: '👥 Usuarios', ruta: '/admin/usuarios', admin: true },
    { nombre: 'reportes', texto: '📊 Reportes', ruta: '/admin/reportes', admin: true },
    { nombre: 'perfil', texto: '👤 Perfil', ruta: '/admin/perfil' },
  ];

  return (
    <div className="container-fluid p-0 bg-light min-vh-100">
      <nav
        className="navbar navbar-dark bg-dark px-3 shadow-sm d-flex justify-content-between"
        style={{ height: '50px' }}
      >
        <span className="navbar-brand mb-0 h6 text-light">
          {isAdmin ? 'VolTech Admin Panel' : 'VolTech Panel Vendedor'}
        </span>

        {user && (
          <span className="text-light small">
            {user.nombre}{' '}
            <span className="badge bg-primary ms-1">{user.rol}</span>
          </span>
        )}
      </nav>

      <div className="row g-0">
        <aside
          className="col-md-2 bg-white border-end min-vh-100 p-2 d-flex flex-column justify-content-between"
          style={{ minHeight: 'calc(100vh - 50px)' }}
        >
          <ul className="nav flex-column gap-1">
            {opcionesMenu
              .filter((opcion) => !opcion.admin || isAdmin)
              .map((opcion) => (
                <li className="nav-item" key={opcion.nombre}>
                  <button
                    className={`nav-link w-100 text-start border-0 rounded py-2 px-3 fw-bold ${
                      seccionActual === opcion.nombre
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-dark bg-transparent'
                    }`}
                    onClick={() => navigate(opcion.ruta)}
                  >
                    {opcion.texto}
                  </button>
                </li>
              ))}
          </ul>

          <div className="mb-3 d-flex flex-column gap-2 px-2">
            <Link
              to="/"
              className="btn btn-dark text-start py-2 px-3 fw-bold shadow-sm"
            >
              🛒 Tienda
            </Link>

            <button
              type="button"
              onClick={cerrarSesion}
              className="btn btn-danger text-start py-2 px-3 fw-bold shadow-sm"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </aside>

        <main className="col-md-10 p-4">
          {isAdmin && seccionActual === 'dashboard' && (
            <>
              <div className="mb-4">
                <h2 className="fw-bold text-dark m-0">Dashboard</h2>
                <p className="text-muted m-0">
                  Resumen de las actividades diarias
                </p>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card text-white bg-primary border-0 shadow-sm rounded-3 p-2">
                    <div className="card-body">
                      <h5 className="card-title">🛒 Compras</h5>
                      <h2 className="display-5 fw-bold my-2">1,234</h2>
                      <p className="card-text small m-0 opacity-75">
                        Probabilidad de aumento: 20%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card text-white bg-success border-0 shadow-sm rounded-3 p-2">
                    <div className="card-body">
                      <h5 className="card-title">📦 Productos</h5>
                      <h2 className="display-5 fw-bold my-2">400</h2>
                      <p className="card-text small m-0 opacity-75">
                        Inventario actual: 500
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card text-dark bg-warning border-0 shadow-sm rounded-3 p-2">
                    <div className="card-body">
                      <h5 className="card-title">👥 Usuarios</h5>
                      <h2 className="display-5 fw-bold my-2">
                        {estadisticasUsuarios?.total ?? '—'}
                      </h2>
                      <p className="card-text small m-0 opacity-75">
                        Nuevos usuarios este mes:{' '}
                        {estadisticasUsuarios?.nuevosEsteMes ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                {[
                  {
                    texto: '📋 Órdenes',
                    descripcion: 'Gestión y seguimiento de órdenes.',
                    ruta: '/admin/ordenes',
                  },
                  {
                    texto: '📦 Productos',
                    descripcion: 'Inventario y productos disponibles.',
                    ruta: '/admin/productos',
                  },
                  {
                    texto: '🏷️ Categorías',
                    descripcion: 'Organización de productos.',
                    ruta: '/admin/categorias',
                  },
                  {
                    texto: '👥 Usuarios',
                    descripcion: 'Gestión de usuarios y roles.',
                    ruta: '/admin/usuarios',
                  },
                ].map((tarjeta) => (
                  <div className="col-md-3" key={tarjeta.ruta}>
                    <button
                      type="button"
                      className="card border shadow-sm rounded-3 text-center p-3 h-100 bg-white w-100"
                      onClick={() => navigate(tarjeta.ruta)}
                    >
                      <div className="card-body">
                        <h5 className="text-dark fw-bold mb-2">
                          {tarjeta.texto}
                        </h5>
                        <p className="text-muted small m-0">
                          {tarjeta.descripcion}
                        </p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {seccionActual === 'productos' && (
            <ListadoProductos soloLectura={isVendedor} />
          )}

          {isAdmin && seccionActual === 'categorias' && (
            <ListadoCategorias />
          )}

          {seccionActual === 'ordenes' && (
            <ListadoOrdenes soloLectura={isVendedor} />
          )}

          {isAdmin && seccionActual === 'usuarios' && (
            <ListadoUsuarios />
          )}

          {isAdmin && seccionActual === 'reportes' && (
            <Reportes />
          )}

          {seccionActual === 'perfil' && (
            <div className="bg-white p-5 rounded shadow-sm text-center">
              <h3 className="fw-bold text-dark">
                Perfil de {user?.nombre}
              </h3>
              <p className="text-muted mb-1">Correo: {user?.email}</p>
              <p className="text-muted mb-3">Rol asignado: {user?.rol}</p>
              <button
                className="btn btn-primary mt-2"
                onClick={() =>
                  navigate(isVendedor ? '/admin/productos' : '/admin')
                }
              >
                Volver
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}