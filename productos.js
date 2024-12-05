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
                    <div class="card product-card h-100" style="cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 15px;" 
                         onclick="verDetalleProducto(${JSON.stringify(producto).replace(/"/g, '&quot;')})"
                         onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.2)';"
                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';">
                        <div class="position-relative">
                            <div class="card-img-container" style="height: 280px; overflow: hidden; border-radius: 15px 15px 0 0;">
                                <img src="${imgSrc}" 
                                     class="card-img-top" 
                                     style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" 
                                     alt="${producto.name}" 
                                     onerror="this.src='media/polera.png'"
                                     onmouseover="this.style.transform='scale(1.1)'"
                                     onmouseout="this.style.transform='scale(1)'">
                            </div>
                            ${producto.stock <= 5 ? `<span class="position-absolute top-0 end-0 m-2 badge bg-danger">¡Últimas unidades!</span>` : ''}
                        </div>
                        <div class="card-body d-flex flex-column p-4">
                            <h5 class="card-title fw-bold text-primary mb-2" style="font-size: 1.3rem; line-height: 1.4;">${producto.name}</h5>
                            <p class="card-text text-muted mb-3" style="font-size: 0.95rem; line-height: 1.6;">${producto.description}</p>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-info text-white" style="padding: 0.6rem 1.2rem; border-radius: 25px; font-size: 0.9rem;">
                                    ${producto.category === 'Ninos' ? 'Niños' : producto.category}
                                </span>
                                <p class="card-text price-tag m-0" style="font-size: 1.5rem; color: #2ecc71; font-weight: 700;">
                                    ${formatearPrecioChileno(producto.price)}
                                </p>
                            </div>
                            <div class="mt-auto">
                                <div class="progress mb-2" style="height: 10px; border-radius: 5px;">
                                    <div class="progress-bar ${producto.stock > 5 ? 'bg-success' : 'bg-warning'}" 
                                         role="progressbar" 
                                         style="width: ${(producto.stock / 20) * 100}%;" 
                                         aria-valuenow="${producto.stock}" 
                                         aria-valuemin="0" 
                                         aria-valuemax="20">
                                    </div>
                                </div>
                                <small class="text-muted d-block text-center" style="color: ${producto.stock <= 1 ? '#dc3545' : ''} !important">
                                    ${producto.stock} unidades disponibles
                                </small>
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
