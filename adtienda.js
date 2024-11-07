// Configuración de la API
const API_URL = 'https://reciclothes.onrender.com/api';

// Estado global
let categories = [];
let banners = [];
let storeSettings = {};

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupEventListeners();
    updateStats();
});

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
    document.getElementById('bannerForm').addEventListener('submit', handleBannerSubmit);
}

// Cargar datos iniciales
async function loadInitialData() {
    try {
        await Promise.all([
            loadCategories(),
            loadBanners(),
            loadStoreSettings()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Error al cargar los datos', 'error');
    }
}

// Actualizar estadísticas
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/store/stats`);
        const stats = await response.json();
        
        document.getElementById('visitorCount').textContent = stats.visitors;
        document.getElementById('conversionRate').textContent = `${stats.conversionRate}%`;
        document.getElementById('avgCart').textContent = `$${stats.averageCart.toFixed(2)}`;
        document.getElementById('rating').textContent = stats.rating.toFixed(1);
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Gestión de Categorías
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        categories = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Error al cargar las categorías', 'error');
    }
}

function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';

    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="actions">
                <button onclick="editCategory(${category.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteCategory(${category.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <i class="fas ${category.icon} fa-2x"></i>
            <h3>${category.name}</h3>
            <p>${category.description || 'Sin descripción'}</p>
            <span class="product-count">${category.productCount} productos</span>
        `;
        grid.appendChild(card);
    });
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        icon: document.getElementById('categoryIcon').value
    };

    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) throw new Error('Error al crear la categoría');

        await loadCategories();
        closeCategoryModal();
        showNotification('Categoría creada exitosamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al crear la categoría', 'error');
    }
}

// Gestión de Banners
async function loadBanners() {
    try {
        const response = await fetch(`${API_URL}/banners`);
        banners = await response.json();
        renderBanners();
    } catch (error) {
        console.error('Error loading banners:', error);
        showNotification('Error al cargar los banners', 'error');
    }
}

function renderBanners() {
    const grid = document.getElementById('bannersGrid');
    grid.innerHTML = '';

    banners.forEach(banner => {
        const card = document.createElement('div');
        card.className = 'banner-card';
        card.innerHTML = `
            <img src="${banner.imageUrl}" alt="${banner.title}">
            <div class="banner-info">
                <h3>${banner.title}</h3>
                <div class="actions">
                    <button onclick="editBanner(${banner.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteBanner(${banner.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function handleBannerSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('bannerTitle').value);
    formData.append('image', document.getElementById('bannerImage').files[0]);
    formData.append('url', document.getElementById('bannerUrl').value);

    try {
        const response = await fetch(`${API_URL}/banners`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Error al crear el banner');

        await loadBanners();
        closeBannerModal();
        showNotification('Banner creado exitosamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al crear el banner', 'error');
    }
}

// Configuración de la Tienda
async function loadStoreSettings() {
    try {
        const response = await fetch(`${API_URL}/store/settings`);
        storeSettings = await response.json();
        populateStoreSettings();
    } catch (error) {
        console.error('Error loading store settings:', error);
        showNotification('Error al cargar la configuración', 'error');
    }
}

function populateStoreSettings() {
    document.getElementById('storeName').value = storeSettings.name || '';
    document.getElementById('storeDescription').value = storeSettings.description || '';
    document.getElementById('storeEmail').value = storeSettings.email || '';
    document.getElementById('shippingCost').value = storeSettings.shippingCost || '';
    document.getElementById('freeShippingThreshold').value = storeSettings.freeShippingThreshold || '';
    document.getElementById('facebookUrl').value = storeSettings.socialMedia?.facebook || '';
    document.getElementById('instagramUrl').value = storeSettings.socialMedia?.instagram || '';
    document.getElementById('twitterUrl').value = storeSettings.socialMedia?.twitter || '';
}

async function saveStoreSettings() {
    const settings = {
        name: document.getElementById('storeName').value,
        description: document.getElementById('storeDescription').value,
        email: document.getElementById('storeEmail').value,
        shippingCost: parseFloat(document.getElementById('shippingCost').value),
        freeShippingThreshold: parseFloat(document.getElementById('freeShippingThreshold').value),
        socialMedia: {
            facebook: document.getElementById('facebookUrl').value,
            instagram: document.getElementById('instagramUrl').value,
            twitter: document.getElementById('twitterUrl').value
        }
    };

    try {
        const response = await fetch(`${API_URL}/store/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });

        if (!response.ok) throw new Error('Error al guardar la configuración');

        showNotification('Configuración guardada exitosamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar la configuración', 'error');
    }
}

// Funciones auxiliares
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

function openCategoryModal() {
    document.getElementById('categoryModal').style.display = 'block';
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    document.getElementById('categoryForm').reset();
}

function openBannerModal() {
    document.getElementById('bannerModal').style.display = 'block';
}

function closeBannerModal() {
    document.getElementById('bannerModal').style.display = 'none';
    document.getElementById('bannerForm').reset();
}

// Funciones de edición y eliminación
async function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const { value: formValues } = await Swal.fire({
        title: 'Editar Categoría',
        html: `
            <input id="swal-name" class="swal2-input" value="${category.name}" placeholder="Nombre">
            <input id="swal-icon" class="swal2-input" value="${category.icon}" placeholder="Icono">
            <textarea id="swal-description" class="swal2-textarea" placeholder="Descripción">${category.description || ''}</textarea>
        `,
        focusConfirm: false,
        preConfirm: () => ({
            name: document.getElementById('swal-name').value,
            icon: document.getElementById('swal-icon').value,
            description: document.getElementById('swal-description').value
        })
    });

    if (formValues) {
        try {
            const response = await fetch(`${API_URL}/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formValues)
            });

            if (!response.ok) throw new Error('Error al actualizar la categoría');

            await loadCategories();
            showNotification('Categoría actualizada exitosamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al actualizar la categoría', 'error');
        }
    }
}

async function deleteCategory(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar la categoría');

            await loadCategories();
            showNotification('Categoría eliminada exitosamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al eliminar la categoría', 'error');
        }
    }
}

// Funciones similares para banners
async function editBanner(id) {
    // Implementación similar a editCategory
}

async function deleteBanner(id) {
    // Implementación similar a deleteCategory
} 