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

async function loadOrders() {
    try {
        const response = await fetch('https://reciclothes.onrender.com/api/ordenes');
        if (!response.ok) throw new Error('Error al cargar las órdenes');
        
        const ordenes = await response.json();
        currentOrders = ordenes;
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

function updateOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = currentOrders.slice(startIndex, endIndex);

    ordersToShow.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.Id_Orden}</td>
            <td>${order.cliente}</td>
            <td>${order.email}</td>
            <td>${order.telefono}</td>
            <td>${order.products}</td>
            <td>${new Date(order.order_date).toLocaleDateString('es-CL')}</td>
            <td>$${parseFloat(order.total_amount).toLocaleString('es-CL')}</td>
            <td>
                <span class="status-badge status-${order.estado.toLowerCase()}">
                    ${order.estado}
                </span>
            </td>
            <td>
                <button onclick="showOrderDetails(${order.Id_Orden})" class="action-btn view-btn">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="printOrder(${order.Id_Orden})" class="action-btn print-btn">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(currentOrders.length / ordersPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('pagination-btn');
        button.onclick = () => {
            currentPage = i;
            updateOrdersTable();
        };
        paginationContainer.appendChild(button);
    }
}

function setupEventListeners() {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updateOrdersTable();
        }
    };

    nextButton.onclick = () => {
        const totalPages = Math.ceil(currentOrders.length / ordersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateOrdersTable();
        }
    };
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