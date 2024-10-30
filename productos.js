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
        
        // Realizar petición a la API
        const response = await fetch('https://reciclothes.onrender.com/api/productos');
        const productos = await response.json();
        
        // Limpiar el contenedor antes de agregar nuevos productos
        productosContainer.innerHTML = ''; 
        
        // Generar el HTML para todos los productos usando template literals
        const productosHTML = productos.map(producto => {
            // Usar imagen por defecto si no hay URL de imagen
            const imgSrc = producto.imagen || 'media/polera.png';
            
            return `
                <div class="col-md-4 mb-4">
                    <div class="card product-card" style="cursor: pointer;" onclick="verDetalleProducto(${JSON.stringify(producto).replace(/"/g, '&quot;')})">
                        <img src="${imgSrc}" class="card-img-top product-card-img" alt="${producto.name}" onerror="this.src='media/polera.png'">
                        <div class="card-body">
                            <h5 class="card-title">${producto.name}</h5>
                            <p class="card-text">${producto.description}</p>
                            <p class="card-text"><strong>Precio: $${producto.price.toLocaleString('es-CL')}</strong></p>
                            <p class="card-text">Categoría: ${producto.category}</p>
                            <p class="card-text">Stock: ${producto.stock}</p>
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

function verDetalleProducto(producto) {
    // Guardar el producto en localStorage para recuperarlo en la página de detalle
    localStorage.setItem('productoSeleccionado', JSON.stringify(producto));
    // Redirigir a la página de productos
    window.location.href = 'productos.html';
}
