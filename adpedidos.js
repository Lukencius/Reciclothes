// Configuración de la API
const API_URL = 'https://reciclothes.onrender.com/api';

// Estado global
let currentOrders = [];
let currentPage = 1;
const ordersPerPage = 10;

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', () => {
    verificarAdmin();
    loadOrders();
    setupEventListeners();
});

// Verificar si es admin
function verificarAdmin() {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = 'login.html';
    }
}

// Cargar órdenes
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/ordenes/admin`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar las órdenes');

        const data = await response.json();
        currentOrders = data.ordenes;
        updateOrdersTable();
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los pedidos'
        });
    }
}

// Actualizar tabla de órdenes
function updateOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = currentOrders.slice(startIndex, endIndex);

    ordersToShow.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orden_id}</td>
            <td>${order.nombre}</td>
            <td>${order.email}</td>
            <td>${order.telefono}</td>
            <td>${order.productos || 'No disponible'}</td>
            <td>${new Date(order.fecha_creacion).toLocaleDateString('es-CL')}</td>
            <td>$${order.total.toLocaleString('es-CL')}</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus('${order.orden_id}', this.value)">
                    <option value="Pendiente" ${order.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En Proceso" ${order.estado === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                    <option value="En Envío" ${order.estado === 'En Envío' ? 'selected' : ''}>En Envío</option>
                    <option value="Completado" ${order.estado === 'Completado' ? 'selected' : ''}>Completado</option>
                </select>
            </td>
            <td>
                <button onclick="showOrderDetails('${order.orden_id}')" class="action-btn view-btn">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="printOrder('${order.orden_id}')" class="action-btn print-btn">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}

// Actualizar estadísticas
function updateStats() {
    const stats = {
        pending: currentOrders.filter(order => order.estado === 'Pendiente').length,
        processing: currentOrders.filter(order => order.estado === 'En Proceso').length,
        shipping: currentOrders.filter(order => order.estado === 'En Envío').length,
        completed: currentOrders.filter(order => order.estado === 'Completado').length
    };

    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('processingCount').textContent = stats.processing;
    document.getElementById('shippingCount').textContent = stats.shipping;
    document.getElementById('completedCount').textContent = stats.completed;
}

// Actualizar estado de orden
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/ordenes/${orderId}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ estado: newStatus })
        });

        if (!response.ok) throw new Error('Error al actualizar el estado');

        const orderIndex = currentOrders.findIndex(order => order.orden_id === orderId);
        if (orderIndex !== -1) {
            currentOrders[orderIndex].estado = newStatus;
            updateStats();
        }

        Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el estado'
        });
    }
}

// Mostrar detalles de orden
async function showOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_URL}/ordenes/${orderId}/detalles`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar los detalles');

        const data = await response.json();
        const order = data.orden;

        document.getElementById('orderIdDetail').textContent = order.orden_id;
        document.getElementById('customerName').textContent = order.nombre;
        document.getElementById('customerEmail').textContent = order.email;
        document.getElementById('customerPhone').textContent = order.telefono;
        document.getElementById('shippingAddress').textContent = order.direccion;
        document.getElementById('orderTotal').textContent = `$${order.total.toLocaleString('es-CL')}`;

        // Mostrar productos
        const productsBody = document.getElementById('orderProductsBody');
        productsBody.innerHTML = order.detalles.map(item => `
            <tr>
                <td>${item.producto_nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precio_unitario.toLocaleString('es-CL')}</td>
                <td>$${(item.cantidad * item.precio_unitario).toLocaleString('es-CL')}</td>
            </tr>
        `).join('');

        const modal = document.getElementById('orderDetailsModal');
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los detalles del pedido'
        });
    }
}

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

    // Modal
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('orderDetailsModal').style.display = 'none';
    });

    // Cerrar sesión
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    });
}

// Filtrar órdenes
function filterOrders(filter) {
    if (filter === 'all') {
        loadOrders();
        return;
    }

    const statusMap = {
        'pending': 'Pendiente',
        'processing': 'En Proceso',
        'shipping': 'En Envío',
        'completed': 'Completado'
    };

    const filteredOrders = currentOrders.filter(order => order.estado === statusMap[filter]);
    currentOrders = filteredOrders;
    currentPage = 1;
    updateOrdersTable();
}

// Buscar órdenes
function searchOrders(query) {
    const searchQuery = query.toLowerCase();
    const filteredOrders = currentOrders.filter(order => 
        order.orden_id.toLowerCase().includes(searchQuery) ||
        order.nombre.toLowerCase().includes(searchQuery) ||
        order.email.toLowerCase().includes(searchQuery) ||
        order.estado.toLowerCase().includes(searchQuery)
    );
    
    currentOrders = filteredOrders;
    currentPage = 1;
    updateOrdersTable();
}

// Actualizar paginación
function updatePagination() {
    const totalPages = Math.ceil(currentOrders.length / ordersPerPage);
    document.querySelector('.page-info').textContent = `Página ${currentPage} de ${totalPages}`;
}