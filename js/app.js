 
// Configuration
const CONFIG = {
  SUPABASE_URL: 'https://iuzwdjgagcxqwtpihpmb.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1endkamdhZ2N4cXd0cGlocG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MzQ0NzMsImV4cCI6MjA5ODExMDQ3M30.h_ofLT6hKZUsiw3lfZh2qAO62C1BT78k4dSjGXrzAow',
  SLIDER_INTERVAL: 3500,
  SCROLL_AMOUNT: 160
};

// Data
const PACKAGES = [
  { name: 'LH3', speed: '2 Mbps', price: 1000, features: ['2 Mbps download', 'Unlimited data', '24/7 support'] },
  { name: 'LHR5', speed: '5 Mbps', price: 1400, features: ['5 Mbps download', 'Unlimited data', '24/7 support'] },
  { name: 'SUPER-10', speed: '10 Mbps', price: 1800, features: ['10 Mbps download', 'Unlimited data', 'Priority support', 'Free router'] },
  { name: 'SUPER-15', speed: '15 Mbps', price: 2500, features: ['15 Mbps download', 'Unlimited data', 'Priority support', 'Free router'] },
  { name: 'SUPER-20', speed: '20 Mbps', price: 3000, features: ['20 Mbps download', 'Unlimited data', 'Priority support', 'Free router'] },
  { name: 'SUPER-30', speed: '25 Mbps', price: 3500, features: ['25 Mbps download', 'Unlimited data', 'Priority support', 'Free router'] }
];

const PAYMENT_METHODS = [
  {
    id: 'ubl',
    name: 'UBL',
    details: [
      { icon: 'fa-building-columns', label: 'Bank Name', value: 'UBL' },
      { icon: 'fa-hashtag', label: 'Account Number', value: '2197371721801' },
      { icon: 'fa-barcode', label: 'IBAN', value: 'PK68UNIL0109000371721801' },
      { icon: 'fa-user', label: 'Account Title', value: 'M.R. Cable Network' }
    ]
  },
  {
    id: 'jazzbiz',
    name: 'Jazz Business',
    details: [
      { icon: 'fa-hashtag', label: 'Till ID', value: '981 985 260' },
      { icon: 'fa-user', label: 'Account Title', value: 'M.R. Cable Network' }
    ]
  },
  {
    id: 'wallet',
    name: 'JazzCash/EasyPaisa',
    details: [
      { icon: 'fa-mobile-screen-button', label: 'Number', value: '0300-4884733' },
      { icon: 'fa-user', label: 'Name', value: 'Musharraf Iqbal' }
    ]
  }
];

const OFFICE_INFO = [
  { icon: 'oi-clock', fa: 'fa-clock', text: '<strong>Sat–Thu:</strong> 09:00 AM – 05:00 PM<br><span>Friday: 09:00 AM – 11:59 AM</span>' },
  { icon: 'oi-yt', fa: 'fa-brands fa-youtube', text: '<a href="https://www.youtube.com/@mrcablenetworkkrk" target="_blank" rel="noopener noreferrer">@mrcablenetworkkrk</a>' },
  { icon: 'oi-fb', fa: 'fa-brands fa-facebook-f', text: '<a href="https://www.facebook.com/M.R.CableNetwork" target="_blank" rel="noopener noreferrer">M.R. Cable Network</a>' },
  { icon: 'oi-web', fa: 'fa-globe', text: '<a href="https://www.mrcablenetwork.com" target="_blank" rel="noopener noreferrer">www.mrcablenetwork.com</a>' }
];

// Initialize Supabase
const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// State
let customerData = null;
let sliderInterval = null;

// Utility Functions
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

