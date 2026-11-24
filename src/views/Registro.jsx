import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { creacionUsuario, obtenerComunas } from '../services/api'

export default function Registro() {
  const navigate = useNavigate()

  const [datosForm, setDatosForm] = useState({
    run: '',
    nombre: '',
    apellido: '',
    email: '',
    confirmarEmail: '',
    contrasena: '',
    confirmarContrasena: '',
    calle: '',
    depto: '',
    region: '',
    comuna: '',
  })

  const [msgError, setMsgError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [comunas, setComunas] = useState([])

  useEffect(() => {
    obtenerComunas()
      .then(setComunas)
      .catch(() => setMsgError('No se pudieron cargar las comunas'))
  }, [])

  const regiones = [...new Map(
    comunas.map((comuna) => [
      comuna.regionId,
      { id: comuna.regionId, nombre: comuna.regionNombre },
    ])
  ).values()]

  const comunasDisponibles = datosForm.region
    ? comunas.filter(
        (comuna) => comuna.regionId === Number(datosForm.region)
      )
    : []

  const registrar = async (e) => {
    e.preventDefault()
    setMsgError('')

    if (datosForm.email.trim() !== datosForm.confirmarEmail.trim()) {
      setMsgError('Los correos no coinciden')
      return
    }

    if (datosForm.contrasena !== datosForm.confirmarContrasena) {
      setMsgError('Las contraseñas no coinciden')
      return
    }

    const nuevoUsuario = {
      run: datosForm.run.trim(),
      nombre: datosForm.nombre.trim(),
      apellidos: datosForm.apellido.trim(),
      email: datosForm.email.trim(),
      contraseña: datosForm.contrasena,
      calle: datosForm.calle.trim(),
      depto: datosForm.depto.trim() || null,
      comunaId: Number(datosForm.comuna),
    }

    setCargando(true)

    try {
      await creacionUsuario(nuevoUsuario)
      alert('¡Usuario registrado! Ahora puedes iniciar sesión.')
      navigate('/login')
    } catch (error) {
      setMsgError(error.message || 'Error al registrar el usuario')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="main-login">
      <img src="img/VolTech Logo - Sin texto.png" alt="main-logo" />

      <form className="form-container" id="formulario" onSubmit={registrar}>
        <h3>Registro de usuario</h3>

        <h4>Run</h4>
        <input
          type="text"
          id="regRun"
          placeholder="Ingrese RUN sin guion ni puntos"
          value={datosForm.run}
          onChange={(e) =>
            setDatosForm({ ...datosForm, run: e.target.value })
          }
          required
        />

        <h4>Nombre y Apellido</h4>
        <div className="nom-apellidos-container">
          <input
            type="text"
            id="regNombre"
            placeholder="Nombre"
            value={datosForm.nombre}
            onChange={(e) =>
              setDatosForm({ ...datosForm, nombre: e.target.value })
            }
            required
          />
          <input
            type="text"
            id="regApellido"
            placeholder="Apellidos"
            value={datosForm.apellido}
            onChange={(e) =>
              setDatosForm({ ...datosForm, apellido: e.target.value })
            }
            required
          />
        </div>

        <h4>Correo</h4>
        <input
          type="email"
          id="regCorreo"
          placeholder="Ingrese correo"
          value={datosForm.email}
          onChange={(e) =>
            setDatosForm({ ...datosForm, email: e.target.value })
          }
          required
        />

        <h4>Confirmar correo</h4>
        <input
          type="email"
          id="regConfirmarCorreo"
          placeholder="Confirme su correo"
          value={datosForm.confirmarEmail}
          onChange={(e) =>
            setDatosForm({ ...datosForm, confirmarEmail: e.target.value })
          }
          required
        />

        <h4>Contraseña</h4>
        <input
          type="password"
          id="regContraseña"
          placeholder="Ingrese contraseña"
          value={datosForm.contrasena}
          onChange={(e) =>
            setDatosForm({ ...datosForm, contrasena: e.target.value })
          }
          required
        />

        <h4>Confirmar contraseña</h4>
        <input
          type="password"
          id="regConfirmContraseña"
          placeholder="Confirme contraseña"
          value={datosForm.confirmarContrasena}
          onChange={(e) =>
            setDatosForm({
              ...datosForm,
              confirmarContrasena: e.target.value,
            })
          }
          required
        />

        <h4>Dirección</h4>
        <input
          type="text"
          id="regCalle"
          placeholder="Calle y número"
          value={datosForm.calle}
          onChange={(e) =>
            setDatosForm({ ...datosForm, calle: e.target.value })
          }
          required
        />

        <input
          type="text"
          id="regDepto"
          placeholder="Departamento (opcional)"
          value={datosForm.depto}
          onChange={(e) =>
            setDatosForm({ ...datosForm, depto: e.target.value })
          }
        />

        <div className="select-container">
          <select
            name="region"
            id="sel-region"
            value={datosForm.region}
            onChange={(e) =>
              setDatosForm({
                ...datosForm,
                region: e.target.value,
                comuna: '',
              })
            }
            required
          >
            <option value="">Seleccione la Región</option>
            {regiones.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nombre}
              </option>
            ))}
          </select>

          <select
            name="comuna"
            id="sel-comuna"
            value={datosForm.comuna}
            onChange={(e) =>
              setDatosForm({ ...datosForm, comuna: e.target.value })
            }
            disabled={!datosForm.region}
            required
          >
            <option value="">Seleccione la Comuna</option>
            {comunasDisponibles.map((comuna) => (
              <option key={comuna.id} value={comuna.id}>
                {comuna.nombre}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrar'}
        </button>

        {msgError && (
          <div
            className="alert alert-danger py-2 w-100 text-center text-danger fw-bold"
            role="alert"
          >
            {msgError}
          </div>
        )}
      </form>
    </main>
  )
}