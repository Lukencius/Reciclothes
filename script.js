document.addEventListener('DOMContentLoaded', function() {
    const category = document.getElementById('category');
    const title = document.getElementById('title'); 
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let productos = []; // Array para almacenar todos los productos

    // Cargar productos al inicio
    cargarProductos();

    // Evento para filtrar productos por categoría
    category.addEventListener('click', function(e) {
        if (e.target.classList.contains('dropdown-item')) {
            let selectedCategory = e.target.textContent;
            title.innerHTML = selectedCategory;
            
            if(selectedCategory === 'Niños') {
                selectedCategory = 'Ninos';
            }
            // Filtrar por categoría y stock mayor a 0
            const productosFiltrados = productos.filter(producto => 
                producto.category === selectedCategory && producto.stock > 0
            );
            mostrarProductos(productosFiltrados);
        }
    });

        // Evento input para la búsqueda
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            searchResults.style.display = 'none';
            return;
        }

        // Filtrar productos
        const resultados = productos.filter(producto => 
            producto.name.toLowerCase().includes(searchTerm) && 
            producto.stock > 0
        );

        console.log('Resultados encontrados:', resultados);

        // Mostrar resultados
        if (resultados.length > 0) {
            searchResults.innerHTML = resultados.map(producto => {
                // Convertir el producto a string y escapar las comillas
                const productoString = JSON.stringify(producto).replace(/"/g, '&quot;');
                return `
                    <div class="search-item" onclick="verDetalleProducto(${productoString})">
                        <img src="${producto.imagen || 'media/placeholder.png'}" 
                             alt="${producto.name}"
                             onerror="this.src='media/placeholder.png'">
                        <div class="search-item-details">
                            <div class="search-item-name">${producto.name}</div>
                            <div class="search-item-price">${formatearPrecioChileno(producto.price)}</div>
                        </div>
                    </div>
                `;
            }).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div class="search-item">No se encontraron resultados</div>';
            searchResults.style.display = 'block';
        }
    });

    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Función para cargar productos
    async function cargarProductos() {
        try {
            const response = await fetch('https://reciclothes.onrender.com/api/productos');
            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }
            productos = await response.json();
            console.log('Productos cargados:', productos); // Para depuración
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Función para filtrar productos por categoría
    async function filtrarProductos(category) {
        const filteredProducts = productos.filter(producto => producto.category === category);
        mostrarProductos(filteredProducts);
    }

    // Función para mostrar productos
    function mostrarProductos(productos) {
        const productosContainer = document.getElementById('productosContainer');
        if (!productosContainer) return;

        productosContainer.innerHTML = productos.map(producto => {
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
                                     onerror="this.src='media/placeholder.webp'"
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
                                <small class="text-muted d-block text-center" style="color: ${producto.stock <= 1 ? '#dc3545' : ''} !important; font-weight: ${producto.stock <= 1 ? 'bold' : 'normal'}">
                                    ${producto.stock} unidad${producto.stock === 1 ? '' : 'es'} disponible${producto.stock === 1 ? '' : 's'}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
});

// Función para verificar si la API está respondiendo
async function verificarAPI() {
    try {
        const response = await fetch('https://reciclothes.onrender.com/api/productos');
        const data = await response.json();
        console.log('Respuesta de la API:', data); // Para depuración
        return true;
    } catch (error) {
        console.error('Error al verificar API:', error);
        return false;
    }
}

function formatearPrecioChileno(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(precio);
}

// Verificar API al cargar la página
verificarAPI();
