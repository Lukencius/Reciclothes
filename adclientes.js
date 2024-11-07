// Configuración de la API
const API_URL = 'https://reciclothes.onrender.com/api';

// Estado global
let currentClients = [];
let currentPage = 1;
const clientsPerPage = 10;

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupEventListeners();
    initializeCharts();
});

// Configurar event listeners
function setupEventListeners() {
    // Búsqueda
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', (e) => {
        searchClients(e.target.value);
    });

    // Filtros
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            filterClients(e.target.dataset.filter);
        });
    });

    // Exportar datos
    document.querySelector('.export-btn').addEventListener('click', exportClientsData);

    // Paginación
    document.querySelector('.prev-page').addEventListener('click', () => changePage(-1));
    document.querySelector('.next-page').addEventListener('click', () => changePage(1));
}

// Cargar datos iniciales
async function loadInitialData() {
    try {
        await Promise.all([
            loadClients(),
            loadClientStats(),
            updateCharts()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Error al cargar los datos', 'error');
    }
}

// Cargar clientes
async function loadClients() {
    try {
        const response = await fetch(`${API_URL}/clients`);
        if (!response.ok) throw new Error('Error al cargar clientes');
        
        currentClients = await response.json();
        renderClients();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar los clientes', 'error');
    }
}

// Cargar estadísticas
async function loadClientStats() {
    try {
        const response = await fetch(`${API_URL}/clients/stats`);
        const stats = await response.json();
        
        document.getElementById('totalClients').textContent = stats.total;
        document.getElementById('newClients').textContent = stats.new;
        document.getElementById('vipClients').textContent = stats.vip;
        document.getElementById('retentionRate').textContent = `${stats.retention}%`;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Renderizar clientes
function renderClients(clients = currentClients) {
    const tableBody = document.getElementById('clientsTableBody');
    const start = (currentPage - 1) * clientsPerPage;
    const paginatedClients = clients.slice(start, start + clientsPerPage);

    tableBody.innerHTML = '';

    if (paginatedClients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="no-results">
                    <i class="fas fa-users-slash"></i>
                    <p>No se encontraron clientes</p>
                </td>
            </tr>
        `;
        return;
    }

    paginatedClients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${client.id}</td>
            <td>
                <div class="client-name">
                    <img src="${client.image || 'default-avatar.png'}" alt="Avatar">
                    ${client.name}
                </div>
            </td>
            <td>${client.email}</td>
            <td>${client.phone || '-'}</td>
            <td>${formatDate(client.registerDate)}</td>
            <td>${client.purchases}</td>
            <td>$${client.totalValue.toFixed(2)}</td>
            <td>
                <span class="client-status status-${client.status.toLowerCase()}">
                    ${getStatusText(client.status)}
                </span>
            </td>
            <td class="actions">
                <button onclick="viewClientDetails(${client.id})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editClient(${client.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteClient(${client.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination(clients.length);
}

// Inicializar gráficos
function initializeCharts() {
    // Gráfico de crecimiento
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Nuevos Clientes',
                data: [],
                borderColor: '#2196F3',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Gráfico de edad
    const ageCtx = document.getElementById('ageChart').getContext('2d');
    new Chart(ageCtx, {
        type: 'doughnut',
        data: {
            labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#2196F3',
                    '#4CAF50',
                    '#FFC107',
                    '#9C27B0',
                    '#F44336'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Gráfico de valor
    const valueCtx = document.getElementById('valueChart').getContext('2d');
    new Chart(valueCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Valor del Cliente',
                data: [],
                backgroundColor: '#4CAF50'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Actualizar gráficos
async function updateCharts() {
    try {
        const response = await fetch(`${API_URL}/clients/analytics`);
        const data = await response.json();
        
        // Actualizar cada gráfico con los nuevos datos
        updateGrowthChart(data.growth);
        updateAgeChart(data.ageDistribution);
        updateValueChart(data.customerValue);
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Funciones de filtrado y búsqueda
function searchClients(query) {
    const filtered = currentClients.filter(client => 
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.email.toLowerCase().includes(query.toLowerCase())
    );
    renderClients(filtered);
}

function filterClients(filter) {
    let filtered = currentClients;
    
    switch(filter) {
        case 'active':
            filtered = currentClients.filter(client => client.status === 'ACTIVE');
            break;
        case 'vip':
            filtered = currentClients.filter(client => client.status === 'VIP');
            break;
        case 'inactive':
            filtered = currentClients.filter(client => client.status === 'INACTIVE');
            break;
    }
    
    renderClients(filtered);
}

// Exportar datos
function exportClientsData() {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "ID,Nombre,Email,Teléfono,Fecha Registro,Compras,Valor Total,Estado\n" +
        currentClients.map(client => 
            `${client.id},"${client.name}","${client.email}","${client.phone}","${client.registerDate}",${client.purchases},${client.totalValue},${client.status}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clientes_reciclothes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Funciones auxiliares
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getStatusText(status) {
    const statusMap = {
        ACTIVE: 'Activo',
        VIP: 'VIP',
        INACTIVE: 'Inactivo'
    };
    return statusMap[status] || status;
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

// Gestión de clientes
async function viewClientDetails(id) {
    try {
        const response = await fetch(`${API_URL}/clients/${id}`);
        const client = await response.json();
        
        document.getElementById('clientImage').src = client.image || 'default-avatar.png';
        document.getElementById('clientName').textContent = client.name;
        document.getElementById('clientStatus').textContent = getStatusText(client.status);
        document.getElementById('clientEmail').value = client.email;
        document.getElementById('clientPhone').value = client.phone || '';
        document.getElementById('clientAddress').value = client.address || '';
        
        // Cargar historial de compras
        const purchaseHistory = document.getElementById('purchaseHistory');
        purchaseHistory.innerHTML = client.purchases.map(purchase => `
            <div class="purchase-item">
                <div class="purchase-date">${formatDate(purchase.date)}</div>
                <div class="purchase-amount">$${purchase.amount.toFixed(2)}</div>
            </div>
        `).join('');
        
        document.getElementById('clientModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar los detalles del cliente', 'error');
    }
}

// Implementar las demás funciones según sea necesario... 