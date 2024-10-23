document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando carga de productos');
    cargarProductos();
});

async function cargarProductos() {
    try {
        console.log('Intentando obtener productos...');
        const response = await fetch('https://reciclothes.onrender.com/api/productos');  // URL completa
        console.log('Respuesta recibida:', response);
        const productos = await response.json();
        console.log('Productos obtenidos:', productos);
        
        const tbody = document.getElementById('productosBody');
        if (!tbody) {
            console.error('No se encontró el elemento productosBody');
            return;
        }
        
        tbody.innerHTML = ''; // Limpiar tabla

        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.name}</td>
                <td>${producto.description}</td>
                <td>${producto.category}</td>
                <td>$${producto.price.toLocaleString('es-CL')}</td>
                <td>${producto.stock}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error detallado:', error);
        const tbody = document.getElementById('productosBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Error al cargar los productos. Por favor, intente más tarde.
                    </td>
                </tr>
            `;
        }
    }
}
