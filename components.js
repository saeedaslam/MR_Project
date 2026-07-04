/**
 * Reusable UI Components
 * 
 * This module contains reusable component functions to reduce code duplication
 * and improve maintainability.
 */

const Components = {
  /**
   * Create payment methods UI
   * @param {Array} methods - Payment methods data
   * @returns {string} HTML string for payment methods
   */
  createPaymentMethods: function(methods) {
    if (!methods || !Array.isArray(methods)) return '';
    
    const tabs = methods.map((method, index) => `
      <div class="pay-tab ${index === 0 ? 'active' : ''}" 
           onclick="switchPaymentTab('${method.id}', this)"
           role="button"
           tabindex="0"
           aria-pressed="${index === 0}">
        <i class="fa-solid ${method.details[0].icon}" style="font-size: 20px;"></i>
        ${Utils.escapeHtml(method.name)}
      </div>
    `).join('');
    
    const details = methods.map((method, index) => `
      <div class="pay-detail ${index === 0 ? 'show' : ''}" id="pay-${method.id}">
        ${method.details.map(detail => `
          <div class="pay-detail-row" 
               onclick="copyToClipboard('${Utils.escapeHtml(detail.value).replace(/'/g, "\\'")}')" 
               title="Click to copy"
               role="button"
               tabindex="0"
               aria-label="Copy ${Utils.escapeHtml(detail.label)}">
            <div class="pay-detail-icon">
              <i class="fa-solid ${detail.icon}"></i>
            </div>
            <div>
              <div class="pay-detail-label">${Utils.escapeHtml(detail.label)}</div>
              <div class="pay-detail-value">${Utils.escapeHtml(detail.value)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
    
    return `
      <div class="payment-card">
        <div class="payment-header">
          <i class="fa-solid fa-credit-card"></i> Payment Methods
        </div>
        <div class="payment-body">
          <div class="pay-tabs">
            ${tabs}
          </div>
          ${details}
          <div class="payment-note">
            <i class="fa-solid fa-circle-info"></i>
            پیمنٹ کے بعد اس نمبر پر سکرین شاٹ سینڈ کریں یہ بھی ایڈ کر دیجیے گا 03004844733
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * Create office info card
   * @param {Array} info - Office information items
   * @returns {string} HTML string for office info
   */
  createOfficeInfo: function(info) {
    if (!info || !Array.isArray(info)) return '';
    
    const rows = info.map(item => `
      <div class="office-row">
        <i class="${item.fa || item.icon}"></i>
        <div class="office-row-text">${item.text}</div>
      </div>
    `).join('');
    
    return `
      <div class="office-card">
        <div class="office-inner">
          <div class="office-title">
            <i class="fa-solid fa-building"></i> Office Information
          </div>
          ${rows}
        </div>
      </div>
    `;
  },
  
  /**
   * Create package slider items
   * @param {Array} packages - Package data
   * @returns {string} HTML string for packages
   */
  createPackageItems: function(packages) {
    if (!packages || !Array.isArray(packages)) return '';
    
    return packages.map(pkg => `
      <div class="pkg-slide">
        <div class="pkg-slide-name">${Utils.escapeHtml(pkg.name)}</div>
        <div class="pkg-slide-speed">${Utils.escapeHtml(pkg.speed)}</div>
        <div class="pkg-slide-price">${Utils.formatCurrency(pkg.price)}<span>/month</span></div>
        <ul class="pkg-slide-features">
          ${pkg.features.map(feature => `
            <li><i class="fa-solid fa-check"></i> ${Utils.escapeHtml(feature)}</li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  },
  
  /**
   * Create status badge with appropriate styling
   * @param {string} status - Status value
   * @returns {object} Object with className and icon
   */
  getStatusConfig: function(status) {
    const configs = {
      active: { className: 'status-active', icon: 'fa-check-circle' },
      pending: { className: 'status-pending', icon: 'fa-clock' },
      expired: { className: 'status-expired', icon: 'fa-times-circle' },
      suspended: { className: 'status-suspended', icon: 'fa-pause-circle' }
    };
    return configs[status?.toLowerCase()] || configs.expired;
  },
  
  /**
   * Create toast notification element
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @returns {Element} Toast element
   */
  createToast: function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    const icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info'
    };
    
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info}"></i>
      <span>${Utils.sanitizeInput(message)}</span>
    `;
    
    return toast;
  }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Components;
}
