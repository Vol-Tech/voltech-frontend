import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { creacionPedido, actualizarDireccionDeUsuario, obtenerComunas,} from '../services/api';
import { guardarUltimaOrden } from '../services/ordenes';

export default function Checkout() {
  const { items, total, vaciar } = useCarrito();
  const navigate = useNavigate();

  const [pagando, setPagando] = useState(false);
  const [comunasApi, setComunasApi] = useState([]);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const [datos, setDatos] = useState({
    nombre: usuario?.nombre || '',
    apellidos: usuario?.apellidos || '',
    correo: usuario?.email || '',
    calle: usuario?.calle || '',
    departamento: usuario?.depto || '',
    region: '',
    comuna: usuario?.comunaId ? String(usuario.comunaId) : '',
    indicaciones: '',
  });

  useEffect(() => {
    obtenerComunas()
      .then(setComunasApi)
      .catch((error) =>
        console.error('No se pudieron cargar las comunas', error)
      );
  }, []);

  useEffect(() => {
    const comunaGuardada = comunasApi.find(
      (comuna) => comuna.id === usuario?.comunaId
    );

    if (comunaGuardada) {
      setDatos((actuales) => ({
        ...actuales,
        region: String(comunaGuardada.regionId),
        comuna: String(comunaGuardada.id),
      }));
    }
  }, [comunasApi, usuario?.comunaId]);

  const regiones = [
    ...new Map(
      comunasApi.map((comuna) => [
        comuna.regionId,
        { id: comuna.regionId, nombre: comuna.regionNombre },
      ])
    ).values(),
  ];

  const comunas = comunasApi.filter(
    (comuna) => comuna.regionId === Number(datos.region)
  );

  const comunaSeleccionada = comunasApi.find(
    (comuna) => comuna.id === Number(datos.comuna)
  );

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    if (name === 'region') {
      setDatos({ ...datos, region: value, comuna: '' });
    } else {
      setDatos({ ...datos, [name]: value });
    }
  };

  const pagar = async (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      alert('Debes iniciar sesión para realizar la compra');
      navigate('/login');
      return;
    }

    if (!comunaSeleccionada) {
      alert('Selecciona una comuna válida');
      return;
    }

    setPagando(true);

    const numeroLocal = Date.now().toString().slice(-8);

    const clientePedido = {
      ...datos,
      region: comunaSeleccionada.regionNombre,
      comuna: comunaSeleccionada.nombre,
    };

    const ordenBase = {
      numero: numeroLocal,
      codigo: `ORDER${numeroLocal.slice(-5)}`,
      cliente: clientePedido,
      items,
      total,
    };

   
    const datosDireccion = {
      calle: datos.calle,
      depto: datos.departamento || null,
      comunaId: Number(datos.comuna),
    };

    
    const datosDireccionPedido = {
      calle: datos.calle,
      departamento: datos.departamento,
      region: clientePedido.region,
      comuna: clientePedido.comuna,
    };

    const datosBoleta = {
      usuario_id: usuario.id,
      datosDireccion: datosDireccionPedido,
      cliente: clientePedido,
      carrito: items.map((item) => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      })),
      total,
    };

    try {
      await actualizarDireccionDeUsuario(usuario.id, datosDireccion);
      const respuesta = await creacionPedido(datosBoleta);

      const usuarioActualizado = {
        ...usuario,
        calle: datos.calle,
        depto: datos.departamento || null,
        comunaId: Number(datos.comuna),
        comunaNombre: comunaSeleccionada.nombre,
      };

      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      localStorage.setItem('voltech_user', JSON.stringify(usuarioActualizado));

      guardarUltimaOrden({
        ...ordenBase,
        numero: respuesta?.numero || respuesta?.id || numeroLocal,
        estado: 'exitoso',
      });

      vaciar();
      alert('¡Compra realizada con éxito!');
      navigate('/');
    } catch (error) {
      console.error('No se pudo realizar el pago:', error);
      guardarUltimaOrden({ ...ordenBase, estado: 'error' });
      alert(
        'Error al procesar el pago: ' +
        (error.message || 'Intenta nuevamente')
      );
    } finally {
      setPagando(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="container py-4 text-center">
        <h2>Tu carrito está vacío</h2>
        <Link
          to="/categorias"
          className="btn btn-outline-primary mt-3"
        >
          Ver categorías
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="card shadow-sm mx-auto checkout-card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2 className="h4 mb-1">Carrito de compra</h2>
              <p className="text-muted mb-0">
                Completa la siguiente información
              </p>
            </div>

            <span className="badge bg-primary fs-6">
              Total a pagar: ${Number(total).toLocaleString('es-CL')}
            </span>
          </div>

          <div className="table-responsive mb-4">
            <table className="table table-sm align-middle">
              <thead className="table-light">
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        className="carrito-img"
                      />
                    </td>
                    <td>{item.nombre}</td>
                    <td>
                      ${Number(item.precio).toLocaleString('es-CL')}
                    </td>
                    <td>{item.cantidad}</td>
                    <td>
                      ${(Number(item.precio) * item.cantidad)
                        .toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={pagar}>
            <h3 className="h5">Información del cliente</h3>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="nombre" className="form-label">
                  Nombre *
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  className="form-control"
                  required
                  value={datos.nombre}
                  onChange={manejarCambio}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="apellidos" className="form-label">
                  Apellidos *
                </label>
                <input
                  id="apellidos"
                  name="apellidos"
                  className="form-control"
                  required
                  value={datos.apellidos}
                  onChange={manejarCambio}
                />
              </div>

              <div className="col-12">
                <label htmlFor="correo" className="form-label">
                  Correo *
                </label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  className="form-control"
                  required
                  value={datos.correo}
                  onChange={manejarCambio}
                />
              </div>
            </div>

            <h3 className="h5">
              Dirección de entrega de los productos
            </h3>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="calle" className="form-label">
                  Calle *
                </label>
                <input
                  id="calle"
                  name="calle"
                  className="form-control"
                  required
                  value={datos.calle}
                  onChange={manejarCambio}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="departamento" className="form-label">
                  Departamento (opcional)
                </label>
                <input
                  id="departamento"
                  name="departamento"
                  className="form-control"
                  value={datos.departamento}
                  onChange={manejarCambio}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="region" className="form-label">
                  Región *
                </label>
                <select
                  id="region"
                  name="region"
                  className="form-select"
                  required
                  value={datos.region}
                  onChange={manejarCambio}
                >
                  <option value="">Selecciona una región</option>
                  {regiones.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="comuna" className="form-label">
                  Comuna *
                </label>
                <select
                  id="comuna"
                  name="comuna"
                  className="form-select"
                  required
                  disabled={!datos.region}
                  value={datos.comuna}
                  onChange={manejarCambio}
                >
                  <option value="">Selecciona una comuna</option>
                  {comunas.map((comuna) => (
                    <option key={comuna.id} value={comuna.id}>
                      {comuna.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label htmlFor="indicaciones" className="form-label">
                  Indicaciones para la entrega (opcional)
                </label>
                <textarea
                  id="indicaciones"
                  name="indicaciones"
                  className="form-control"
                  rows={2}
                  value={datos.indicaciones}
                  onChange={manejarCambio}
                />
              </div>
            </div>

            <div className="text-end">
              <button
                type="submit"
                className="btn btn-success"
                disabled={pagando}
              >
                {pagando
                  ? 'Procesando...'
                  : 'Pagar ahora $' + Number(total).toLocaleString('es-CL')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}