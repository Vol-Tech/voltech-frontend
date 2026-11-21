// Si tu backend Spring Boot corre en el puerto 8080 con versionado, cambia esta URL a: 'http://localhost:8080/api/v1'
const API_URL = 'http://localhost:3000/api';

// Helper para adjuntar automáticamente el token JWT en las peticiones REST (IE3.2.2 / IE3.3.1)
const getAuthHeaders = (hasBody = false) => {
  const headers = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('voltech_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper para parsear respuestas JSON o vacías (ej. 204 No Content en DELETE de Spring Boot)
const parsearRespuesta = async (respuesta, mensajeError) => {
  const texto = await respuesta.text();
  const resultado = texto ? JSON.parse(texto) : { exito: true, data: true };

  if (!respuesta.ok || resultado.exito === false) {
    throw new Error(resultado.mensaje || resultado.message || mensajeError);
  }

  return resultado.data !== undefined ? resultado.data : resultado;
};

// Colecciones auxiliares para el front
export const categorias = [
  { id: 'cables', nombre: 'Cables', imagen: '/img/Cable tipo C.png' },
  { id: 'mouse', nombre: 'Mouse', imagen: '/img/Mouse Gamer.png' },
  { id: 'monitores', nombre: 'Monitores', imagen: '/img/Monitor Gamer.png' },
];

export const regiones_comunas = {
  Metropolitana: ['Santiago', 'Puente Alto', 'Maipú', 'La Florida', 'Providencia', 'Las Condes', 'San Bernardo'],
  Valparaíso: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio'],
  Biobío: ['Concepción', 'Talcahuano', 'Chiguayante', 'Los Ángeles', 'Coronel'],
};

// ==========================================
// ENDPOINTS DE PRODUCTOS
// ==========================================

export const obtenerProductos = async () => {
  try {
    const respuesta = await fetch(`${API_URL}/productos`, {
      headers: getAuthHeaders(false),
    });
    return await parsearRespuesta(respuesta, 'Error al obtener los productos');
  } catch (error) {
    console.error('Error en obtenerProductos:', error);
    return [];
  }
};

export const obtenerProductoPorId = async (id) => {
  try {
    const respuesta = await fetch(`${API_URL}/productos/${id}`, {
      headers: getAuthHeaders(false),
    });
    return await parsearRespuesta(respuesta, `No se encontró el producto con ID ${id}`);
  } catch (error) {
    console.error(`Error en obtenerProductoPorId (${id}):`, error);
    return null;
  }
};

export const obtenerProductosCriticos = async () => {
  try {
    const respuesta = await fetch(`${API_URL}/productos/criticos`, {
      headers: getAuthHeaders(false),
    });
    return await parsearRespuesta(respuesta, 'Error al obtener productos críticos');
  } catch (error) {
    console.error('Error en obtenerProductosCriticos:', error);
    return [];
  }
};

export const crearProd = async (nuevoProducto) => {
  try {
    const respuesta = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(nuevoProducto),
    });
    return await parsearRespuesta(respuesta, 'Error al crear el producto');
  } catch (error) {
    console.error('Error en crearProd:', error);
    throw error;
  }
};

export const actualizarProducto = async (id, datosActualizados) => {
  try {
    const respuesta = await fetch(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(datosActualizados),
    });
    return await parsearRespuesta(respuesta, `Error al actualizar el producto ${id}`);
  } catch (error) {
    console.error(`Error en actualizarProducto (${id}):`, error);
    throw error;
  }
};

export const borrarProducto = async (id) => {
  try {
    const respuesta = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    return await parsearRespuesta(respuesta, `Error al eliminar el producto ${id}`);
  } catch (error) {
    console.error(`Error en borrarProducto (${id}):`, error);
    throw error;
  }
};

// ==========================================
// ENDPOINTS DE USUARIOS Y AUTENTICACIÓN
// ==========================================

export const obtenerTodoUsuarios = async () => {
  try {
    const respuesta = await fetch(`${API_URL}/usuarios`, {
      headers: getAuthHeaders(false),
    });
    return await parsearRespuesta(respuesta, 'Error al obtener los usuarios');
  } catch (error) {
    console.error('Error en obtenerTodoUsuarios:', error);
    return [];
  }
};

export const obtenerUsuarioPorEmail = async (email) => {
  try {
    const respuesta = await fetch(`${API_URL}/usuarios/email/${email}`, {
      headers: getAuthHeaders(false),
    });
    return await parsearRespuesta(respuesta, `No se encontró el usuario con EMAIL ${email}`);
  } catch (error) {
    console.error(`Error en obtenerUsuarioPorEmail (${email}):`, error);
    return null;
  }
};

export const obtenerIdUsuario = async (id) => {
  try {
    const respuesta = await fetch(`${API_URL}/usuarios/${id}`, {
      headers: getAuthHeaders(false),
    });
    return await parsearRespuesta(respuesta, `No se encontró el usuario con ID ${id}`);
  } catch (error) {
    console.error(`Error en obtenerIdUsuario (${id}):`, error);
    return null;
  }
};

export const creacionUsuario = async (nuevoUsuario) => {
  try {
    const respuesta = await fetch(`${API_URL}/usuarios/registro`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(nuevoUsuario),
    });
    return await parsearRespuesta(respuesta, 'Error al crear el usuario');
  } catch (error) {
    console.error('Error en creacionUsuario:', error);
    throw error;
  }
};

export const actualizarDireccionDeUsuario = async (id, datosDireccion) => {
  try {
    const respuesta = await fetch(`${API_URL}/usuarios/${id}/direccion`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(datosDireccion),
    });
    return await parsearRespuesta(respuesta, 'Error al actualizar la dirección');
  } catch (error) {
    console.error(`Error en actualizarDireccionDeUsuario (${id}):`, error.message);
    throw error;
  }
};

export const autenticarGoogleBackend = async (credential) => {
  const respuesta = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  return await parsearRespuesta(respuesta, 'Error al validar credencial de Google en el backend');
};

// ==========================================
// ENDPOINTS DE PEDIDOS / BOLETAS
// ==========================================

export const obtenerPedidosUsuario = async (usuario_id) => {
  try {
    const respuesta = await fetch(`${API_URL}/pedidos/usuario/${usuario_id}`, {
      headers: getAuthHeaders(false),
    });
    return await parsearRespuesta(respuesta, `Error al obtener los pedidos del usuario ${usuario_id}`);
  } catch (error) {
    console.error(`Error en obtenerPedidosUsuario (${usuario_id}):`, error);
    return [];
  }
};

export const creacionPedido = async (datosBoleta) => {
  try {
    const respuesta = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(datosBoleta),
    });
    return await parsearRespuesta(respuesta, 'Error al realizar el pedido');
  } catch (error) {
    console.error('Error en creacionPedido:', error);
    throw error;
  }
};