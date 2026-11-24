import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { obtenerUsuarioPorEmail } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');

  const [msgError, setMsgError] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const { loginWithGoogle, syncSession } = useAuth();

  const redirigirPorRol = (rol) => {
    const rolNormalizado = (rol || 'CLIENTE').toUpperCase();
    if (rolNormalizado === 'ADMINISTRADOR') {
      navigate('/admin');
    } else if (rolNormalizado === 'VENDEDOR') {
      navigate('/admin/productos');
    } else {
      navigate('/');
    }
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setMsgError('');
    setCargando(true);

    try {
      const usuario = await obtenerUsuarioPorEmail(email.trim());

      if (!usuario) {
        setMsgError('No existe una cuenta con este correo');
        return;
      }

      const contraGuardada = usuario.contrasena;

      if (String(contraGuardada) !== String(contrasena)) {
        setMsgError('Contraseña incorrecta');
        return;
      }

      const usuarioNormalizado = {
        ...usuario,
        rol: (usuario.rol || 'CLIENTE').toUpperCase(),
      };

      const tokenSesion = usuario.token || `voltech-jwt-${usuario.id || Date.now()}`;
      syncSession(tokenSesion, usuarioNormalizado);

      alert(`¡Bienvenido/a de vuelta, ${usuarioNormalizado.nombre}!`);
      redirigirPorRol(usuarioNormalizado.rol);
    } catch (error) {
      setMsgError('Error al intentar iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  const manejarLoginGoogle = async (credentialResponse) => {
    setMsgError('');
    setCargando(true);

    try {
      const usuario = await loginWithGoogle(credentialResponse);
      alert(`¡Bienvenido/a, ${usuario.nombre}!`);
      redirigirPorRol(usuario.rol);
    } catch (error) {
      setMsgError('No se pudo iniciar sesión con Google. Verifica tu cuenta institucional.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="main-login">
      <img src="img/VolTech Logo - Sin texto.png" alt="main-logo" />

      <form className="form-container" id="formulario" onSubmit={iniciarSesion}>
        <h3>Inicio de sesión</h3>

        {msgError && (
          <div className="alert alert-danger py-2 w-100 text-center text-danger fw-bold" role="alert">
            {msgError}
          </div>
        )}

        <h4>Correo</h4>
        <input
          type="text"
          id="regCorreo"
          placeholder="Ingrese correo (ej: usuario@duoc.cl)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <h4>Contraseña</h4>
        <input
          type="password"
          id="regContraseña"
          placeholder="Ingrese contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />

        <button type="submit" disabled={cargando}>
          {cargando ? 'Verificando...' : 'Iniciar Sesión'}
        </button>

        <div className="w-100 text-center my-2">
          <span className="text-muted small">o continúa con</span>
        </div>

        <div className="w-100 d-flex justify-content-center">
          <GoogleLogin
            onSuccess={manejarLoginGoogle}
            onError={() => setMsgError('Error al conectar con Google Auth')}
            useOneTap={false}
          />
        </div>
      </form>
    </main>
  );
}
