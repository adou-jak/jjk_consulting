// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('#mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.querySelector('#backToTop');
    const sections = document.querySelectorAll('section');
    
    // Toggle menu mobile
    menuToggle.addEventListener('click', function() {
        const isActive = menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
    
    // Fermer le menu mobile quand un lien est cliqué
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
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
        document.querySelectorAll('.fade-in').forEach(element => {
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
    document.querySelectorAll('.service-card, .target-item, .result-card, .team-member, .about-content > div, .pillar-card, .value-card, .solution-card, .why-item, .why-banner-cta, .contact-info-card, .contact-form').forEach(element => {
        element.classList.add('fade-in');
    });
    
    // Initialiser les animations et l'état de la navbar
    updateNavbar();
    updateBackToTop();
    fadeInElements();
    updateActiveNavLink();
    
    // Formulaire de contact — Traitement Asynchrone Sécurisé
    const contactForm = document.getElementById('contactForm');
    const contactStatus = document.getElementById('contactStatus');
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            const honeypotInput = document.getElementById('_website_check');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';
            const honeypot = honeypotInput ? honeypotInput.value.trim() : '';

            // Validation de base côté client
            if (!contactForm.reportValidity() || !name || !email || !message) {
                if (contactStatus) {
                    contactStatus.className = 'contact-status error';
                    contactStatus.textContent = 'Veuillez renseigner les champs obligatoires et vérifier leur format.';
                    contactStatus.style.display = 'flex';
                }
                return;
            }

            // Bouton en état de chargement
            const originalBtnContent = contactSubmitBtn ? contactSubmitBtn.innerHTML : 'Envoyer';
            if (contactSubmitBtn) {
                contactSubmitBtn.disabled = true;
                contactSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> <span class="btn-text">Transmission en cours...</span>';
            }
            if (contactStatus) {
                contactStatus.style.display = 'none';
            }

            try {
                const formData = new FormData(contactForm);
                const response = await fetch('contact.php', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                let result = {};
                try {
                    result = await response.json();
                } catch (invalidResponse) {
                    throw new Error('Réponse invalide du serveur.');
                }

                if (response.ok && result.success === true) {
                    if (contactStatus) {
                        contactStatus.className = 'contact-status success';
                        contactStatus.textContent = result.message || 'Votre demande a bien été transmise.';
                        contactStatus.style.display = 'flex';
                    }
                    contactForm.reset();
                } else {
                    const errMsg = result.message || 'Une erreur est survenue lors de l’envoi. Veuillez réessayer.';
                    if (contactStatus) {
                        contactStatus.className = 'contact-status error';
                        contactStatus.textContent = errMsg;
                        contactStatus.style.display = 'flex';
                    }
                }
            } catch (networkError) {
                console.error('Échec de transmission du formulaire :', networkError);
                if (contactStatus) {
                    contactStatus.className = 'contact-status error';
                    contactStatus.textContent = 'Impossible de joindre le serveur. Votre demande n’a pas été envoyée ; réessayez ou écrivez-nous à ezoua.consulting@outlook.com.';
                    contactStatus.style.display = 'flex';
                }
            } finally {
                if (contactSubmitBtn) {
                    contactSubmitBtn.disabled = false;
                    contactSubmitBtn.innerHTML = originalBtnContent;
                }
            }
        });
    }
    
    // --- Modal de prise de rendez-vous (ouvrir depuis les boutons .btn-appointment) ---
    const appointmentModal = document.getElementById('appointmentModal');
    const appointmentForm = document.getElementById('appointmentForm');
    const btnAppointments = document.querySelectorAll('.btn-appointment');
    const closeModalBtn = document.querySelector('#appointmentModal .close-modal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const serviceSelect = document.getElementById('service');
    let previousFocusTarget = null;
    const appointmentDate = document.getElementById('appoint_date');
    if (appointmentDate) {
        appointmentDate.min = new Date().toISOString().slice(0, 10);
    }

    const currentYear = document.getElementById('currentYear');
    if (currentYear) currentYear.textContent = new Date().getFullYear();

    document.querySelectorAll('.service-discover[data-interest]').forEach(link => {
        link.addEventListener('click', () => {
            const interestSelect = document.getElementById('interest');
            if (interestSelect) interestSelect.value = link.dataset.interest;
        });
    });

    function openAppointmentModal(service) {
        if (!appointmentModal) return;
        previousFocusTarget = document.activeElement;
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            previousFocusTarget = menuToggle;
        }
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
        if (confirmationMessage) confirmationMessage.style.display = 'none';
        appointmentModal.classList.add('show');
        appointmentModal.setAttribute('aria-hidden', 'false');
        const nameField = appointmentModal.querySelector('#appoint_name');
        if (nameField) nameField.focus();
    }

    function closeAppointmentModal() {
        if (!appointmentModal) return;
        appointmentModal.classList.remove('show');
        appointmentModal.setAttribute('aria-hidden', 'true');
        if (previousFocusTarget && previousFocusTarget.isConnected) {
            previousFocusTarget.focus();
        }
        previousFocusTarget = null;
    }

    // ouvrir modal depuis chaque bouton
    if (btnAppointments.length > 0) {
        btnAppointments.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const svc = btn.dataset.service || '';
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
        if (!appointmentModal || !appointmentModal.classList.contains('show')) return;

        if (e.key === 'Escape') {
            closeAppointmentModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusable = Array.from(appointmentModal.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]'))
                .filter(element => element.getClientRects().length > 0);
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
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

            // Numéro WhatsApp officiel EZOUA Consulting (format international)
            const phone = '2250799490505';
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
            if (targetId === '#' || this.classList.contains('skip-link')) return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});