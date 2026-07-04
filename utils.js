/**
 * Utility Functions
 * 
 * Common utility functions used throughout the application.
 */

const Utils = {
  /**
   * Sanitize user input to prevent XSS attacks
   * @param {string} str - Input string to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeInput: function(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
  
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  isValidEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  /**
   * Validate phone number (Pakistan format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid phone number
   */
  isValidPhone: function(phone) {
    const re = /^03\d{9}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
  },
  
  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency symbol (default: PKR)
   * @returns {string} Formatted currency string
   */
  formatCurrency: function(amount, currency = 'PKR') {
    return `${currency} ${amount.toLocaleString('en-PK')}`;
  },
  
  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle: function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   */
  showToast: function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info}"></i>
      <span>${this.sanitizeInput(message)}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },
  
  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate: function(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  /**
   * Check if element is in viewport
   * @param {Element} element - Element to check
   * @returns {boolean} True if element is visible
   */
  isInViewport: function(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
