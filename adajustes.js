// Configuración de la API
const API_URL = 'https://reciclothes.onrender.com/api';

// Estado global
let currentSettings = {};
let hasUnsavedChanges = false;

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupEventListeners();
    setupFormValidation();
    checkForUnsavedChanges();
});

// Configurar event listeners
function setupEventListeners() {
    // Navegación entre secciones
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            switchSection(e.target.closest('.nav-btn').dataset.section);
        });
    });

    // Cambio de logo
    document.querySelector('.upload-btn').addEventListener('click', handleLogoUpload);

    // Guardar cambios
    document.querySelector('.save-all-btn').addEventListener('click', saveAllSettings);

    // Cambio de contraseña
    document.querySelector('.update-password-btn').addEventListener('click', updatePassword);

    // Verificación en dos pasos
    document.getElementById('twoFactorAuth').addEventListener('change', toggleTwoFactorAuth);

    // Detectar cambios en formularios
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('change', () => {
            hasUnsavedChanges = true;
            updateSaveButton();
        });
    });
}

// Cargar datos iniciales
async function loadInitialData() {
    try {
        showLoader();
        
        const [companyData, securityData, activeSessions] = await Promise.all([
            fetch(`${API_URL}/settings/company`).then(r => r.json()),
            fetch(`${API_URL}/settings/security`).then(r => r.json()),
            fetch(`${API_URL}/settings/sessions`).then(r => r.json())
        ]);

        // Cargar datos de la empresa
        populateCompanyData(companyData);
        
        // Cargar configuración de seguridad
        populateSecurityData(securityData);
        
        // Cargar sesiones activas
        renderActiveSessions(activeSessions);

        hideLoader();
    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Error al cargar la configuración', 'error');
        hideLoader();
    }
}

// Poblar datos de la empresa
function populateCompanyData(data) {
    document.getElementById('companyName').value = data.name || '';
    document.getElementById('companySlogan').value = data.slogan || '';
    document.getElementById('companyDescription').value = data.description || '';
    document.getElementById('contactEmail').value = data.email || '';
    document.getElementById('contactPhone').value = data.phone || '';
    document.getElementById('contactAddress').value = data.address || '';
    document.getElementById('businessHours').value = data.businessHours || '';
    
    // Redes sociales
    document.getElementById('facebookUrl').value = data.socialMedia?.facebook || '';
    document.getElementById('instagramUrl').value = data.socialMedia?.instagram || '';
    document.getElementById('twitterUrl').value = data.socialMedia?.twitter || '';
    document.getElementById('linkedinUrl').value = data.socialMedia?.linkedin || '';

    // Logo
    if (data.logo) {
        document.getElementById('companyLogo').src = data.logo;
    }
}

// Poblar datos de seguridad
function populateSecurityData(data) {
    document.getElementById('twoFactorAuth').checked = data.twoFactorEnabled || false;
}

// Renderizar sesiones activas
function renderActiveSessions(sessions) {
    const container = document.getElementById('activeSessions');
    container.innerHTML = '';

    sessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.className = 'session-item';
        sessionElement.innerHTML = `
            <div class="session-info">
                <div class="session-device">
                    <i class="fas ${getDeviceIcon(session.deviceType)}"></i>
                </div>
                <div class="session-details">
                    <strong>${session.deviceName}</strong>
                    <span>${session.location} · ${formatDate(session.lastActive)}</span>
                </div>
            </div>
            <button class="end-session-btn" onclick="endSession('${session.id}')">
                Terminar Sesión
            </button>
        `;
        container.appendChild(sessionElement);
    });
}

// Cambiar entre secciones
function switchSection(sectionId) {
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    // Mostrar sección seleccionada
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
}

// Manejar cambio de logo
async function handleLogoUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('logo', file);

            showLoader();
            const response = await fetch(`${API_URL}/settings/logo`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error al subir el logo');

            const data = await response.json();
            document.getElementById('companyLogo').src = data.logoUrl;
            showNotification('Logo actualizado correctamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al actualizar el logo', 'error');
        } finally {
            hideLoader();
        }
    };

    input.click();
}

// Actualizar contraseña
async function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Por favor, completa todos los campos', 'warning');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        showLoader();
        const response = await fetch(`${API_URL}/settings/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (!response.ok) throw new Error('Error al actualizar la contraseña');

        showNotification('Contraseña actualizada correctamente', 'success');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al actualizar la contraseña', 'error');
    } finally {
        hideLoader();
    }
}

// Activar/desactivar verificación en dos pasos
async function toggleTwoFactorAuth(e) {
    const isEnabled = e.target.checked;

    try {
        showLoader();
        const response = await fetch(`${API_URL}/settings/2fa`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ enabled: isEnabled })
        });

        if (!response.ok) throw new Error('Error al actualizar la configuración');

        showNotification(
            `Verificación en dos pasos ${isEnabled ? 'activada' : 'desactivada'}`,
            'success'
        );
    } catch (error) {
        console.error('Error:', error);
        e.target.checked = !isEnabled; // Revertir cambio
        showNotification('Error al actualizar la configuración', 'error');
    } finally {
        hideLoader();
    }
}

// Terminar sesión específica
async function endSession(sessionId) {
    try {
        showLoader();
        const response = await fetch(`${API_URL}/settings/sessions/${sessionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al terminar la sesión');

        // Actualizar lista de sesiones
        const sessions = await fetch(`${API_URL}/settings/sessions`).then(r => r.json());
        renderActiveSessions(sessions);
        
        showNotification('Sesión terminada correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al terminar la sesión', 'error');
    } finally {
        hideLoader();
    }
}

// Guardar todos los cambios
async function saveAllSettings() {
    if (!hasUnsavedChanges) return;

    try {
        showLoader();
        const settingsData = {
            company: {
                name: document.getElementById('companyName').value,
                slogan: document.getElementById('companySlogan').value,
                description: document.getElementById('companyDescription').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                address: document.getElementById('contactAddress').value,
                businessHours: document.getElementById('businessHours').value,
                socialMedia: {
                    facebook: document.getElementById('facebookUrl').value,
                    instagram: document.getElementById('instagramUrl').value,
                    twitter: document.getElementById('twitterUrl').value,
                    linkedin: document.getElementById('linkedinUrl').value
                }
            }
        };

        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settingsData)
        });

        if (!response.ok) throw new Error('Error al guardar la configuración');

        hasUnsavedChanges = false;
        updateSaveButton();
        showNotification('Configuración guardada correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar la configuración', 'error');
    } finally {
        hideLoader();
    }
}

// Funciones auxiliares
function showLoader() {
    // Implementar loader
}

function hideLoader() {
    // Implementar loader
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

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getDeviceIcon(deviceType) {
    const icons = {
        desktop: 'fa-desktop',
        mobile: 'fa-mobile-alt',
        tablet: 'fa-tablet-alt',
        default: 'fa-question-circle'
    };
    return icons[deviceType] || icons.default;
}

function updateSaveButton() {
    const saveBtn = document.querySelector('.save-all-btn');
    saveBtn.disabled = !hasUnsavedChanges;
    saveBtn.style.opacity = hasUnsavedChanges ? '1' : '0.5';
}

// Verificar cambios no guardados antes de salir
function checkForUnsavedChanges() {
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
} 