// Configuración de la API
const API_URL = 'https://reciclothes.onrender.com/api';

// Variable global para los productos
let currentProducts = [];

// Añade estas funciones al inicio de tu archivo
let currentSortOrder = {
    column: null,
    ascending: true
};

// Función para ordenar productos
function sortProducts(column) {
    if (currentSortOrder.column === column) {
        currentSortOrder.ascending = !currentSortOrder.ascending;
    } else {
        currentSortOrder.column = column;
        currentSortOrder.ascending = true;
    }

    // Actualizar iconos de ordenamiento
    updateSortIcons(column);

    currentProducts.sort((a, b) => {
        let valueA, valueB;
        
        switch(column) {
            case 'id':
                valueA = parseInt(a.Id_Producto) || 0;
                valueB = parseInt(b.Id_Producto) || 0;
                break;
            case 'precio':
                valueA = parseFloat(a.price) || 0;
                valueB = parseFloat(b.price) || 0;
                break;
            case 'stock':
                valueA = parseInt(a.stock) || 0;
                valueB = parseInt(b.stock) || 0;
                break;
            case 'nombre':
                valueA = a.name || '';
                valueB = b.name || '';
                return currentSortOrder.ascending ? 
                    valueA.localeCompare(valueB) : 
                    valueB.localeCompare(valueA);
            default:
                return 0;
        }

        if (valueA < valueB) return currentSortOrder.ascending ? -1 : 1;
        if (valueA > valueB) return currentSortOrder.ascending ? 1 : -1;
        return 0;
    });

    renderProducts();
}

// Función para actualizar los iconos de ordenamiento
function updateSortIcons(activeColumn) {
    const headers = document.querySelectorAll('.sort-header');
    headers.forEach(header => {
        const icon = header.querySelector('i');
        const column = header.getAttribute('data-column');
        
        // Remover clases previas
        header.classList.remove('active', 'asc', 'desc');
        icon.className = 'fas fa-sort';

        if (column === activeColumn) {
            header.classList.add('active');
            header.classList.add(currentSortOrder.ascending ? 'asc' : 'desc');
            icon.className = `fas fa-sort-${currentSortOrder.ascending ? 'up' : 'down'}`;
        }
    });
}

// Función para renderizar productos
function renderProducts(products = currentProducts) {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${product.Id_Producto}</td>
            <td>
                <div class="image-container">
                    <img src="${product.imagen || 'https://via.placeholder.com/80'}" 
                        alt="${product.name}" 
                        onerror="this.src='https://via.placeholder.com/80?text=Sin+Imagen'"
                        title="${product.name}">
                </div>
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.stock}</td>
            <td class="actions">
                <button 
                    onclick="editProduct(${product.Id_Producto})" 
                    class="edit-btn" 
                    title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button 
                    onclick="deleteProduct(${product.Id_Producto})"
                    class="delete-btn" 
                    title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Función para cargar productos
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/Productos`);
        currentProducts = await response.json();
        console.log('Productos cargados:', currentProducts); // Para debugging
        console.log('Ejemplo de producto:', currentProducts[0]);
        renderProducts();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar los productos');
    }
}

// Función para añadir producto
async function addProduct(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        imagen: document.getElementById('productImage').value
    };

    try {
        const response = await fetch(`${API_URL}/Productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            document.getElementById('productModal').style.display = "none";
            document.getElementById('productForm').reset();
            await loadProducts();
            alert('Producto agregado exitosamente');
        } else {
            throw new Error('Error al agregar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar el producto');
    }
}

// Función para editar producto
async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/Productos/${id}`);
        const product = await response.json();
        
        // Llenar el formulario con los datos del producto
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImage').value = product.imagen;
        
        // Guardar el ID del producto que se está editando
        document.getElementById('productForm').dataset.editId = id;
        
        // Cambiar el título del modal
        document.getElementById('modalTitle').textContent = 'Editar Producto';
        
        // Mostrar el modal
        document.getElementById('productModal').style.display = "block";
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el producto para editar');
    }
}

// Función para eliminar producto
async function deleteProduct(Id_Producto) {
    try {
        // Mostrar confirmación antes de eliminar
        const confirmar = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmar.isConfirmed) {
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Eliminando producto...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Realizar la petición DELETE
        const response = await fetch(`${API_URL}/Productos/${Id_Producto}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Respuesta del servidor:', response); // Debug

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error del servidor:', errorData);
            throw new Error(`Error del servidor: ${response.status}`);
        }

        // Mostrar mensaje de éxito
        await Swal.fire({
            title: '¡Eliminado!',
            text: 'El producto ha sido eliminado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        // Recargar la lista de productos
        await loadProducts();

    } catch (error) {
        console.error('Error detallado:', error);
        
        // Mostrar mensaje de error
        await Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el producto. Por favor, intenta de nuevo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}

// Función para manejar el envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Obtener los valores del formulario
        const formData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            imagen: document.getElementById('productImage').value || 'https://via.placeholder.com/80?text=Sin+Imagen'
        };

        // Validar que los campos requeridos no estén vacos
        if (!formData.name || !formData.category || isNaN(formData.price) || isNaN(formData.stock)) {
            throw new Error('Todos los campos son requeridos');
        }

        // Validar que el precio y stock sean números positivos
        if (formData.price < 0 || formData.stock < 0) {
            throw new Error('El precio y el stock deben ser números positivos');
        }

        console.log('Datos a enviar:', formData);

        const editId = event.target.dataset.editId;
        const url = editId ? `${API_URL}/Productos/${editId}` : `${API_URL}/Productos`;
        const method = editId ? 'PUT' : 'POST';

        console.log('URL:', url);
        console.log('Método:', method);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('Respuesta del servidor:', response);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error del servidor:', errorData);
            throw new Error(`Error del servidor: ${response.status}`);
        }

        // Si todo sale bien, cerrar el modal y recargar los productos
        document.getElementById('productModal').style.display = "none";
        event.target.reset();
        if (editId) {
            delete event.target.dataset.editId;
        }
        await loadProducts();
        
        // Mostrar mensaje de éxito
        alert(editId ? 'Producto actualizado exitosamente' : 'Producto agregado exitosamente');

    } catch (error) {
        console.error('Error detallado:', error);
        alert(error.message || 'Error al procesar el producto');
    }
}

