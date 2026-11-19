import React from 'react';
import ReactDOM from 'react-dom/client';
import ListadoOrdenes from './ListadoOrdenes';

describe('ListadoOrdenes - Restricción de Acciones en Interfaz (IE3.3.3)', () => {
  let container;
  let root;

  const renderOrdenes = (soloLectura) =>
    new Promise((resolve) => {
      root.render(<ListadoOrdenes soloLectura={soloLectura} />);
      setTimeout(resolve, 30);
    });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
  });

  it('debe mostrar botones de Ver Boleta y Cambiar Estado para ADMINISTRADOR (soloLectura=false)', async () => {
    await renderOrdenes(false);
    expect(container.textContent).toContain('Gestión de Órdenes');
    expect(container.textContent).toContain('Ver Boleta');
    expect(container.textContent).toContain('Cambiar Estado');
  });

  it('debe ocultar el botón Cambiar Estado cuando el rol es VENDEDOR (soloLectura=true)', async () => {
    await renderOrdenes(true);
    expect(container.textContent).toContain('Consulta de Órdenes');
    expect(container.textContent).toContain('Ver Boleta');
    expect(container.textContent).not.toContain('Cambiar Estado');
  });
});