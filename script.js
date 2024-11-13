document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const API_URL = 'https://reciclothes.onrender.com/api';
    let productos = []; // Variable para almacenar los productos

    // Cargar productos desde la API
    async function cargarProductos() {
        try {
            const response = await fetch(`${API_URL}/Productos`);
            productos = await response.json();
            console.log('Productos cargados:', productos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    // Cargar productos al iniciar
    cargarProductos();

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        console.log('Buscando:', searchTerm);

        if (searchTerm === '') {
            searchResults.classList.add('d-none');
            return;
        }

        const filteredProducts = productos.filter(producto => {
            return (
                (producto.name && 
                 producto.name.toString().toLowerCase().includes(searchTerm)) ||
                
                (producto.category && 
                 producto.category.toString().toLowerCase().includes(searchTerm)) ||
                
                (producto.Id_Producto && 
                 producto.Id_Producto.toString().toLowerCase().includes(searchTerm)) ||
                
                (producto.price && 
                 producto.price.toString().includes(searchTerm))
            );
        });

        console.log('Productos filtrados:', filteredProducts);

        if (filteredProducts.length > 0) {
            searchResults.innerHTML = filteredProducts
                .slice(0, 5)
                .map(producto => `
                    <div class="p-2 border-bottom search-item" 
                         onclick="window.location.href='producto.html?id=${producto.Id_Producto}'">
                        <div class="d-flex align-items-center">
                            <img src="${producto.imagen || 'https://via.placeholder.com/80'}" 
                                 alt="${producto.name}" 
                                 style="width: 40px; height: 40px; object-fit: cover;" 
                                 class="me-2"
                                 onerror="this.src='https://via.placeholder.com/80?text=Sin+Imagen'">
                            <div>
                                <div class="fw-bold">${producto.name}</div>
                                <div class="small text-muted">$${parseFloat(producto.price).toFixed(2)}</div>
                                <div class="small text-muted">Stock: ${producto.stock}</div>
                            </div>
                        </div>
                    </div>
                `).join('');
            searchResults.classList.remove('d-none');
        } else {
            searchResults.innerHTML = `
                <div class="p-2 text-muted">
                    <i class="fas fa-search me-2"></i>
                    No se encontraron productos que coincidan con "${searchTerm}"
                </div>`;
            searchResults.classList.remove('d-none');
        }
    });

    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('d-none');
        }
    });
});

// Actualizar los estilos
const style = document.createElement('style');
style.textContent = `
    #searchInput {
        background-color: #ffffff;
        border: 2px solid #198754;
        color: #333;
        width: 100%;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border-radius: 0.5rem;
        transition: all 0.3s ease;
    }

    #searchInput::placeholder {
        color: #198754;
        opacity: 0.7;
        font-weight: 500;
    }

    #searchInput:focus {
        background-color: #fff;
        border-color: #198754;
        box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
        outline: none;
    }

    .search-item {
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0.75rem !important;
    }

    .search-item:hover {
        background-color: rgba(25, 135, 84, 0.1);
    }

    #searchResults {
        max-height: 400px;
        overflow-y: auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        border: 2px solid #198754;
        border-radius: 0.5rem;
        background-color: white;
        margin-top: 0.5rem;
    }

    .search-item img {
        border-radius: 6px;
        width: 50px !important;
        height: 50px !important;
    }

    .search-item .text-muted {
        color: #198754 !important;
        opacity: 0.8;
    }

    .search-item .fw-bold {
        color: #333;
        font-size: 1rem;
    }
`;
document.head.appendChild(style);

