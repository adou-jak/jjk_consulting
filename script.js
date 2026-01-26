// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('#mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.querySelector('#backToTop');
    const sections = document.querySelectorAll('section');
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // Toggle menu mobile
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Fermer le menu mobile quand un lien est cliqué
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Changer le style de la navbar au scroll
    window.addEventListener('scroll', function() {
        updateNavbar();
        updateBackToTop();
        fadeInElements();
        updateActiveNavLink();
    });
    
    // Fonction pour mettre à jour le style de la navbar
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Fonction pour afficher/masquer le bouton "retour en haut"
    function updateBackToTop() {
        if (window.scrollY > 300) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    }
    
    // Fonction pour animer les éléments au scroll
    function fadeInElements() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('appear');
            }
        });
    }
    
    // Fonction pour mettre à jour le lien actif dans la navigation
    function updateActiveNavLink() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 200 && window.scrollY < sectionTop + sectionHeight - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Ajouter la classe fade-in aux éléments à animer
    document.querySelectorAll('.service-card, .target-item, .result-card, .team-member, .about-content > div').forEach(element => {
        element.classList.add('fade-in');
    });
    
    // Initialiser les animations et l'état de la navbar
    updateNavbar();
    updateBackToTop();
    fadeInElements();
    updateActiveNavLink();
    
    // Formulaire de contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer les valeurs du formulaire
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Ici, vous pourriez ajouter du code pour envoyer les données à un serveur
            // Pour l'instant, nous affichons simplement une alerte
            alert(`Merci ${name} pour votre message ! Nous vous contacterons bientôt à l'adresse ${email}.`);
            
            // Réinitialiser le formulaire
            contactForm.reset();
        });
    }
    
    // --- Modal de prise de rendez-vous (ouvrir depuis les boutons .btn-appointment) ---
    const appointmentModal = document.getElementById('appointmentModal');
    const appointmentForm = document.getElementById('appointmentForm');
    const btnAppointments = document.querySelectorAll('.btn-appointment');
    const closeModalBtn = document.querySelector('#appointmentModal .close-modal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const serviceSelect = document.getElementById('service');

    function openAppointmentModal(service) {
        if (!appointmentModal) return;
        // Préremplir le service si fourni
        if (service && serviceSelect) {
            // tenter de sélectionner la valeur correspondante
            for (let i = 0; i < serviceSelect.options.length; i++) {
                if (serviceSelect.options[i].value === service) {
                    serviceSelect.selectedIndex = i;
                    break;
                }
            }
        }
    appointmentModal.classList.add('show');
    appointmentModal.setAttribute('aria-hidden', 'false');
    // focus sur le premier champ
    const nameField = appointmentModal.querySelector('#appoint_name');
    if (nameField) nameField.focus();
    }

    function closeAppointmentModal() {
        if (!appointmentModal) return;
    appointmentModal.classList.remove('show');
    appointmentModal.setAttribute('aria-hidden', 'true');
    }

    // debug: nombre de boutons détectés et présence du modal
    console.log('btnAppointments count:', btnAppointments.length);
    console.log('appointmentModal present:', !!appointmentModal);

    // ouvrir modal depuis chaque bouton
    if (btnAppointments.length > 0) {
        btnAppointments.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const svc = btn.dataset.service || '';
                console.log('btn-appointment clicked, service=', svc);
                openAppointmentModal(svc);
            });
        });
    } else {
        // fallback: délégation d'événement si les boutons sont ajoutés dynamiquement
        document.addEventListener('click', (e) => {
            const btn = e.target.closest && e.target.closest('.btn-appointment');
            if (btn) {
                e.preventDefault();
                const svc = btn.dataset ? btn.dataset.service : '';
                console.log('delegated btn-appointment click, service=', svc);
                openAppointmentModal(svc);
            }
        });
    }

    // fermeture via la croix
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeAppointmentModal);
    }

    // fermeture en cliquant en dehors du contenu
    if (appointmentModal) {
        appointmentModal.addEventListener('click', (e) => {
            if (e.target === appointmentModal) closeAppointmentModal();
        });
    }

    // ESC pour fermer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && appointmentModal && appointmentModal.classList.contains('show')) {
            closeAppointmentModal();
        }
    });

    // Soumission du formulaire de rendez-vous -> ouvrir WhatsApp
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('appoint_name').value || '';
            const email = document.getElementById('appoint_email').value || '';
            const service = document.getElementById('service').value || '';
            const date = document.getElementById('appoint_date').value || '';
            const time = document.getElementById('appoint_time').value || '';

            // Message pré-rempli
            const message = `Bonjour, je souhaite prendre un rendez-vous.\nNom : ${name}\nEmail : ${email}\nService : ${service}\nDate : ${date} \nHeure : ${time}`;

            // Numéro WhatsApp fourni par l'utilisateur (format international sans espace)
            const phone = '2250574742526';
            const waUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}`;

            // Afficher confirmation puis rediriger vers WhatsApp
            if (confirmationMessage) confirmationMessage.style.display = 'block';
            window.open(waUrl, '_blank');

            appointmentForm.reset();
            setTimeout(() => {
                if (confirmationMessage) confirmationMessage.style.display = 'none';
                closeAppointmentModal();
            }, 1200);
        });
    }
    
    // Scroll fluide pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
});