function formatCurrency(amount) {
  const num = parseFloat(String(amount).replace(/,/g, ''));
  return !isNaN(num) ? `RS ${num.toLocaleString('en-PK')}` : '—';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatValue(key, value) {
  if (value === '' || value == null) return '—';
  
  const keyLower = key.toLowerCase();
  const strValue = String(value).trim();
  
  if (/(amount|bill|balance|due|charge|cost|fee)/.test(keyLower)) {
    return formatCurrency(strValue);
  }
  
  if (/(date|expiry|renew)/.test(keyLower)) {
    return formatDate(strValue);
  }
  
  return strValue;
}

function calculateStatus(expirationDate) {
  if (!expirationDate) return 'expired';
  
  const expiry = new Date(expirationDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysRemaining = (expiry - today) / (1000 * 60 * 60 * 24);
  
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 7) return 'pending';
  return 'active';
}

function getStatusConfig(status) {
  const configs = {
    active: { class: 'active', label: 'Active' },
    pending: { class: 'pending', label: 'Expiring Soon' },
    expired: { class: 'expired', label: 'Expired' }
  };
  return configs[status] || configs.expired;
}

// Toast Notification System
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation'
  };
  
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Render Functions
function renderPackages(containerId) {
  const track = document.getElementById(containerId);
  if (!track) return;
  
  track.innerHTML = PACKAGES.map(pkg => `
    <div class="pkg-slide">
      <div class="pkg-slide-name">${escapeHtml(pkg.name)}</div>
      <div class="pkg-slide-speed">${escapeHtml(pkg.speed)}</div>
      <div class="pkg-slide-price">RS ${pkg.price.toLocaleString()}<span>/mo</span></div>
      <ul class="pkg-slide-features">
        ${pkg.features.map(feature => `
          <li><i class="fa-solid fa-check"></i> ${escapeHtml(feature)}</li>
        `).join('')}
      </ul>
    </div>
  `).join('');
}

function renderPaymentMethods() {
  const container = document.getElementById('loginPayment');
  if (!container) return;
  
  container.className = 'payment-card';
  container.innerHTML = `
    <div class="payment-header">
      <i class="fa-solid fa-credit-card"></i> Payment Methods
    </div>
    <div class="payment-body">
      <div class="pay-tabs">
        ${PAYMENT_METHODS.map((method, index) => `
          <div class="pay-tab ${index === 0 ? 'active' : ''}" 
               onclick="switchPaymentTab('${method.id}', this)"
               role="button"
               tabindex="0"
               aria-pressed="${index === 0}">
            <i class="fa-solid ${method.details[0].icon}" style="font-size: 20px;"></i>
            ${escapeHtml(method.name)}
          </div>
        `).join('')}
      </div>
      ${PAYMENT_METHODS.map((method, index) => `
        <div class="pay-detail ${index === 0 ? 'show' : ''}" id="pay-${method.id}">
          ${method.details.map(detail => `
            <div class="pay-detail-row" onclick="copyToClipboard('${escapeHtml(detail.value).replace(/'/g, "\\'")}')" title="Click to copy">
              <div class="pay-detail-icon">
                <i class="fa-solid ${detail.icon}"></i>
              </div>
              <div>
                <div class="pay-detail-label">${escapeHtml(detail.label)}</div>
                <div class="pay-detail-value">${escapeHtml(detail.value)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
      <div class="payment-note">
        <i class="fa-solid fa-circle-info"></i>
        پیمنٹ کے بعد اس نمبر پر سکرین شاٹ سینڈ کریں یہ بھی ایڈ کر دیجیے گا 03004844733
      </div>
    </div>
  `;
}

function switchPaymentTab(methodId, element) {
  // Find the parent container to scope the search
  const parentContainer = element.closest('.payment-body');
  
  if (!parentContainer) return;
  
  // Only affect tabs and details within this specific container
  parentContainer.querySelectorAll('.pay-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-pressed', 'false');
  });
  element.classList.add('active');
  element.setAttribute('aria-pressed', 'true');
  
  parentContainer.querySelectorAll('.pay-detail').forEach(detail => detail.classList.remove('show'));
  const targetDetail = parentContainer.querySelector(`#pay-${methodId}`);
  if (targetDetail) {
    targetDetail.classList.add('show');
  }
}

