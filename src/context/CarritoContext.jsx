import { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem('voltech_carrito') || localStorage.getItem('carrito');
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('voltech_carrito', JSON.stringify(carrito));
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: (item.cantidad || 1) + cantidad }
            : item
        );
      }
      return [...prev, { ...producto, cantidad }];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad: nuevaCantidad } : item))
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const totalItems = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
  const totalPrecio = carrito.reduce(
    (acc, item) => acc + (Number(item.precio) || 0) * (item.cantidad || 1),
    0
  );

  const value = {
    carrito,
    items: carrito,
    agregarAlCarrito,
    agregarProducto: agregarAlCarrito,
    eliminarDelCarrito,
    eliminarProducto: eliminarDelCarrito,
    actualizarCantidad,
    cambiarCantidad: actualizarCantidad,
    vaciarCarrito,
    limpiarCarrito: vaciarCarrito,
    totalItems,
    cantidadTotal: totalItems,
    totalPrecio,
    total: totalPrecio,
  };

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
}