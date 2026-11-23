const API_ANTIGUA_URL = 'http://localhost:3000/api';
const INVENTARIO_URL = '/api/v1/productos';

const getAuthHeaders = (hasBody = false) => {
  const headers = {};

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('voltech_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parsearRespuesta = async (respuesta, mensajeError) => {
  const texto = await respuesta.text();
  const resultado = texto
    ? JSON.parse(texto)
    : { exito: true, data: true };

  if (!respuesta.ok || resultado.exito === false) {
    throw new Error(resultado.mensaje || resultado.message || mensajeError);
  }

  return resultado.data !== undefined ? resultado.data : resultado;
};

const adaptarProducto = (producto) => ({
  ...producto,
  imagen_url: producto.imagenUrl,
  categoria: producto.categoriaNombre?.toLowerCase() ?? '',
});

export const categorias = [
  { id: 'cables', nombre: 'Cables', imagen: '/img/Cable tipo C.png' },
  { id: 'mouse', nombre: 'Mouse', imagen: '/img/Mouse Gamer.png' },
  { id: 'monitores', nombre: 'Monitores', imagen: '/img/Monitor Gamer.png' },
];

export const regiones_comunas = {
  Metropolitana: [
    'Santiago', 'Puente Alto', 'Maipú', 'La Florida',
    'Providencia', 'Las Condes', 'San Bernardo',
  ],
  Valparaíso: [
    'Valparaíso', 'Viña del Mar', 'Quilpué',
    'Villa Alemana', 'San Antonio',
  ],
  Biobío: [
    'Concepción', 'Talcahuano', 'Chiguayante',
    'Los Ángeles', 'Coronel',
  ],
};

// GET de productos: inventario-service a través del API Gateway
export const obtenerProductos = async () => {
  const respuesta = await fetch(INVENTARIO_URL);
  const datos = await parsearRespuesta(
    respuesta,
    'Error al obtener los productos'
  );

  if (!Array.isArray(datos)) {
    throw new Error('La API de inventario no devolvió una lista');
  }

  return datos.map(adaptarProducto);
};

export const obtenerProductoPorId = async (id) => {
  const respuesta = await fetch(`${INVENTARIO_URL}/${id}`);
  const producto = await parsearRespuesta(
    respuesta,
    `No se encontró el producto con ID ${id}`
  );

  return adaptarProducto(producto);
};

// Funciones existentes, pendientes de migrar a los microservicios
export const obtenerProductosCriticos = async () => {
  try {
    const respuesta = await fetch(
      `${API_ANTIGUA_URL}/productos/criticos`,
      { headers: getAuthHeaders() }
    );
    return await parsearRespuesta(
      respuesta,
      'Error al obtener productos críticos'
    );
  } catch (error) {
    console.error('Error en obtenerProductosCriticos:', error);
    return [];
  }
};

export const crearProd = async (nuevoProducto) => {
  const respuesta = await fetch(`${API_ANTIGUA_URL}/productos`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(nuevoProducto),
  });

  return parsearRespuesta(respuesta, 'Error al crear el producto');
};

export const actualizarProducto = async (id, datosActualizados) => {
  const respuesta = await fetch(`${API_ANTIGUA_URL}/productos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(datosActualizados),
  });

  return parsearRespuesta(
    respuesta,
    `Error al actualizar el producto ${id}`
  );
};

export const borrarProducto = async (id) => {
  const respuesta = await fetch(`${API_ANTIGUA_URL}/productos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return parsearRespuesta(
    respuesta,
    `Error al eliminar el producto ${id}`
  );
};

export const obtenerTodoUsuarios = async () => {
  try {
    const respuesta = await fetch(`${API_ANTIGUA_URL}/usuarios`, {
      headers: getAuthHeaders(),
    });
    return await parsearRespuesta(
      respuesta,
      'Error al obtener los usuarios'
    );
  } catch (error) {
    console.error('Error en obtenerTodoUsuarios:', error);
    return [];
  }
};

export const obtenerUsuarioPorEmail = async (email) => {
  try {
    const respuesta = await fetch(
      `${API_ANTIGUA_URL}/usuarios/email/${encodeURIComponent(email)}`,
      { headers: getAuthHeaders() }
    );
    return await parsearRespuesta(
      respuesta,
      `No se encontró el usuario con EMAIL ${email}`
    );
  } catch (error) {
    console.error('Error en obtenerUsuarioPorEmail:', error);
    return null;
  }
};

export const obtenerIdUsuario = async (id) => {
  try {
    const respuesta = await fetch(`${API_ANTIGUA_URL}/usuarios/${id}`, {
      headers: getAuthHeaders(),
    });
    return await parsearRespuesta(
      respuesta,
      `No se encontró el usuario con ID ${id}`
    );
  } catch (error) {
    console.error('Error en obtenerIdUsuario:', error);
    return null;
  }
};

export const creacionUsuario = async (nuevoUsuario) => {
  const respuesta = await fetch(`${API_ANTIGUA_URL}/usuarios/registro`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(nuevoUsuario),
  });

  return parsearRespuesta(respuesta, 'Error al crear el usuario');
};

export const actualizarDireccionDeUsuario = async (id, datosDireccion) => {
  const respuesta = await fetch(
    `${API_ANTIGUA_URL}/usuarios/${id}/direccion`,
    {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(datosDireccion),
    }
  );

  return parsearRespuesta(
    respuesta,
    'Error al actualizar la dirección'
  );
};

export const autenticarGoogleBackend = async (credential) => {
  const respuesta = await fetch(`${API_ANTIGUA_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  return parsearRespuesta(
    respuesta,
    'Error al validar credencial de Google en el backend'
  );
};

export const obtenerPedidosUsuario = async (usuarioId) => {
  try {
    const respuesta = await fetch(
      `${API_ANTIGUA_URL}/pedidos/usuario/${usuarioId}`,
      { headers: getAuthHeaders() }
    );
    return await parsearRespuesta(
      respuesta,
      `Error al obtener los pedidos del usuario ${usuarioId}`
    );
  } catch (error) {
    console.error('Error en obtenerPedidosUsuario:', error);
    return [];
  }
};

export const creacionPedido = async (datosBoleta) => {
  const respuesta = await fetch(`${API_ANTIGUA_URL}/pedidos`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(datosBoleta),
  });

  return parsearRespuesta(respuesta, 'Error al realizar el pedido');
};