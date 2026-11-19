import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './views/Home'

import Nosotros from './views/Nosotros'
import Blogs from './views/Blogs'
import Contacto from './views/Contacto'
import Login from './views/Login'
import Registro from './views/Registro'
import DetalleProducto from './views/DetalleProducto'
import Categorias from './views/Categorias'
import Carrito from './views/Carrito'
import Checkout from './views/Checkout'

import BlogMonitor from './views/BlogMonitor'
import BlogCableTipoC from './views/BlogCableTipoC'
import BlogCableVga from './views/BlogCableVga'
import BlogMouse from './views/BlogMouse'

// Vista Admin
import AdminDashboard from './views/AdminDashboard'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      {/* RUTAS PROTEGIDAS DEL PANEL (Administrador y Vendedor según permisos) */}
      <Route path="/admin">
        {/* Dashboard general: solo Administrador */}
        <Route
          index
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Órdenes (lista y detalle): Administrador y Vendedor */}
        <Route
          path="ordenes"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'VENDEDOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="ordenes/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'VENDEDOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Productos (lista y detalle): Administrador y Vendedor */}
        <Route
          path="productos"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'VENDEDOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'VENDEDOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Creación, edición y stock crítico de productos: solo Administrador */}
        <Route
          path="productos/nuevo"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos/editar/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos/criticos"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Categorías: solo Administrador */}
        <Route
          path="categorias"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="categorias/nueva"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="categorias/editar/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Usuarios: solo Administrador */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios/nuevo"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios/editar/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios/:id/historial"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Reportes: solo Administrador */}
        <Route
          path="reportes"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Perfil: Administrador y Vendedor */}
        <Route
          path="perfil"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'VENDEDOR']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* RUTAS DE LA TIENDA PÚBLICA */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route path="/categorias" element={<Categorias />} />
        <Route path="/categorias/:id" element={<Categorias />} />
        <Route path="/categorias/:categoriaId/:productoId" element={<DetalleProducto />} />
        
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/blogs/monitor-gamer" element={<BlogMonitor />} />
        <Route path="/blogs/cable-tipo-c" element={<BlogCableTipoC />} />
        <Route path="/blogs/cable-vga" element={<BlogCableVga />} />
        <Route path="/blogs/mouse-gamer" element={<BlogMouse />} />
      </Route>
    </Routes>
  )
}

export default App