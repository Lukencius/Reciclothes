document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let productos = []; // Array para almacenar todos los productos

    // Cargar productos al inicio
    cargarProductos();

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

    // Evento input para la búsqueda
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        // Limpiar resultados si el término de búsqueda está vacío
        if (searchTerm === '') {
            searchResults.style.display = 'none';
            return;
        }

        // Filtrar productos
        const resultados = productos.filter(producto => 
            producto.name.toLowerCase().includes(searchTerm)
        );

        console.log('Resultados encontrados:', resultados); // Para depuración

        // Mostrar resultados
        if (resultados.length > 0) {
            searchResults.innerHTML = resultados.map(producto => `
                <div class="search-item" onclick="window.location.href='productos.html?id=${producto.Id_Producto}'">
                    <img src="${producto.imagen || 'media/placeholder.png'}" 
                         alt="${producto.name}"
                         onerror="this.src='media/placeholder.png'">
                    <div class="search-item-details">
                        <div class="search-item-name">${producto.name}</div>
                        <div class="search-item-price">$${producto.price}</div>
                    </div>
                </div>
            `).join('');
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

