import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { obtenerComunas, obtenerTodoUsuarios, obtenerIdUsuario, crearUsuarioAdmin, actualizarUsuarioAdmin, actualizarRolUsuario,} from '../services/api';

const RUTA_USUARIOS = '/admin/usuarios';

const formularioVacio = {
  run: '',
  nombre: '',
  apellidos: '',
  email: '',
  contraseña: '',
  calle: '',
  depto: '',
  comunaId: '',
  rol: 'CLIENTE',
};

export default function ListadoUsuarios() {
  const location = useLocation();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vista, setVista] = useState('lista');
  const [cargando, setCargando] = useState(false);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    Promise.all([obtenerTodoUsuarios(), obtenerComunas()])
      .then(([listaUsuarios, listaComunas]) => {
        setUsuarios(listaUsuarios);
        setComunas(listaComunas);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargandoLista(false));
  }, []);

  useEffect(() => {
    const ruta = location.pathname;
    setError('');

    if (ruta === `${RUTA_USUARIOS}/nuevo`) {
      setFormulario(formularioVacio);
      setUsuarioActual(null);
      setVista('nuevo');
      return;
    }

    const rutaEditar = ruta.match(/^\/admin\/usuarios\/editar\/(\d+)$/);
    const rutaDetalle = ruta.match(/^\/admin\/usuarios\/(\d+)$/);
    const id = rutaEditar?.[1] || rutaDetalle?.[1];

    if (!id) {
      setVista('lista');
      return;
    }

    setVista('cargando');

    obtenerIdUsuario(id)
      .then((usuario) => {
        setUsuarioActual(usuario);

        if (rutaEditar) {
          setFormulario({
            run: usuario.run || '',
            nombre: usuario.nombre || '',
            apellidos: usuario.apellidos || '',
            email: usuario.email || '',
            contraseña: '',
            calle: usuario.calle || '',
            depto: usuario.depto || '',
            comunaId: String(usuario.comunaId || ''),
            rol: usuario.rol || 'CLIENTE',
          });
          setVista('editar');
        } else {
          setVista('detalle');
        }
      })
      .catch((err) => {
        setError(err.message);
        setVista('lista');
      });
  }, [location.pathname]);

  const cambiarCampo = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setCargando(true);

    try {
      const datos = {
        nombre: formulario.nombre.trim(),
        apellidos: formulario.apellidos.trim(),
        email: formulario.email.trim(),
        calle: formulario.calle.trim(),
        depto: formulario.depto.trim() || null,
        comunaId: Number(formulario.comunaId),
      };

      let guardado;

      if (vista === 'nuevo') {
        guardado = await crearUsuarioAdmin(
          {
            ...datos,
            run: formulario.run.trim(),
            contraseña: formulario.contraseña,
          },
          formulario.rol
        );

        setUsuarios((actuales) => [...actuales, guardado]);
        setMensaje('Usuario creado correctamente');
      } else {
        guardado = await actualizarUsuarioAdmin(usuarioActual.id, datos);

        setUsuarios((actuales) =>
          actuales.map((usuario) =>
            usuario.id === guardado.id ? guardado : usuario
          )
        );
        setMensaje('Usuario actualizado correctamente');
      }

      navigate(RUTA_USUARIOS);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cambiarRol = async (id, rol) => {
    setError('');
    setMensaje('');

    try {
      const actualizado = await actualizarRolUsuario(id, rol);

      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === id ? actualizado : usuario
        )
      );

      setMensaje('Rol actualizado correctamente');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">👥 Gestión de Usuarios</h2>

        {vista === 'lista' ? (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`${RUTA_USUARIOS}/nuevo`)}
          >
            Nuevo usuario
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(RUTA_USUARIOS)}
          >
            Volver al listado
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      {vista === 'cargando' && <p>Cargando usuario...</p>}

      {vista === 'lista' && (
        <div className="table-responsive">
          {cargandoLista && <p>Cargando usuarios...</p>}

          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>RUN</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Comuna</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.run}</td>
                  <td>{usuario.nombre} {usuario.apellidos}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={usuario.rol}
                      onChange={(e) => cambiarRol(usuario.id, e.target.value)}
                    >
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="VENDEDOR">VENDEDOR</option>
                      <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                    </select>
                  </td>
                  <td>{usuario.comunaNombre}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => navigate(`${RUTA_USUARIOS}/${usuario.id}`)}
                    >
                      Ver
                    </button>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        navigate(`${RUTA_USUARIOS}/editar/${usuario.id}`)
                      }
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!cargandoLista && usuarios.length === 0 && !error && (
            <p className="text-muted">No hay usuarios para mostrar.</p>
          )}
        </div>
      )}

      {vista === 'detalle' && usuarioActual && (
        <div>
          <h4>{usuarioActual.nombre} {usuarioActual.apellidos}</h4>
          <p><strong>RUN:</strong> {usuarioActual.run}</p>
          <p><strong>Correo:</strong> {usuarioActual.email}</p>
          <p><strong>Rol:</strong> {usuarioActual.rol}</p>
          <p><strong>Calle:</strong> {usuarioActual.calle}</p>
          <p><strong>Departamento:</strong> {usuarioActual.depto || '—'}</p>
          <p><strong>Comuna:</strong> {usuarioActual.comunaNombre}</p>
          <p>
            <strong>Fecha de registro:</strong>{' '}
            {usuarioActual.fechaCreacion?.slice(0, 10) || '—'}
          </p>

          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(`${RUTA_USUARIOS}/editar/${usuarioActual.id}`)
            }
          >
            Editar usuario
          </button>
        </div>
      )}

      {(vista === 'nuevo' || vista === 'editar') && (
        <form onSubmit={guardarUsuario}>
          <h4 className="mb-3">
            {vista === 'nuevo' ? 'Nuevo usuario' : 'Editar usuario'}
          </h4>

          <div className="row g-3">
            {[
              ['run', 'RUN'],
              ['nombre', 'Nombre'],
              ['apellidos', 'Apellidos'],
              ['email', 'Correo'],
              ['calle', 'Calle'],
              ['depto', 'Departamento'],
            ].map(([campo, etiqueta]) => (
              <div className="col-md-6" key={campo}>
                <label className="form-label">{etiqueta}</label>
                <input
                  className="form-control"
                  name={campo}
                  type={campo === 'email' ? 'email' : 'text'}
                  value={formulario[campo]}
                  onChange={cambiarCampo}
                  required={campo !== 'depto'}
                  disabled={vista === 'editar' && campo === 'run'}
                />
              </div>
            ))}

            {vista === 'nuevo' && (
              <div className="col-md-6">
                <label className="form-label">Contraseña</label>
                <input
                  className="form-control"
                  name="contraseña"
                  type="password"
                  value={formulario.contraseña}
                  onChange={cambiarCampo}
                  required
                />
              </div>
            )}

            <div className="col-md-6">
              <label className="form-label">Comuna</label>
              <select
                className="form-select"
                name="comunaId"
                value={formulario.comunaId}
                onChange={cambiarCampo}
                required
              >
                <option value="">Selecciona una comuna</option>
                {comunas.map((comuna) => (
                  <option key={comuna.id} value={comuna.id}>
                    {comuna.nombre} — {comuna.regionNombre}
                  </option>
                ))}
              </select>
            </div>

            {vista === 'nuevo' && (
              <div className="col-md-6">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  name="rol"
                  value={formulario.rol}
                  onChange={cambiarCampo}
                >
                  <option value="CLIENTE">CLIENTE</option>
                  <option value="VENDEDOR">VENDEDOR</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                </select>
              </div>
            )}
          </div>

          <button className="btn btn-primary mt-4" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar usuario'}
          </button>
        </form>
      )}
    </div>
  );
}