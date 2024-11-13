document.addEventListener('DOMContentLoaded', function() {
    // Función para el desplazamiento suave
    function smoothScroll(target, duration) {
        var targetElement = document.querySelector(target);
        var targetPosition = targetElement.getBoundingClientRect().top;
        var startPosition = window.pageYOffset;
        var startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            var timeElapsed = currentTime - startTime;
            var run = ease(timeElapsed, startPosition, targetPosition, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // Aplicar desplazamiento suave a los enlaces de navegación
    var navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var target = this.getAttribute('href');
            smoothScroll(target, 1000);
        });
    });

    // Slider de ofertas simple
    var ofertaSlider = document.querySelector('.oferta-slider');
    var ofertas = [
        { imagen: 'ruta/a/oferta1.jpg', titulo: 'Oferta 1', descripcion: 'Descripción de la oferta 1' },
        { imagen: 'ruta/a/oferta2.jpg', titulo: 'Oferta 2', descripcion: 'Descripción de la oferta 2' },
        { imagen: 'ruta/a/oferta3.jpg', titulo: 'Oferta 3', descripcion: 'Descripción de la oferta 3' }
    ];

    function crearSlider() {
        ofertas.forEach(function(oferta) {
            var ofertaElement = document.createElement('div');
            ofertaElement.classList.add('oferta-item');
            ofertaElement.innerHTML = `
                <img src="${oferta.imagen}" alt="${oferta.titulo}">
                <h3>${oferta.titulo}</h3>
                <p>${oferta.descripcion}</p>
            `;
            ofertaSlider.appendChild(ofertaElement);
        });
    }

    crearSlider();

    // Validación simple del formulario de newsletter
    var newsletterForm = document.querySelector('footer form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var emailInput = this.querySelector('input[type="email"]');
        if (emailInput.value.trim() === '') {
            alert('Por favor, introduce tu dirección de correo electrónico.');
        } else {
            alert('¡Gracias por suscribirte a nuestro newsletter!');
            emailInput.value = '';
        }
    });

    // Función para buscar productos
    function searchProducts(query) {
        query = query.toLowerCase().trim();
        return productos.filter(producto => 
            producto.nombre.toLowerCase().includes(query) ||
            producto.descripcion.toLowerCase().includes(query) ||
            producto.categoria.toLowerCase().includes(query)
        );
    }

    // Función para crear el HTML de los resultados
    function createSearchResultHTML(producto) {
        return `
            <div class="search-result p-2 border-bottom hover-bg-light" style="cursor: pointer;" 
                 onclick="window.location.href='producto.html?id=${producto.id}'">
                <div class="d-flex align-items-center">
                    <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover;" class="me-2">
                    <div>
                        <div class="fw-bold">${producto.nombre}</div>
                        <div class="small text-muted">$${producto.precio}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Configurar el buscador en tiempo real
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let searchTimeout;

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        const query = this.value;
        
        // Si el campo de búsqueda está vacío, ocultar resultados
        if (!query) {
            searchResults.classList.add('d-none');
            return;
        }

        // Esperar 300ms después de que el usuario deje de escribir para buscar
        searchTimeout = setTimeout(() => {
            const results = searchProducts(query);
            
            if (results.length > 0) {
                searchResults.innerHTML = results
                    .slice(0, 5) // Limitar a 5 resultados
                    .map(createSearchResultHTML)
                    .join('');
                searchResults.classList.remove('d-none');
            } else {
                searchResults.innerHTML = '<div class="p-2 text-muted">No se encontraron productos</div>';
                searchResults.classList.remove('d-none');
            }
        }, 300);
    });

    // Cerrar resultados cuando se hace clic fuera
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('d-none');
        }
    });

    // Prevenir que el formulario se envíe
    searchInput.closest('form')?.addEventListener('submit', function(e) {
        e.preventDefault();
    });

    // Agregar estilos CSS para hover
    const style = document.createElement('style');
    style.textContent = `
        .hover-bg-light:hover {
            background-color: #f8f9fa;
        }
    `;
    document.head.appendChild(style);
});

