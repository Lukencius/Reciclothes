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
                            <div class="search-item-price">$${producto.price}</div>
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

// Verificar API al cargar la página
verificarAPI();
