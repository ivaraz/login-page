// RIFA PERSONAL NETWORK - Login Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const btnLogin = document.getElementById("btnLogin");
  const btnSpinner = document.getElementById("btnSpinner");
  const btnText = document.getElementById("btnText");
  const btnVoucher = document.getElementById("btnVoucher");
  const statusMessage = document.getElementById("statusMessage");

  // State
  let isVoucherMode = false;

  // Initialize
  init();

  function init() {
    // Focus username on load
    setTimeout(() => usernameInput.focus(), 100);

    // Check for MikroTik errors
    checkMikrotikErrors();

    // Event listeners
    setupEventListeners();

    // Parallax effect for background
    setupParallax();
  }

  function setupEventListeners() {
    // Toggle password visibility
    togglePasswordBtn.addEventListener("click", togglePassword);

    // Form submission
    loginForm.addEventListener("submit", handleSubmit);

    // Voucher mode
    btnVoucher.addEventListener("click", toggleVoucherMode);

    // Input animations
    usernameInput.addEventListener("input", handleInput);
    passwordInput.addEventListener("input", handleInput);

    // Handle Enter key
    usernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") passwordInput.focus();
    });
  }

  function togglePassword() {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Update icon
    const eyeIcon =
      type === "password"
        ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
        : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';

    togglePasswordBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${eyeIcon}</svg>`;

    // Return focus to input
    passwordInput.focus();
  }

  function toggleVoucherMode() {
    isVoucherMode = !isVoucherMode;

    if (isVoucherMode) {
      // Switch to voucher mode
      usernameInput.placeholder = "Masukkan Kode Voucher";
      passwordInput.placeholder = "Password sama dengan voucher";

      // Auto-sync password with username
      usernameInput.addEventListener("input", syncPassword);

      // Visual feedback
      btnVoucher.style.background = "rgba(79, 70, 229, 0.1)";
      btnVoucher.style.borderColor = "var(--primary-color)";
      btnVoucher.style.color = "var(--primary-color)";

      showStatus("success", "Mode voucher aktif. Masukkan kode voucher Anda.");
      usernameInput.focus();
    } else {
      // Switch back to normal mode
      usernameInput.placeholder = "Masukkan username atau voucher";
      passwordInput.placeholder = "Masukkan password";

      // Remove auto-sync
      usernameInput.removeEventListener("input", syncPassword);

      // Reset styles
      btnVoucher.style.background = "";
      btnVoucher.style.borderColor = "";
      btnVoucher.style.color = "";

      showStatus(
        "info",
        "Mode normal aktif. Gunakan username dan password Anda.",
      );
    }
  }

  function syncPassword() {
    if (isVoucherMode) {
      passwordInput.value = usernameInput.value;
    }
  }

  function handleInput(e) {
    // Remove error state on input
    e.target.style.borderColor = "";
    hideStatus();
  }

  function handleSubmit(e) {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validation
    if (!username) {
      e.preventDefault();
      showInputError(usernameInput, "Username wajib diisi");
      return false;
    }

    if (!password) {
      e.preventDefault();
      showInputError(passwordInput, "Password wajib diisi");
      return false;
    }

    // Show loading state
    setLoading(true);

    // For MikroTik CHAP (if enabled)
    if (typeof doLogin === "function") {
      e.preventDefault();
      return doLogin();
    }

    // Normal form submission continues...
    return true;
  }

  function setLoading(loading) {
    btnLogin.disabled = loading;
    btnSpinner.classList.toggle("show", loading);
    btnText.textContent = loading ? "Memproses..." : "LOGIN";

    if (loading) {
      btnLogin.querySelector(".btn-icon").style.display = "none";
    } else {
      btnLogin.querySelector(".btn-icon").style.display = "block";
    }
  }

  function showInputError(input, message) {
    input.style.borderColor = "var(--error-color)";
    input.style.animation = "shake 0.5s ease-in-out";

    setTimeout(() => {
      input.style.animation = "";
    }, 500);

    showStatus("error", message);
    input.focus();
  }

  function showStatus(type, message) {
    const icons = {
      error:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      success:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    };

    statusMessage.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    statusMessage.className = `status-message ${type} show`;

    // Auto hide after 5 seconds
    setTimeout(hideStatus, 5000);
  }

  function hideStatus() {
    statusMessage.classList.remove("show");
  }

  function checkMikrotikErrors() {
    // Check if there's an error in URL or from MikroTik template
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      showStatus("error", decodeURIComponent(error));
    }

    // Check for MikroTik error variable (if using RouterOS variables)
    // This will be replaced by MikroTik when served
    const mikrotikError = "$(error)";
    if (mikrotikError && mikrotikError !== "$(error)") {
      showStatus("error", mikrotikError);
    }
  }

  function setupParallax() {
    // Subtle parallax effect on mouse move (desktop only)
    if (window.matchMedia("(pointer: fine)").matches) {
      document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 10;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;

        const bgImage = document.querySelector(".bg-image");
        if (bgImage) {
          bgImage.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
        }
      });
    }
  }

  // Shake animation keyframes
  const style = document.createElement("style");
  style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
  document.head.appendChild(style);
});

// MikroTik CHAP Login Function (if CHAP is enabled)
function doLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (document.sendin) {
    document.sendin.username.value = username;
    document.sendin.password.value = hexMD5(
      "$(chap-id)" + password + "$(chap-challenge)",
    );
    document.sendin.submit();
  }
  return false;
}

// Service Worker Registration (for PWA support)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.log("ServiceWorker registration failed:", err);
    });
  });
}
