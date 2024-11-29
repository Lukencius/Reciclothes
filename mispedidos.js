// Configuración de la API
const API_URL = 'https://reciclothes.onrender.com/api';

// Estado global
let currentOrders = [];
let currentPage = 1;
const ordersPerPage = 10;

// Agregar obtención de userData al inicio
let userData = null;

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', async () => {
    await obtenerUserData();
    loadOrders();
    setupEventListeners();
    inicializarBusqueda();
});

async function obtenerUserData() {
    try {
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
            window.location.href = '/login.html';
            return;
        }

        userData = JSON.parse(userDataStr);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron obtener los datos del usuario'
        });
        window.location.href = '/login.html';
    }
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/ordenes/cliente/${userData.Id_Cliente}`);
        if (!response.ok) throw new Error('Error al cargar las órdenes');
        
        const ordenes = await response.json();
        currentOrders = ordenes;
        currentPage = 1; // Resetear a la primera página
        updateOrdersTable();
        updateStats();
        actualizarContadores(ordenes);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los pedidos'
        });
    }
}

function updateOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = currentOrders.slice(startIndex, endIndex);

    if (ordersToShow.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="11" class="text-center">No se encontraron resultados</td>';
        tableBody.appendChild(row);
        return;
    }

    ordersToShow.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.Id_Orden}</td>
            <td>${order.cliente}</td>
            <td>${order.email}</td>
            <td>${order.telefono}</td>
            <td>${order.direccion}</td>
            <td>${order.numero_casa}</td>
            <td>${order.products}</td>
            <td>${new Date(order.order_date).toLocaleDateString('es-CL')}</td>
            <td>$${parseFloat(order.total_amount).toLocaleString('es-CL')}</td>
            <td>
                <span class="status-badge status-${order.estado.toLowerCase()}">
                    ${order.estado}
                </span>
            </td>
            <td>
                <button onclick="showImage('${order.imagen}')" class="action-btn image-btn">
                    <i class="fas fa-image"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    updatePagination();
}

function updatePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(currentOrders.length / ordersPerPage);
    
    let paginationHTML = '';
    
    // Botón Anterior
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" 
                class="pagination-btn" 
                ${currentPage === 1 ? 'disabled' : ''}>
            &laquo; Anterior
        </button>
    `;

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button onclick="changePage(${i})" 
                        class="pagination-btn ${currentPage === i ? 'active' : ''}">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span class="pagination-dots">...</span>';
        }
    }

    // Botón Siguiente
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" 
                class="pagination-btn" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            Siguiente &raquo;
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Añadir esta nueva función para cambiar de página
function changePage(newPage) {
    const totalPages = Math.ceil(currentOrders.length / ordersPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updateOrdersTable();
    }
}

function updateStats() {
    // Implementa la actualización de estadísticas aquí
}

function showOrderDetails(orderId) {
    // Implementa la lógica para mostrar detalles de una orden aquí
}

function printOrder(orderId) {
    // Implementa la lógica para imprimir una orden aquí
}

// Agregar esta función para mostrar la imagen
function showImage(imageUrl) {
    console.log('URL de la imagen:', imageUrl);
    
    if (!imageUrl) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No hay comprobante de pago disponible'
        });
        return;
    }

    // Mostrar la imagen directamente sin verificación previa
    Swal.fire({
        title: 'Comprobante de Pago',
        imageUrl: imageUrl,
        imageWidth: 600,
        imageHeight: 'auto',
        imageAlt: 'Comprobante de pago',
        showCloseButton: true,
        showConfirmButton: false,
        width: 800,
        customClass: {
            image: 'swal-image'
        },
        // Manejar error de carga de imagen
        didOpen: (modal) => {
            const image = modal.querySelector('.swal2-image');
            image.onerror = () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar la imagen del comprobante'
                });
            };
        }
    });
}

