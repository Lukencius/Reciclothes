document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando carga de productos');
    cargarProductos();
});

async function cargarProductos() {
    try {
        console.log('Intentando obtener productos...');
        const response = await fetch('https://reciclothes.onrender.com/api/productos');
        console.log('Respuesta recibida:', response);
        const productos = await response.json();
        console.log('Productos obtenidos:', productos);
        
        const productosContainer = document.getElementById('productosContainer');
        if (!productosContainer) {
            console.error('No se encontró el elemento productosContainer');
            return;
        }
        productosContainer.innerHTML = ''; // Limpiar contenedor

        productos.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            const imgSrc = `data:image/jpeg;base64,${producto.imagen}`;
            const imgElement = document.createElement('img');
            imgElement.src = imgSrc;
            imgElement.className = 'product-card-img'; // Añade la clase CSS aquí
            imgElement.alt = producto.name;
            imgElement.onerror = function() {
                console.error(`Error al cargar la imagen para el producto: ${producto.name}`);
                this.src = 'media/polera.png';
            };
            imgElement.onload = function() {
                console.log(`Imagen cargada correctamente para el producto: ${producto.name}`);
            };

            card.innerHTML = `
                <div class="card product-card"> <!-- Añade la clase CSS aquí -->
                    <div class="card-body">
                        <h5 class="card-title">${producto.name}</h5>
                        <p class="card-text">${producto.description}</p>
                        <p class="card-text"><strong>Precio: $${producto.price.toLocaleString('es-CL')}</strong></p>
                        <p class="card-text">Categoría: ${producto.category}</p>
                        <p class="card-text">Stock: ${producto.stock}</p>
                        <button class="btn btn-primary">Agregar al carrito</button>
                    </div>
                </div>
            `;
            card.querySelector('.card').insertBefore(imgElement, card.querySelector('.card-body'));
            productosContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error detallado:', error);
        const productosContainer = document.getElementById('productosContainer');
        if (productosContainer) {
            productosContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        Error al cargar los productos. Por favor, intente más tarde.
                    </div>
                </div>
            `;
        }
    }
}
