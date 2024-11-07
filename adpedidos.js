 // Configuración de la API
const API_URL = 'https://reciclothes.onrender.com/api';

// Estado global
let currentOrders = [];
let currentPage = 1;
const ordersPerPage = 10;

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            filterOrders(e.target.dataset.filter);
        });
    });

    // Búsqueda
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', (e) => {
        searchOrders(e.target.value);
    });

    // Paginación
    document.querySelector('.prev-page').addEventListener('click', () => changePage(-1));
    document.querySelector('.next-page').addEventListener('click', () => changePage(1));

    // Modal
    document.querySelector('.close-modal').addEventListener('click', closeOrderModal);
}

// Cargar pedidos
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/Pedidos`);
        if (!response.ok) throw new Error('Error al cargar pedidos');
        
        currentOrders = await response.json();
        updateDashboardStats();
        renderOrders();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar los pedidos', 'error');
    }
}

// Actualizar estadísticas del dashboard
function updateDashboardStats() {
    const stats = {
        pending: currentOrders.filter(order => order.status === 'pending').length,
        processing: currentOrders.filter(order => order.status === 'processing').length,
        shipping: currentOrders.filter(order => order.status === 'shipping').length,
        completed: currentOrders.filter(order => order.status === 'completed').length
    };

    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('processingCount').textContent = stats.processing;
    document.getElementById('shippingCount').textContent = stats.shipping;
    document.getElementById('completedCount').textContent = stats.completed;
}

// Renderizar pedidos
function renderOrders(orders = currentOrders) {
    const tableBody = document.getElementById('ordersTableBody');
    const start = (currentPage - 1) * ordersPerPage;
    const paginatedOrders = orders.slice(start, start + ordersPerPage);

    tableBody.innerHTML = '';

    if (paginatedOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-results">
                    <i class="fas fa-box-open"></i>
                    <p>No se encontraron pedidos</p>
                </td>
            </tr>
        `;
        return;
    }

    paginatedOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id_pedido}</td>
            <td>${order.nombre_cliente}</td>
            <td>${order.productos.length} productos</td>
            <td>${formatDate(order.fecha)}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
                <span class="status-badge status-${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </td>
            <td class="actions">
                <button onclick="viewOrderDetails(${order.id_pedido})" class="view-btn" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="updateOrderStatus(${order.id_pedido})" class="edit-btn" title="Actualizar estado">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="printOrder(${order.id_pedido})" class="print-btn" title="Imprimir">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination(orders.length);
}

// Filtrar pedidos
function filterOrders(status) {
    const filtered = status === 'all' 
        ? currentOrders 
        : currentOrders.filter(order => order.status === status);
    
    currentPage = 1;
    renderOrders(filtered);
}

// Buscar pedidos
function searchOrders(query) {
    query = query.toLowerCase().trim();
    
    const filtered = currentOrders.filter(order => 
        order.id_pedido.toString().includes(query) ||
        order.nombre_cliente.toLowerCase().includes(query) ||
        getStatusText(order.status).toLowerCase().includes(query)
    );

    currentPage = 1;
    renderOrders(filtered);
}

// Ver detalles del pedido
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_URL}/Pedidos/${orderId}`);
        if (!response.ok) throw new Error('Error al cargar detalles del pedido');
        
        const order = await response.json();
        
        document.getElementById('orderIdDetail').textContent = order.id_pedido;
        document.getElementById('customerName').textContent = order.nombre_cliente;
        document.getElementById('customerEmail').textContent = order.email;
        document.getElementById('customerPhone').textContent = order.telefono;
        document.getElementById('shippingAddress').textContent = order.direccion;
        document.getElementById('shippingCity').textContent = order.ciudad;
        document.getElementById('shippingZip').textContent = order.codigo_postal;

        renderOrderProducts(order.productos);
        updateOrderSummary(order);

        document.getElementById('orderDetailsModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar los detalles del pedido', 'error');
    }
}

// Actualizar estado del pedido
async function updateOrderStatus(orderId) {
    try {
        const { value: newStatus } = await Swal.fire({
            title: 'Actualizar Estado',
            input: 'select',
            inputOptions: {
                pending: 'Pendiente',
                processing: 'En Proceso',
                shipping: 'En Envío',
                completed: 'Completado'
            },
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Debes seleccionar un estado';
                }
            }
        });

        if (newStatus) {
            const response = await fetch(`${API_URL}/Pedidos/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Error al actualizar el estado');

            await loadOrders();
            showNotification('Estado actualizado correctamente', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al actualizar el estado', 'error');
    }
}

// Imprimir pedido
function printOrder(orderId) {
    const orderDetails = currentOrders.find(order => order.id_pedido === orderId);
    if (!orderDetails) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Pedido #${orderId}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .details { margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                    .total { margin-top: 20px; text-align: right; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>ReciClothes - Pedido #${orderId}</h1>
                    <p>Fecha: ${formatDate(orderDetails.fecha)}</p>
                </div>
                <!-- Aquí va el contenido del pedido -->
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Funciones auxiliares
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        pending: 'Pendiente',
        processing: 'En Proceso',
        shipping: 'En Envío',
        completed: 'Completado'
    };
    return statusMap[status] || status;
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ordersPerPage);
    document.querySelector('.page-info').textContent = `Página ${currentPage} de ${totalPages}`;
    
    document.querySelector('.prev-page').disabled = currentPage === 1;
    document.querySelector('.next-page').disabled = currentPage === totalPages;
}

function changePage(delta) {
    const newPage = currentPage + delta;
    const totalPages = Math.ceil(currentOrders.length / ordersPerPage);
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderOrders();
    }
}

function showNotification(message, type = 'success') {
    Swal.fire({
        text: message,
        icon: type,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
}

// Cerrar modal
function closeOrderModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

// Renderizar productos del pedido
function renderOrderProducts(products) {
    const tbody = document.getElementById('orderProductsBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.nombre}</td>
            <td>${product.cantidad}</td>
            <td>$${product.precio.toFixed(2)}</td>
            <td>$${(product.precio * product.cantidad).toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Actualizar resumen del pedido
function updateOrderSummary(order) {
    const subtotal = order.productos.reduce((sum, product) => 
        sum + (product.precio * product.cantidad), 0);
    
    document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('orderShipping').textContent = `$${order.costo_envio.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${order.total.toFixed(2)}`;
}