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
        const response = await fetch(`${API_URL}/ordenes`);
        if (!response.ok) throw new Error('Error al cargar las órdenes');
        
        const ordenes = await response.json();
        currentOrders = ordenes;
        currentPage = 1; // Resetear a la primera página
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
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = currentOrders.slice(startIndex, endIndex);

    if (ordersToShow.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" class="text-center">No hay órdenes para mostrar</td>';
        tableBody.appendChild(row);
    } else {
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
                    <button onclick="showPaymentProof('${order.imagen}')" class="action-btn proof-btn">
                        <i class="fas fa-receipt"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
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

function showPaymentProof(imageUrl) {
    if (imageUrl) { 
        Swal.fire({
            imageUrl: imageUrl,
            imageAlt: 'Comprobante de Pago',
            width: '90%',
            imageWidth: '100%',
            confirmButtonText: 'Cerrar',
            showCloseButton: true,
            customClass: {
                popup: 'swal-image-popup',
                image: 'swal-image-custom'
            },
            didOpen: (popup) => {
                // Agregar zoom con click
                const img = popup.querySelector('.swal-image-custom');
                if (img) {
                    img.style.cursor = 'zoom-in';
                    img.onclick = () => {
                        window.open(imageUrl, '_blank');
                    };
                }
            }
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró el comprobante de pago',
            confirmButtonText: 'Aceptar'
        });
    }
}
