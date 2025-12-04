document.addEventListener('DOMContentLoaded', function() {
    // Gestion des boutons d'augmentation de quantité
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('increase-quantity')) {
            const menuId = e.target.getAttribute('data-menu-id');
            updateQuantity(menuId, 1);
        }
    });

    // Gestion des boutons de diminution de quantité
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('decrease-quantity')) {
            const menuId = e.target.getAttribute('data-menu-id');
            updateQuantity(menuId, -1);
        }
    });

    // Gestion des boutons de suppression d'article
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            const menuId = e.target.getAttribute('data-menu-id');
            removeItem(menuId);
        }
    });

    // Gestion du bouton vider panier
    document.addEventListener('click', function(e) {
        if (e.target.id === 'clear-cart') {
            clearCart();
        }
    });

    // Fonction pour mettre à jour la quantité
    function updateQuantity(menuId, change) {
        fetch(`/commandes/panier/ajouter/${menuId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                quantite: change
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mettre à jour l'affichage de la quantité
                const quantityDisplay = document.querySelector(`.quantity-display[data-menu-id="${menuId}"]`);
                if (quantityDisplay) {
                    quantityDisplay.textContent = data.quantite;
                }

                // Mettre à jour le sous-total
                const sousTotal = document.querySelector(`.sous-total[data-menu-id="${menuId}"]`);
                if (sousTotal) {
                    sousTotal.textContent = data.sous_total + ' FCFA';
                }

                // Mettre à jour le total
                const cartTotal = document.getElementById('cart-total');
                if (cartTotal) {
                    cartTotal.textContent = data.total + ' FCFA';
                }

                // Si la quantité est 0, supprimer la ligne
                if (data.quantite === 0) {
                    const row = document.querySelector(`tr[data-menu-id="${menuId}"]`);
                    if (row) {
                        row.remove();
                    }
                    
                    // Vérifier s'il reste des articles dans le panier
                    const remainingRows = document.querySelectorAll('tbody tr[data-menu-id]');
                    if (remainingRows.length === 0) {
                        const tbody = document.querySelector('.table tbody');
                        if (tbody) {
                            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Votre panier est vide.</td></tr>';
                        }
                    }
                }

                // Mettre à jour le compteur du panier dans la navbar
                updateCartCount();
                // Recharger le contenu du modal
                reloadCartModal();
            } else {
                console.error('Erreur:', data.message);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
    }

    // Fonction pour supprimer un article
    function removeItem(menuId) {
        fetch(`/commandes/panier/supprimer/${menuId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Supprimer la ligne du tableau
                const row = document.querySelector(`tr[data-menu-id="${menuId}"]`);
                if (row) {
                    row.remove();
                }

                // Mettre à jour le total
                const cartTotal = document.getElementById('cart-total');
                if (cartTotal) {
                    cartTotal.textContent = data.total + ' FCFA';
                }

                // Vérifier s'il reste des articles dans le panier
                const remainingRows = document.querySelectorAll('tbody tr[data-menu-id]');
                if (remainingRows.length === 0) {
                    const tbody = document.querySelector('.table tbody');
                    if (tbody) {
                        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Votre panier est vide.</td></tr>';
                    }
                }

                // Mettre à jour le compteur du panier dans la navbar
                updateCartCount();
                // Recharger le contenu du modal
                reloadCartModal();
            } else {
                console.error('Erreur:', data.message);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
    }

    // Fonction pour vider le panier
    function clearCart() {
        if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
            fetch('/commandes/panier/vider/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Vider le contenu du modal
                    const tbody = document.querySelector('.table tbody');
                    if (tbody) {
                        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Votre panier est vide.</td></tr>';
                    }

                    // Mettre à jour le total
                    const cartTotal = document.getElementById('cart-total');
                    if (cartTotal) {
                        cartTotal.textContent = '0 FCFA';
                    }

                    // Mettre à jour le compteur du panier dans la navbar
                    updateCartCount();
                    // Recharger le contenu du modal
                    reloadCartModal();
                } else {
                    console.error('Erreur:', data.message);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
            });
        }
    }

    // Fonction pour mettre à jour le compteur du panier
    function updateCartCount() {
        fetch('/commandes/panier/count/')
        .then(response => response.json())
        .then(data => {
            const cartBadge = document.getElementById('cart-count');
            if (cartBadge) {
                cartBadge.textContent = data.count;
                if (data.count === 0) {
                    cartBadge.style.display = 'none';
                } else {
                    cartBadge.style.display = 'inline';
                }
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du compteur:', error);
        });
    }

    // Fonction pour récupérer le token CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Fonction pour recharger dynamiquement le contenu du modal panier
    function reloadCartModal() {
        fetch('/commandes/panier/modal/')
        .then(response => response.text())
        .then(html => {
            // Remplacer le contenu du modal
            const modalBody = document.querySelector('#cart-modal-content');
            if (modalBody) {
                modalBody.innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Erreur lors du rechargement du panier:', error);
        });
    }

    // --- AJOUT AUTOMATIQUE AU PANIER APRÈS CONNEXION ---
    // Vérifier si on a une intention d'ajout au panier stockée
    const pendingAdd = localStorage.getItem('pendingAddToCart');
    if (pendingAdd && typeof window.isAuthenticated !== 'undefined' && window.isAuthenticated) {
        try {
            const { menu_id, quantite } = JSON.parse(pendingAdd);
            // Effectuer l'ajout au panier automatiquement
            fetch(`/commandes/panier/ajouter/${menu_id}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrf-token]').content,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: new URLSearchParams({ quantite: quantite || 1 })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' || data.success) {
                    updateCartCounter && updateCartCounter();
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'success',
                            title: data.message || 'Article ajouté automatiquement après connexion !',
                            timer: 2500,
                            showConfirmButton: false
                        });
                    }
                }
            })
            .finally(() => {
                localStorage.removeItem('pendingAddToCart');
            });
        } catch (e) {
            localStorage.removeItem('pendingAddToCart');
        }
    }
});

// Gestion du compteur du panier dans la navbar
function updateCartCounter() {
    fetch("/commandes/panier/count/")
        .then(response => response.json())
        .then(data => {
            const cartCountSpan = document.getElementById('cartCount');
            if (cartCountSpan) {
                cartCountSpan.textContent = data.count;
                cartCountSpan.style.display = data.count > 0 ? 'inline-block' : 'none';
            }
        });
}

// Gestion du chargement du contenu de la modale panier
function loadCartModalContent() {
    const cartModalBody = document.getElementById('cart-modal-body');
    if (!cartModalBody) return;
    fetch("/commandes/panier/modal/")
        .then(response => response.text())
        .then(html => {
            cartModalBody.innerHTML = html;
        });
}

// Gestion de l'ouverture de la modale panier
const cartModalElement = document.getElementById('cartModal');
if (cartModalElement) {
    cartModalElement.addEventListener('show.bs.modal', function (event) {
        loadCartModalContent();
    });
    // Gestion des actions dans la modale (augmentation, diminution, suppression, vider)
    cartModalElement.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const menuId = target.dataset.menuId;
        function handleCartAction(url, body) {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrf-token]').content,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(body)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    updateCartCounter();
                    loadCartModalContent();
                }
            });
        }
        if (target.matches('.btn-increase, .btn-increase-final')) {
            handleCartAction(`/commandes/panier/update_item/${menuId}/`, { action: 'increase' });
        } else if (target.matches('.btn-decrease, .btn-decrease-final')) {
            handleCartAction(`/commandes/panier/update_item/${menuId}/`, { action: 'decrease' });
        } else if (target.matches('.btn-remove, .btn-remove-final')) {
            fetch(`/commandes/panier/remove_item/${menuId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrf-token]').content,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    updateCartCounter();
                    loadCartModalContent();
                }
            });
        } else if (target.matches('.btn-clear-cart, .btn-clear-cart-final')) {
            fetch("/commandes/panier/vider/", {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrf-token]').content,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateCartCounter();
                    loadCartModalContent();
                }
            });
        }
    });
}

