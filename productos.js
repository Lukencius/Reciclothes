// Esperar a que el DOM esté completamente cargado antes de inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando carga de productos');
    cargarProductos();
});

/**
 * Función principal para cargar y mostrar los productos
 * Realiza la petición a la API y renderiza los productos en el DOM
 */
async function cargarProductos() {
    try {
        // Obtener el contenedor principal de productos
        const productosContainer = document.getElementById('productosContainer');
        if (!productosContainer) {
            throw new Error('No se encontró el elemento productosContainer');
        }
        
        // Obtener la categoría de la página actual
        const categoria = productosContainer.dataset.category;
        
        // Realizar petición a la API
        const response = await fetch('https://reciclothes.onrender.com/api/productos');
        const productos = await response.json();
        
        // Filtrar productos por categoría y stock
        const productosFiltrados = productos
            .filter(producto => producto.stock >= 1) // Filtrar por stock primero
            .filter(producto => !categoria || producto.category === categoria); // Luego por categoría si existe
        
        // Limpiar el contenedor antes de agregar nuevos productos
        productosContainer.innerHTML = ''; 
        
        // Generar el HTML para todos los productos usando template literals
        const productosHTML = productosFiltrados.map(producto => {
            // Usar imagen por defecto si no hay URL de imagen
            const imgSrc = producto.imagen || 'media/polera.png';
            
            return `
                <div class="col-md-4 mb-4">
                    <div class="card product-card" style="cursor: pointer; transition: transform 0.3s; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" onclick="verDetalleProducto(${JSON.stringify(producto).replace(/"/g, '&quot;')})">
                        <img src="${imgSrc}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="${producto.name}" onerror="this.src='media/polera.png'">
                        <div class="card-body">
                            <h5 class="card-title fw-bold text-primary mb-3" style="font-size: 1.25rem;">${producto.name}</h5>
                            <p class="card-text text-muted mb-3" style="font-size: 0.9rem; line-height: 1.5;">${producto.description}</p>
                            <p class="card-text price-tag mb-3" style="font-size: 1.4rem; color: #2ecc71; font-weight: 600;">
                                ${formatearPrecioChileno(producto.price)}
                            </p>
                            <div class="product-meta" style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="badge bg-info text-white" style="padding: 0.5rem 1rem; border-radius: 20px;">
                                    ${producto.category === 'Ninos' ? 'Niños' : producto.category}
                                </span>
                                <span class="stock-badge ${producto.stock > 5 ? 'bg-success' : 'bg-warning'}" 
                                      style="padding: 0.4rem 0.8rem; border-radius: 15px; color: white; font-size: 0.85rem;">
                                    ${producto.stock} disponibles
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join(''); // Unir todos los elementos en una sola cadena HTML
        // Insertar todos los productos en el DOM de una sola vez
        productosContainer.innerHTML = productosHTML;

        // Prevenir que el clic en el botón propague al contenedor
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

    } catch (error) {
        // Manejo de errores centralizado
        console.error('Error al cargar productos:', error);
        const errorHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    Error al cargar los productos. Por favor, intente más tarde.
                </div>
            </div>
        `;
        // Mostrar mensaje de error al usuario
        if (productosContainer) productosContainer.innerHTML = errorHTML;
    }
}

async function agregarAlCarrito(productoId) {
    try {
        // Obtener los datos del producto desde el servidor
        const response = await fetch(`https://reciclothes.onrender.com/api/productos/${productoId}`);
        const producto = await response.json();
        
        if (!producto) {
            throw new Error('Producto no encontrado');
        }

        // Obtener carrito actual o iniciar uno nuevo
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Buscar si el producto ya existe
        let productoEnCarrito = carrito.find(item => item.Id_Producto === parseInt(productoId));
        
        if (productoEnCarrito) {
            // Si existe, solo aumentar cantidad
            productoEnCarrito.cantidad += 1;
        } else {
            // Si no existe, agregar nuevo producto
            carrito.push({
                Id_Producto: parseInt(productoId),
                name: producto.name,
                price: producto.price,
                imagen: producto.imagen,
                cantidad: 1
            });
        }
        
        // Guardar carrito actualizado
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Notificar al usuario
        alert('Producto agregado al carrito');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar el producto al carrito');
    }
}

function verDetalleProducto(producto) {
    // Guardar el producto en localStorage para recuperarlo en la página de detalle
    localStorage.setItem('productoSeleccionado', JSON.stringify(producto));
    // Redirigir a la página de productos
    window.location.href = 'productos.html';
}

function formatearPrecioChileno(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(precio);
}
