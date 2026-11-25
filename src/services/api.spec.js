import {
  obtenerProductos,
  obtenerCategorias,
  crearProd,
  borrarProducto,
  actualizarDireccionDeUsuario,
} from './api.js';

describe('Servicios API REST y Seguridad JWT (IE3.2.2 / IE3.3.1)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe obtener la lista de productos desde el endpoint GET /productos', async () => {
    const mockProductos = [
      { id: 1, nombre: 'Mouse Gamer VolTech', precio: 25990, stock: 10 },
      { id: 2, nombre: 'Monitor 24 pulgadas', precio: 129990, stock: 5 },
    ];

    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(
        new Response(JSON.stringify({ exito: true, data: mockProductos }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    const resultado = await obtenerProductos();

    expect(window.fetch).toHaveBeenCalledWith('/api/v1/productos');
    expect(resultado.length).toBe(2);
    expect(resultado[0].nombre).toBe('Mouse Gamer VolTech');
  });

  it('debe incluir la cabecera Authorization Bearer JWT al crear un producto', async () => {
    localStorage.setItem('voltech_token', 'jwt-admin-12345');

    const nuevoProducto = {
      nombre: 'Cable HDMI 2.1',
      precio: 12990,
      stock: 20,
      categoriaId: 2,
      imagenUrl: null,
    };

    const fetchSpy = spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(
        new Response(JSON.stringify({ exito: true, data: { id: 10, ...nuevoProducto } }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    const creado = await crearProd(nuevoProducto);
    const [url, opcionesFetch] = fetchSpy.calls.mostRecent().args;

    expect(url).toBe('/api/v1/productos');
    expect(opcionesFetch.method).toBe('POST');
    expect(opcionesFetch.headers['Authorization']).toBe('Bearer jwt-admin-12345');
    expect(opcionesFetch.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(opcionesFetch.body)).toEqual(nuevoProducto);
    expect(creado.id).toBe(10);
  });

  it('debe enviar el token JWT al eliminar un producto con DELETE', async () => {
    localStorage.setItem('voltech_token', 'jwt-admin-999');

    const fetchSpy = spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(null, { status: 204 }))
    );

    await borrarProducto(5);
    const [url, opciones] = fetchSpy.calls.mostRecent().args;

    expect(url).toBe('/api/v1/productos/5');
    expect(opciones.method).toBe('DELETE');
    expect(opciones.headers['Authorization']).toBe('Bearer jwt-admin-999');
  });

  it('obtiene las categorías desde inventario por el gateway', async () => {
    const lista = [{ id: 2, nombre: 'Cables' }];
    const fetchSpy = spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify(lista), { status: 200 }))
    );

    expect(await obtenerCategorias()).toEqual(lista);
    expect(fetchSpy).toHaveBeenCalledWith('/api/v1/categorias');
  });

  it('envia la direccion al microservicio de usuarios por el gateway', async () => {
    localStorage.setItem('voltech_token', 'jwt-cliente');

    const datosDireccion = {
      calle: 'Av. Principal 123',
      depto: '4B',
      comunaId: 1,
    };

    const fetchSpy = spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(
        new Response(JSON.stringify({ id: 7, ...datosDireccion }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    await actualizarDireccionDeUsuario(7, datosDireccion);
    const [url, opciones] = fetchSpy.calls.mostRecent().args;

    expect(url).toBe('/api/v1/usuarios/7/direccion');
    expect(opciones.method).toBe('PUT');
    expect(opciones.headers.Authorization).toBe('Bearer jwt-cliente');
    expect(JSON.parse(opciones.body)).toEqual(datosDireccion);
  });
});