function renderOfficeInfo() {
  const container = document.getElementById('loginOffice');
  if (!container) return;
  
  container.innerHTML = `
    <div class="office-inner">
      <div class="office-title">
        <i class="fa-solid fa-location-dot"></i> Contact & Office
      </div>
      ${OFFICE_INFO.map(info => `
        <div class="office-row">
          <i class="fa-solid ${info.fa} ${info.icon}"></i>
          <div class="office-row-text">${info.text}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Slider Functions
function scrollSlider(trackId, amount) {
  const track = document.getElementById(trackId);
  if (track) {
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }
}

function startAutoSlider(trackId) {
  if (sliderInterval) clearInterval(sliderInterval);
  
  sliderInterval = setInterval(() => {
    const track = document.getElementById(trackId);
    if (track) {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: CONFIG.SCROLL_AMOUNT, behavior: 'smooth' });
      }
    }
  }, CONFIG.SLIDER_INTERVAL);
}

function pauseAutoSlider() {
  if (sliderInterval) {
    clearInterval(sliderInterval);
    sliderInterval = null;
  }
}

function resumeAutoSlider(trackId) {
  startAutoSlider(trackId);
}

// Login Functions
function resetLoginButton() {
  const button = document.getElementById('loginBtn');
  button.disabled = false;
  button.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i>&nbsp; View My Account';
}

async function handleLogin() {
  const phoneInput = document.getElementById('phoneInput');
  const last4Input = document.getElementById('last4Input');
  const errorElement = document.getElementById('loginError');
  const button = document.getElementById('loginBtn');
  
  const phone = phoneInput.value.trim();
  const last4 = last4Input.value.trim();
  
  errorElement.textContent = '';
  
  // Validation
  if (!phone || !last4) {
    errorElement.textContent = 'Please enter your phone number and last 4 digits of phone number.';
    return;
  }
  
  if (last4.length !== 4 || isNaN(last4)) {
    errorElement.textContent = 'Last 4 digits must be a 4-digit number.';
    return;
  }
  
  // Loading state
  button.disabled = true;
  button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Verifying...';
  
  try {
    // Use Supabase Edge Function for secure login (bypasses RLS, server-side validation)
    const { data, error } = await sb.functions.invoke('login', { body: { phone, last4 } });
    
    if (error || !data || data.error || !data.customer) {
      errorElement.textContent = 'Phone number or last 4 digits is incorrect.';
      resetLoginButton();
      return;
    }
    
    // Success
    customerData = data.customer;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.add('active');
    renderDashboard(customerData);
    showToast('Welcome back! Account loaded successfully.', 'success');
    
  } catch (error) {
    console.error('Login error:', error);
    errorElement.textContent = 'Could not reach the server. Please try again.';
    resetLoginButton();
  }
}

function handleLogout() {
  customerData = null;
  document.getElementById('phoneInput').value = '';
  document.getElementById('last4Input').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('dashboard').classList.remove('active');
  document.getElementById('loginScreen').classList.remove('hidden');
  resetLoginButton();
  showToast('You have been logged out successfully.', 'info');
}