// --- INTERCEPTION DU SUBMIT POUR AJOUT AU PANIER ---
document.body.addEventListener('submit', function(e) {
    if (e.target.matches('.add-to-cart-form')) {
        e.preventDefault();
        if (typeof window.isAuthenticated !== 'undefined' && !window.isAuthenticated) {
            // Stocker l'intention d'ajout au panier
            const form = e.target;
            const menu_id = form.querySelector('[name="menu_id"]').value;
            const quantite = form.querySelector('[name="quantite"]').value || 1;
            localStorage.setItem('pendingAddToCart', JSON.stringify({ menu_id, quantite }));
            // Redirection
            if (window.signupUrl) {
                window.location.href = window.signupUrl;
            } else {
                alert("Vous devez être connecté pour ajouter au panier.");
            }
            return;
        }
        // Utilisateur connecté : ajout AJAX classique
        const form = e.target;
        const formData = new FormData(form);
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' || data.success) {
                updateCartCounter && updateCartCounter();
                loadCartModalContent && loadCartModalContent();
                if (typeof Swal !== 'undefined') {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    });
                    Toast.fire({
                        icon: 'success',
                        title: data.message || 'Article ajouté !'
                    });
                }
            }
        })
        .catch(error => console.error('Erreur Fetch:', error));
    }
}); 