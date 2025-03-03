// Toast notification system
const Toast = {
    show: function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="mr-2">
                    ${type === 'success' 
                        ? '<i class="fas fa-check-circle text-green-500"></i>' 
                        : '<i class="fas fa-exclamation-circle text-red-500"></i>'}
                </div>
                <div>${message}</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Loading spinner
const LoadingSpinner = {
    show: function() {
        const spinner = document.createElement('div');
        spinner.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
        spinner.id = 'loadingSpinner';
        spinner.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(spinner);
    },
    
    hide: function() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.remove();
        }
    }
};

// Form validation
const FormValidator = {
    phoneNumber: function(number) {
        const regex = /^\+[0-9]{2}\s?\([0-9]{2}\)\s?[0-9]{5}-[0-9]{4}$/;
        return regex.test(number);
    },
    
    required: function(value) {
        return value.trim().length > 0;
    },
    
    minLength: function(value, min) {
        return value.trim().length >= min;
    },
    
    maxLength: function(value, max) {
        return value.trim().length <= max;
    },
    
    number: function(value, min, max) {
        const num = parseInt(value);
        return !isNaN(num) && num >= min && num <= max;
    }
};

// API wrapper
const API = {
    async get(endpoint) {
        try {
            LoadingSpinner.show();
            const response = await axios.get(endpoint);
            return response.data;
        } catch (error) {
            console.error('API GET Error:', error);
            Toast.show(error.response?.data?.message || 'Erro ao carregar dados', 'error');
            throw error;
        } finally {
            LoadingSpinner.hide();
        }
    },
    
    async post(endpoint, data) {
        try {
            LoadingSpinner.show();
            const response = await axios.post(endpoint, data);
            return response.data;
        } catch (error) {
            console.error('API POST Error:', error);
            Toast.show(error.response?.data?.message || 'Erro ao salvar dados', 'error');
            throw error;
        } finally {
            LoadingSpinner.hide();
        }
    },
    
    async put(endpoint, data) {
        try {
            LoadingSpinner.show();
            const response = await axios.put(endpoint, data);
            return response.data;
        } catch (error) {
            console.error('API PUT Error:', error);
            Toast.show(error.response?.data?.message || 'Erro ao atualizar dados', 'error');
            throw error;
        } finally {
            LoadingSpinner.hide();
        }
    },
    
    async delete(endpoint) {
        try {
            LoadingSpinner.show();
            const response = await axios.delete(endpoint);
            return response.data;
        } catch (error) {
            console.error('API DELETE Error:', error);
            Toast.show(error.response?.data?.message || 'Erro ao excluir dados', 'error');
            throw error;
        } finally {
            LoadingSpinner.hide();
        }
    }
};

// Sidebar management
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');

    if (openSidebarBtn && closeSidebarBtn) {
        openSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('closed');
            mainContent.classList.add('sidebar-open');
        });

        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('closed');
            mainContent.classList.remove('sidebar-open');
        });

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !openSidebarBtn.contains(e.target) &&
                !sidebar.classList.contains('closed')) {
                sidebar.classList.add('closed');
                mainContent.classList.remove('sidebar-open');
            }
        });
    }
});

// Format phone number input
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 2) {
        input.value = value.length ? '+' + value : '';
    } else if (value.length <= 4) {
        input.value = '+' + value.substring(0, 2) + ' (' + value.substring(2);
    } else if (value.length <= 9) {
        input.value = '+' + value.substring(0, 2) + ' (' + value.substring(2, 4) + ') ' + value.substring(4);
    } else {
        input.value = '+' + value.substring(0, 2) + ' (' + value.substring(2, 4) + ') ' + 
            value.substring(4, 9) + '-' + value.substring(9, 13);
    }
}

// Handle session timeout
let sessionTimeout;

function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        Toast.show('Sua sessão expirou. Redirecionando para o login...', 'error');
        setTimeout(() => window.location.href = '/login', 2000);
    }, 30 * 60 * 1000); // 30 minutes
}

document.addEventListener('mousemove', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);
resetSessionTimeout();

// Export utilities for use in other scripts
window.Toast = Toast;
window.LoadingSpinner = LoadingSpinner;
window.FormValidator = FormValidator;
window.API = API;