// Dashboard Functions
function renderDashboard(customer) {
  const status = calculateStatus(customer.expiration_date);
  const statusConfig = getStatusConfig(status);
  
  // Update user info
  document.getElementById('userPhoneDisplay').textContent = customer.contact || '—';
  document.getElementById('userAvatar').textContent = (customer.customer_name || 'U').charAt(0).toUpperCase();
  
  // Render content
  document.getElementById('profileContent').innerHTML = `
    <div class="id-card fade-up">
      <div class="id-card-top">
        <div class="id-chip"></div>
        <div class="signal-mini">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="id-name">${escapeHtml(customer.customer_name || 'Customer')}</div>
      <div class="id-meta">
        <div>
          <div class="meta-label">Customer ID</div>
          <div class="meta-val">${escapeHtml(customer.customer_id || '—')}</div>
        </div>
        <div>
          <div class="meta-label">Package</div>
          <div class="meta-val">${escapeHtml(customer.package || '—')}</div>
        </div>
        <div>
          <div class="meta-label">Status</div>
          <div class="meta-val">
            <span class="status-pill ${statusConfig.class}">
              <span class="status-dot"></span>
              ${statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="info-grid fade-up">
      <div class="info-row">
        <div class="info-left">
          <div class="info-icon cyan">
            <i class="fa-solid fa-calendar-days"></i>
          </div>
          <div>
            <div class="info-label">Expiry Date</div>
            <div class="info-value ${calculateStatus(customer.expiration_date) === 'expired' ? 'text-danger' : ''}">${formatValue('expiration_date', customer.expiration_date)}</div>
          </div>
        </div>
      </div>
      <div class="info-row">
        <div class="info-left">
          <div class="info-icon green">
            <i class="fa-solid fa-wallet"></i>
          </div>
          <div>
            <div class="info-label">Current Balance</div>
            <div class="info-value">${formatValue('balance', customer.balance)}</div>
          </div>
        </div>
      </div>
      <div class="info-row">
        <div class="info-left">
          <div class="info-icon orange">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div>
            <div class="info-label">Address</div>
            <div class="info-value" style="white-space: normal; max-width: 280px;">
              ${escapeHtml(customer.address || '—')}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="details-card fade-up">
      <div class="details-header">
        <i class="fa-solid fa-credit-card"></i> Payment Methods
      </div>
      <div class="payment-body" style="padding: 0; background: transparent;">
        <div class="pay-tabs">
          ${PAYMENT_METHODS.map((method, index) => `
            <div class="pay-tab ${index === 0 ? 'active' : ''}" 
                 onclick="switchPaymentTab('${method.id}', this)"
                 role="button"
                 tabindex="0"
                 aria-pressed="${index === 0}">
              <i class="fa-solid ${method.details[0].icon}" style="font-size: 20px;"></i>
              ${escapeHtml(method.name)}
            </div>
          `).join('')}
        </div>
        ${PAYMENT_METHODS.map((method, index) => `
          <div class="pay-detail ${index === 0 ? 'show' : ''}" id="pay-${method.id}">
            ${method.details.map(detail => `
              <div class="pay-detail-row" onclick="copyToClipboard('${escapeHtml(detail.value).replace(/'/g, "\\'")}')" title="Click to copy">
                <div class="pay-detail-icon">
                  <i class="fa-solid ${detail.icon}"></i>
                </div>
                <div>
                  <div class="pay-detail-label">${escapeHtml(detail.label)}</div>
                  <div class="pay-detail-value">${escapeHtml(detail.value)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
        <div class="payment-note">
          <i class="fa-solid fa-circle-info"></i>
          پیمنٹ کے بعد اس نمبر پر سکرین شاٹ سینڈ کریں یہ بھی ایڈ کر دیجیے گا 03004844733
        </div>
      </div>
    </div>
  `;
}

// Copy to clipboard function
function copyToClipboard(text) {
  if (!text) return;
  
  navigator.clipboard.writeText(text).then(() => {
    // Show toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent-secondary);
      color: #051520;
      padding: 12px 24px;
      border-radius: var(--radius-md);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 13px;
      z-index: 99999;
      box-shadow: var(--shadow-lg);
      animation: fadeSlideUp 0.3s ease-out;
    `;
    toast.textContent = 'Copied to clipboard!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Event Listeners
function initializeEventListeners() {
  // Toggle password visibility
  document.getElementById('togglePass').addEventListener('click', function() {
    const input = document.getElementById('last4Input');
    if (input.type === 'password') {
      input.type = 'text';
      this.textContent = 'Hide';
    } else {
      input.type = 'password';
      this.textContent = 'Show';
    }
  });
  
  // Login button
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  
  // Enter key navigation
  document.getElementById('phoneInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('last4Input').focus();
    }
  });
  
  document.getElementById('last4Input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  });
  
  // Slider pause on hover
  const sliderWrap = document.getElementById('loginPkgWrap');
  if (sliderWrap) {
    sliderWrap.addEventListener('mouseenter', pauseAutoSlider);
    sliderWrap.addEventListener('mouseleave', () => resumeAutoSlider('loginPkgTrack'));
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderPackages('loginPkgTrack');
  renderPaymentMethods();
  renderOfficeInfo();
  startAutoSlider('loginPkgTrack');
  initializeEventListeners();
});