// Agregar esta nueva función para manejar el cambio de estado
async function cambiarEstado(orderId, estadoActual) {
    const { value: nuevoEstado } = await Swal.fire({
        title: 'Cambiar Estado del Pedido',
        input: 'select',
        inputOptions: {
            'Pendiente': 'Pendiente',
            'En Proceso': 'En Proceso',
            'Enviado': 'Enviado',
            'Entregado': 'Entregado',
            'Cancelado': 'Cancelado'
        },
        inputValue: estadoActual,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar',
        inputValidator: (value) => {
            if (!value) {
                return 'Debes seleccionar un estado';
            }
        }
    });

    if (nuevoEstado) {
        try {
            const response = await fetch(`${API_URL}/ordenes/${orderId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) throw new Error('Error al actualizar el estado');

            await Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: 'El estado del pedido ha sido actualizado correctamente'
            });

            // Recargar los pedidos para mostrar el cambio
            await loadOrders();
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el estado del pedido'
            });
        }
    }
}

// Función para la búsqueda de pedidos
function inicializarBusqueda() {
    const searchInput = document.querySelector('.search-box input');
    let timeoutId;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(timeoutId); // Limpiar el timeout anterior
        
        // Crear un nuevo timeout para evitar muchas actualizaciones
        timeoutId = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            // Filtrar el array original
            const ordenesFiltradas = searchTerm === '' ? 
                currentOrders : 
                currentOrders.filter(order => 
                    order.Id_Orden.toString().toLowerCase().includes(searchTerm) ||
                    order.cliente.toLowerCase().includes(searchTerm) ||
                    order.email.toLowerCase().includes(searchTerm) ||
                    order.estado.toLowerCase().includes(searchTerm) ||
                    order.telefono.toLowerCase().includes(searchTerm) ||
                    order.direccion.toLowerCase().includes(searchTerm)
                );

            // Actualizar la tabla con los resultados filtrados
            const tableBody = document.getElementById('ordersTableBody');
            tableBody.innerHTML = '';

            if (ordenesFiltradas.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="11" class="text-center">No se encontraron resultados</td>';
                tableBody.appendChild(row);
                return;
            }

            // Mostrar los resultados filtrados
            ordenesFiltradas.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${order.Id_Orden}</td>
                    <td>${order.cliente}</td>
                    <td>${order.email}</td>
                    <td>${order.telefono}</td>
                    <td>${order.direccion}</td>
                    <td>${order.numero_casa}</td>
                    <td>${order.products}</td>
                    <td>${new Date(order.order_date).toLocaleDateString('es-CL')}</td>
                    <td>$${parseFloat(order.total_amount).toLocaleString('es-CL')}</td>
                    <td>
                        <span class="status-badge status-${order.estado.toLowerCase()}">
                            ${order.estado}
                        </span>
                    </td>
                    <td>
                        <button onclick="cambiarEstado(${order.Id_Orden}, '${order.estado}')" class="action-btn status-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="showImage('${order.imagen}')" class="action-btn image-btn">
                            <i class="fas fa-image"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }, 300); // Esperar 300ms después de que el usuario deje de escribir
    });
}

// Función para actualizar los contadores de estado
function actualizarContadores(pedidos) {
    // Inicializar contadores con los estados correctos
    const contadores = {
        'Pendiente': 0,
        'En Proceso': 0,
        'Enviado': 0,
        'Entregado': 0,
        'Cancelado': 0
    };
    
    // Contar pedidos por estado
    pedidos.forEach(pedido => {
        if (pedido.estado in contadores) {
            contadores[pedido.estado]++;
        }
    });
    
    // Actualizar los elementos en el DOM
    document.getElementById('pendienteCount').textContent = contadores['Pendiente'];
    document.getElementById('procesoCount').textContent = contadores['En Proceso'];
    document.getElementById('enviadoCount').textContent = contadores['Enviado'];
    document.getElementById('entregadoCount').textContent = contadores['Entregado'];
    document.getElementById('canceladoCount').textContent = contadores['Cancelado'];
    
    // Actualizar las stat-cards con los mismos contadores
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const estado = card.getAttribute('data-status');
        const countElement = card.querySelector('.stat-info p');
        if (countElement && estado in contadores) {
            countElement.textContent = contadores[estado];
        }
    });
}