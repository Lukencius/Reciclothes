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
});

