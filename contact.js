// contact.js - Enhanced Contact Form Handler

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('form[action="contact.php"]');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Rate limiting
    let lastSubmissionTime = 0;
    const minSubmissionInterval = 5000; // 5 detik
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check rate limiting
        const currentTime = Date.now();
        if (currentTime - lastSubmissionTime < minSubmissionInterval) {
            showNotification('Harap tunggu beberapa detik sebelum mengirim pesan lagi.', 'warning');
            return;
        }
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        showLoadingState();
        
        try {
            const formData = new FormData(contactForm);
            
            const response = await fetch('contact.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                showNotification(result.message, 'success');
                contactForm.reset();
                lastSubmissionTime = currentTime;
            } else {
                throw new Error(result.error || 'Terjadi kesalahan saat mengirim pesan');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message || 'Terjadi kesalahan jaringan. Silakan coba lagi.', 'error');
        } finally {
            hideLoadingState();
        }
    });
    
    function validateForm() {
        const name = contactForm.querySelector('input[name="name"]').value.trim();
        const email = contactForm.querySelector('input[name="email"]').value.trim();
        const message = contactForm.querySelector('textarea[name="message"]').value.trim();
        
        // Clear previous error states
        clearErrorStates();
        
        let isValid = true;
        
        if (name.length < 2) {
            showFieldError('name', 'Nama harus minimal 2 karakter');
            isValid = false;
        }
        
        if (!isValidEmail(email)) {
            showFieldError('email', 'Format email tidak valid');
            isValid = false;
        }
        
        if (message.length < 10) {
            showFieldError('message', 'Pesan harus minimal 10 karakter');
            isValid = false;
        }
        
        if (message.length > 1000) {
            showFieldError('message', 'Pesan terlalu panjang (maksimal 1000 karakter)');
            isValid = false;
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showFieldError(fieldName, message) {
        const field = contactForm.querySelector(`[name="${fieldName}"]`);
        field.classList.add('is-invalid');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-danger small mt-1';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    function clearErrorStates() {
        const fields = contactForm.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.classList.remove('is-invalid');
        });
        
        const errorMessages = contactForm.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }
    
    function showLoadingState() {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mengirim...';
        contactForm.style.opacity = '0.7';
    }
    
    function hideLoadingState() {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        contactForm.style.opacity = '1';
    }
    
    function showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification-toast');
        existing.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification-toast alert alert-${getBootstrapClass(type)} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${getIcon(type)} me-2"></i>
                <div>${message}</div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    function getBootstrapClass(type) {
        const classes = {
            success: 'success',
            error: 'danger',
            warning: 'warning',
            info: 'info'
        };
        return classes[type] || 'info';
    }
    
    function getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                validateField(this);
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
    
    function validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        
        // Clear existing error
        field.classList.remove('is-invalid');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Validate specific field
        switch(fieldName) {
            case 'name':
                if (value.length > 0 && value.length < 2) {
                    showFieldError(fieldName, 'Nama harus minimal 2 karakter');
                }
                break;
            case 'email':
                if (value.length > 0 && !isValidEmail(value)) {
                    showFieldError(fieldName, 'Format email tidak valid');
                }
                break;
            case 'message':
                if (value.length > 0 && value.length < 10) {
                    showFieldError(fieldName, 'Pesan harus minimal 10 karakter');
                } else if (value.length > 1000) {
                    showFieldError(fieldName, 'Pesan terlalu panjang (maksimal 1000 karakter)');
                }
                break;
        }
    }
    
    // Character counter for message field
    const messageField = contactForm.querySelector('textarea[name="message"]');
    if (messageField) {
        const counterDiv = document.createElement('div');
        counterDiv.className = 'text-muted small text-end mt-1';
        counterDiv.innerHTML = '<span id="char-count">0</span>/1000 karakter';
        messageField.parentNode.appendChild(counterDiv);
        
        const charCount = document.getElementById('char-count');
        
        messageField.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            if (count > 1000) {
                charCount.parentNode.classList.add('text-danger');
            } else if (count > 900) {
                charCount.parentNode.classList.add('text-warning');
                charCount.parentNode.classList.remove('text-danger');
            } else {
                charCount.parentNode.classList.remove('text-danger', 'text-warning');
            }
        });
    }
});

// Search functionality enhancement
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#searchModal input');
    const searchIcon = document.querySelector('#search-icon-1');
    
    if (searchInput && searchIcon) {
        const performSearch = async () => {
            const query = searchInput.value.trim();
            
            if (!query) {
                alert('Masukkan kata kunci pencarian');
                return;
            }
            
            try {
                // Show loading
                searchIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    throw new Error('Pencarian gagal');
                }
                
                const data = await response.json();
                
                // Display results - you can customize this part
                console.log('Search results:', data);
                alert('Hasil pencarian ditemukan! Lihat console untuk detail.');
                
            } catch (error) {
                console.error('Search failed:', error);
                alert('Pencarian gagal. Silakan coba lagi.');
            } finally {
                // Reset icon
                searchIcon.innerHTML = '<i class="fa fa-search"></i>';
            }
        };
        
        searchIcon.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});