// Configuración de la API
const API_URL = 'https://reciclothes.onrender.com/api';

// Variables globales para los gráficos
let salesChart, productsChart, customersChart, categoryChart;
let conversionChart, satisfactionChart, roiChart;

// Inicialización del Dashboard
async function initializeDashboard() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    await Promise.all([
        loadKPIs(),
        initializeCharts(),
        loadRecentActivity(),
        loadSystemAlerts(),
        loadMetrics()
    ]);

    setupEventListeners();
}

// Actualizar fecha y hora
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('currentDateTime').textContent = 
        now.toLocaleDateString('es-ES', options);
}

// Cargar KPIs
async function loadKPIs() {
    try {
        const response = await fetch(`${API_URL}/dashboard/kpis`);
        const data = await response.json();

        // Actualizar KPIs con animación
        animateValue('totalSales', 0, data.totalSales, 2000);
        animateValue('newOrders', 0, data.newOrders, 2000);
        animateValue('activeCustomers', 0, data.activeCustomers, 2000);
        animateValue('totalStock', 0, data.totalStock, 2000);

        // Actualizar tendencias
        updateTrends(data.trends);
    } catch (error) {
        console.error('Error loading KPIs:', error);
        showNotification('Error al cargar KPIs', 'error');
    }
}

// Inicializar gráficos
async function initializeCharts() {
    try {
        const [salesData, productsData, customersData, categoryData] = await Promise.all([
            fetch(`${API_URL}/dashboard/sales`).then(r => r.json()),
            fetch(`${API_URL}/dashboard/top-products`).then(r => r.json()),
            fetch(`${API_URL}/dashboard/customers`).then(r => r.json()),
            fetch(`${API_URL}/dashboard/categories`).then(r => r.json())
        ]);

        // Gráfico de Ventas vs Objetivos
        const salesCtx = document.getElementById('salesChart').getContext('2d');
        salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'Ventas Reales',
                    data: salesData.sales,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Objetivos',
                    data: salesData.targets,
                    borderColor: '#4CAF50',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#e0e0e0',
                        borderWidth: 1,
                        padding: 15,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [2, 2]
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        // Gráfico de Productos Más Vendidos
        const productsCtx = document.getElementById('topProductsChart').getContext('2d');
        productsChart = new Chart(productsCtx, {
            type: 'bar',
            data: {
                labels: productsData.labels,
                datasets: [{
                    label: 'Unidades Vendidas',
                    data: productsData.values,
                    backgroundColor: productsData.values.map((_, index) => 
                        `hsl(${index * (360 / productsData.values.length)}, 70%, 60%)`
                    ),
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#e0e0e0',
                        borderWidth: 1,
                        padding: 15
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Gráfico de Distribución de Clientes
        const customersCtx = document.getElementById('customerDistributionChart').getContext('2d');
        customersChart = new Chart(customersCtx, {
            type: 'doughnut',
            data: {
                labels: customersData.labels,
                datasets: [{
                    data: customersData.values,
                    backgroundColor: ['#FFC107', '#2196F3', '#4CAF50'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                cutout: '70%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });

        // Gráfico de Rendimiento de Categorías
        const categoryCtx = document.getElementById('categoryPerformanceChart').getContext('2d');
        categoryChart = new Chart(categoryCtx, {
            type: 'radar',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    label: 'Ventas',
                    data: categoryData.values,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#2196F3'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Actualizar gráficos cada 5 minutos
        setInterval(updateCharts, 300000);

    } catch (error) {
        console.error('Error initializing charts:', error);
        showNotification('Error al cargar los gráficos', 'error');
    }
}

// Actualizar período de los gráficos
async function updateChartPeriod(period) {
    try {
        showLoader();
        const response = await fetch(`${API_URL}/dashboard/sales?period=${period}`);
        const data = await response.json();

        salesChart.data.labels = data.labels;
        salesChart.data.datasets[0].data = data.sales;
        salesChart.data.datasets[1].data = data.targets;
        salesChart.update();

        hideLoader();
    } catch (error) {
        console.error('Error updating chart period:', error);
        showNotification('Error al actualizar el período', 'error');
        hideLoader();
    }
}

// Actualizar datos de los gráficos
async function updateCharts() {
    try {
        const [salesData, productsData, customersData, categoryData] = await Promise.all([
            fetch(`${API_URL}/dashboard/sales`).then(r => r.json()),
            fetch(`${API_URL}/dashboard/top-products`).then(r => r.json()),
            fetch(`${API_URL}/dashboard/customers`).then(r => r.json()),
            fetch(`${API_URL}/dashboard/categories`).then(r => r.json())
        ]);

        // Actualizar cada gráfico con nuevos datos
        salesChart.data.datasets[0].data = salesData.sales;
        salesChart.data.datasets[1].data = salesData.targets;
        salesChart.update();

        productsChart.data.labels = productsData.labels;
        productsChart.data.datasets[0].data = productsData.values;
        productsChart.update();

        customersChart.data.datasets[0].data = customersData.values;
        customersChart.update();

        categoryChart.data.datasets[0].data = categoryData.values;
        categoryChart.update();

    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Cargar actividad reciente
async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_URL}/dashboard/activity`);
        const activities = await response.json();
        
        const activityList = document.getElementById('activityList');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${getActivityColor(activity.type)}">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.description}</p>
                    <small>${formatTimeAgo(activity.timestamp)}</small>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

// Cargar alertas del sistema
async function loadSystemAlerts() {
    try {
        const response = await fetch(`${API_URL}/dashboard/alerts`);
        const alerts = await response.json();
        
        const alertsList = document.getElementById('alertsList');
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item" data-priority="${alert.priority}">
                <div class="alert-icon" style="background: ${getAlertColor(alert.priority)}">
                    <i class="fas ${getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-details">
                    <p>${alert.message}</p>
                    <small>${formatTimeAgo(alert.timestamp)}</small>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Inicializar gráficos de métricas
function initializeMetricCharts() {
    // Gráfico de Conversión
    const conversionCtx = document.getElementById('conversionChart').getContext('2d');
    new Chart(conversionCtx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Tasa de Conversión',
                data: [2.5, 2.8, 3.2, 2.9, 3.5, 3.8, 3.1],
                borderColor: '#2196F3',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Otros gráficos de métricas...
}

// Funciones auxiliares
function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const startTimestamp = performance.now();
    const isPrice = element.textContent.includes('$');

    const updateValue = (currentTimestamp) => {
        const elapsed = currentTimestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);

        const value = Math.floor(start + (end - start) * progress);
        element.textContent = isPrice ? `$${value.toLocaleString()}` : value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    };

    requestAnimationFrame(updateValue);
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        año: 31536000,
        mes: 2592000,
        semana: 604800,
        día: 86400,
        hora: 3600,
        minuto: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `Hace ${interval} ${unit}${interval > 1 ? 's' : ''}`;
        }
    }

    return 'Hace un momento';
}

// Generar reporte
async function generateReport() {
    try {
        showLoader('Generando reporte...');
        
        const response = await fetch(`${API_URL}/dashboard/report`);
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        hideLoader();
        showNotification('Reporte generado exitosamente', 'success');
    } catch (error) {
        console.error('Error generating report:', error);
        hideLoader();
        showNotification('Error al generar el reporte', 'error');
    }
}

// Notificaciones
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

// Loader
function showLoader(message = 'Cargando...') {
    Swal.fire({
        title: message,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function hideLoader() {
    Swal.close();
}

// Event Listeners
function setupEventListeners() {
    // Cambiar período de gráficos
    document.querySelectorAll('.chart-period').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-period').forEach(btn => 
                btn.classList.remove('active'));
            e.target.classList.add('active');
            updateChartPeriod(e.target.textContent.toLowerCase());
        });
    });

    // Cerrar sesión
    document.getElementById('logout').addEventListener('click', handleLogout);
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('content').style.display !== 'none') {
        initializeDashboard();
    }
}); 