// Función de búsqueda mejorada
function searchProducts(query) {
    query = query.toLowerCase().trim();
    console.log('Buscando:', query); // Debug
    
    // Mostrar/ocultar botón de limpiar
    toggleClearButton(query);

    // Si la búsqueda está vacía, mostrar todos los productos
    if (!query) {
        renderProducts();
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
        return;
    }

    // Filtrar productos
    const filtered = currentProducts.filter(product => {
        // Debug: ver qué estamos comparando
        console.log('Comprobando producto:', {
            name: product.name,
            category: product.category,
            id: product.Id_Producto
        });

        return (
            // Buscar en el nombre
            (product.name && 
             product.name.toString().toLowerCase().includes(query)) ||
            
            // Buscar en la categoría
            (product.category && 
             product.category.toString().toLowerCase().includes(query)) ||
            
            // Buscar en el ID
            (product.Id_Producto && 
             product.Id_Producto.toString().toLowerCase().includes(query)) ||
            
            // Buscar en el precio
            (product.price && 
             product.price.toString().includes(query))
        );
    });

    console.log('Productos filtrados:', filtered); // Debug

    // Renderizar resultados
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron productos que coincidan con "${query}"</p>
                </td>
            </tr>
        `;
    } else {
        filtered.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${product.Id_Producto}</td>
                <td>
                    <div class="image-container">
                        <img src="${product.imagen || 'https://via.placeholder.com/80'}" 
                            alt="${product.nombre}" 
                            onerror="this.src='https://via.placeholder.com/80?text=Sin+Imagen'"
                            title="${product.nombre}">
                    </div>
                </td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td class="actions">
                    <button onclick="editProduct(${product.Id_Producto})" class="edit-btn" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct(${product.Id_Producto})" class="delete-btn" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Actualizar contador de resultados
    updateSearchResults(filtered.length, currentProducts.length, query);
}

// Función para limpiar la búsqueda
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    renderProducts();
    
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
    
    toggleClearButton('');
}

// Función para mostrar/ocultar el botón de limpiar
function toggleClearButton(query) {
    const clearButton = document.querySelector('.clear-search');
    if (clearButton) {
        clearButton.style.visibility = query ? 'visible' : 'hidden';
    }
}

// Función para actualizar el contador de resultados
function updateSearchResults(found, total, query) {
    let resultsDiv = document.getElementById('searchResults');
    
    if (!resultsDiv) {
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'searchResults';
        resultsDiv.className = 'search-results';
        document.querySelector('.search-container').appendChild(resultsDiv);
    }

    resultsDiv.innerHTML = `
        <span>
            ${found} de ${total} productos encontrados 
            ${query ? `para "${query}"` : ''}
        </span>
    `;
    
    resultsDiv.style.display = query ? 'block' : 'none';
}

// Función para subir imagen a Cloudinary
function uploadImageToCloudinary() {
    const fileInput = document.getElementById('productImageFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('Por favor, selecciona una imagen para subir.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'pruebas_reciclothes'); // Reemplaza con tu upload preset de Cloudinary

    fetch('https://api.cloudinary.com/v1_1/dvyrnjwfi/image/upload', { // Reemplaza con tu cloud name
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.secure_url) {
            document.getElementById('productImage').value = data.secure_url;
            alert('Imagen subida con éxito.');
        } else {
            alert('Error al subir la imagen.');
        }
    })
    .catch(error => {
        console.error('Error al subir la imagen:', error);
        alert('Error al subir la imagen.');
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos al iniciar
    loadProducts();
    
    // Configurar el formulario
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Configurar el botón de añadir
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            const form = document.getElementById('productForm');
            form.reset();
            delete form.dataset.editId;
            document.getElementById('modalTitle').textContent = 'Añadir Producto';
            document.getElementById('productModal').style.display = "block";
        }
    }
    
    // Configurar el botón de cerrar modal
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('productModal').style.display = "none";
        }
    }
    
    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('productModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

document.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && e.target.parentElement.classList.contains('image-container')) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = e.target.src;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.5);
        `;
        
        modal.appendChild(img);
        document.body.appendChild(modal);
        
        modal.onclick = () => modal.remove();
    }
}); 

