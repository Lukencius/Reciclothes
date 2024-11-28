// Configuración de la API
const API_URL = 'https://reciclothes.onrender.com/api';

// Al cargar la página, decidir qué vista mostrar
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetail(productId);
    } else {
        loadProducts();
    }
});

// Cargar lista de productos
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const products = await response.json();
        renderProductsList(products);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showError('No se pudieron cargar los productos');
    }
}

// Renderizar lista de productos
function renderProductsList(products) {
    const container = document.getElementById('productosContainer');
    
    if (!products.length) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="no-products">No hay productos disponibles</p>
            </div>
        `;
        return;
    }

    const productsHTML = products.map(product => `
        <div class="col-12 col-sm-6 col-lg-4 mb-4">
            <div class="product-card" onclick="navigateToProduct(event, ${product.id})">
                <div class="product-image-container">
                    <img 
                        src="${product.imagen || 'media/placeholder.png'}" 
                        alt="${product.name}"
                        class="product-image"
                        loading="lazy"
                    >
                    <div class="product-badges">
                        ${product.categoria === 'eco' ? 
                            '<span class="badge badge-eco">ECO</span>' : ''}
                        ${product.descuento ? 
                            `<span class="badge badge-discount">-${product.descuento}%</span>` : ''}
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        ${product.descuento ? 
                            `<span class="original-price">$${product.precio_original}</span>` : ''}
                        <span class="current-price">$${product.price}</span>
                    </div>
                    <p class="product-description">${product.description || 'Sin descripción disponible'}</p>
                    <div class="product-stock">
                        Stock: <span class="${product.stock > 0 ? 'in-stock' : 'out-stock'}">
                            ${product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                        </span>
                    </div>
                    <div class="product-actions" onclick="event.stopPropagation()">
                        ${product.stock > 0 ? `
                            <button 
                                class="btn-add-cart"
                                onclick="addToCart(${product.id})"
                            >
                                <i class="fas fa-shopping-cart"></i>
                                Añadir al carrito
                            </button>
                        ` : `
                            <button class="btn-notify" onclick="notifyAvailability(${product.id})">
                                <i class="fas fa-bell"></i>
                                Notificarme
                            </button>
                        `}
                        <button 
                            class="btn-favorite ${product.isFavorite ? 'active' : ''}"
                            onclick="toggleFavorite(${product.id})"
                        >
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = productsHTML;
}

// Cargar detalle de producto
async function loadProductDetail(productId) {
    try {
        const response = await fetch(`${API_URL}/productos/${productId}`);
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        const product = await response.json();
        renderProductDetail(product);
    } catch (error) {
        console.error('Error al cargar el detalle del producto:', error);
        showError('No se pudo cargar el detalle del producto');
    }
}

// Función para navegar al detalle
function navigateToProduct(event, productId) {
    if (event.target.closest('.product-actions')) {
        return;
    }
    window.location.href = `productos.html?id=${productId}`;
}

// Mostrar errores
function showError(message) {
    const container = document.getElementById('productosContainer');
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        </div>
    `;
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Implementa tu sistema de notificaciones aquí
    alert(message); // Temporal, reemplazar con un sistema de notificaciones mejor
}
