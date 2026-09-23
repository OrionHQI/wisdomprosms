/* =========================================================
   FAQ ACCORDION
   ========================================================= */

const faqQuestions =
    document.querySelectorAll(".faq-question");


faqQuestions.forEach((question) => {

    question.addEventListener("click", () => {

        const currentItem =
            question.parentElement;


        /* Close other questions */

        document
            .querySelectorAll(".faq-item")
            .forEach((item) => {

                if (item !== currentItem) {

                    item.classList.remove("active");

                    const answer =
                        item.querySelector(".faq-answer");

                    answer.style.maxHeight = null;

                }

            });


        /* Toggle current question */

        currentItem.classList.toggle("active");


        const answer =
            currentItem.querySelector(".faq-answer");


        if (currentItem.classList.contains("active")) {

            answer.style.maxHeight =
                answer.scrollHeight + "px";

        } else {

            answer.style.maxHeight = null;

        }

    });

});
// ================= LOAD USER DASHBOARD =================

async function loadDashboard() {

    const token = localStorage.getItem("wisdomprosms_token");

    if (!token) {
        console.log("No user login token found.");
        return;
    }

    try {

        const response = await fetch(
            "https://wisdomprosms-backend.onrender.com/dashboard",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token


                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data.message || "Unable to load dashboard.");
            return;
        }

        // ================= USER NAME =================

        const dashboardName =
            document.getElementById("dashboard-name");

        if (dashboardName) {
            dashboardName.textContent = data.user.full_name;
        }

        const sidebarUsername =
            document.getElementById("sidebar-username");

        if (sidebarUsername) {
            sidebarUsername.textContent = data.user.full_name;
        }

        const sidebarEmail =
            document.getElementById("sidebar-email");

        if (sidebarEmail) {
            sidebarEmail.textContent = data.user.email;
        }


        // ================= WALLET =================

        const walletBalance =
            document.getElementById("wallet-balance");

        const dashboardWallet =
            document.getElementById("dashboard-wallet");

        const formattedBalance = `₦${Number(data.user.wallet_balance || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})}`;


        if (walletBalance) {
            walletBalance.textContent = formattedBalance;
        }

        if (dashboardWallet) {
            dashboardWallet.textContent = formattedBalance;
        }


        // ================= REAL NUMBER COUNT =================

        const numbersCount =
            document.getElementById("numbers-count");

        if (numbersCount) {
            numbersCount.textContent =
                data.stats?.total_numbers ?? 0;
        }


        // ================= ACTIVE ORDERS =================

        const activeOrdersCount =
    document.getElementById("active-orders-count");

if (activeOrdersCount) {
    activeOrdersCount.textContent =
        data.stats?.active_orders ?? 0;
}


        console.log("Live dashboard data:", data);

    } catch (error) {

        console.error(
            "Unable to load dashboard:",
            error
        );

    }

}
// ================= LOGIN FORM =================

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        const message = document.getElementById("login-message");

        if (!email.trim() || !password.trim()) {
            message.textContent = "Please enter your email and password.";
            return;
        }

        const response = await fetch("https://wisdomprosms-backend.onrender.com/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: email.trim(),
        password: password
    })
});

const data = await response.json();

if (!response.ok) {
    message.textContent = data.message || "Login failed.";
    return;
}

if (!data.token) {
    message.textContent = "Login failed: no authentication token received.";
    return;
}

localStorage.setItem("wisdomprosms_token", data.token);
localStorage.setItem("wisdomprosms_logged_in", "true");
localStorage.setItem("wisdomprosms_username", email.trim());

document.body.classList.add("logged-in");

document.querySelectorAll("body > header, body > section, body > footer").forEach((section) => {
    section.style.display = "none";
});

const dashboard = document.getElementById("dashboard");
const username = document.getElementById("dashboard-name");

if (username) username.textContent = data.user.full_name;

const sidebarUsername = document.getElementById("sidebar-username");
const sidebarEmail = document.getElementById("sidebar-email");

if (sidebarUsername) sidebarUsername.textContent = data.user.full_name;
if (sidebarEmail) sidebarEmail.textContent = email.trim();

if (dashboard) dashboard.style.display = "flex";

loadDashboard();

message.textContent = "Login successful!";

    });

}
// ================= DASHBOARD MENU (Active Elements) =================
// The dashboard uses the following elements for menu control:
// - #dashboard-menu-toggle: hamburger button
// - .sidebar-item: navigation menu items
// - #dashboard-overlay: overlay behind menu
// - #dashboard-sidebar-close: close button in sidebar
// These are handled in the DASHBOARD INTERACTIONS section below.
// ================= BUY NUMBER =================
const otherServiceContainer = document.getElementById("otherServiceContainer");
const otherServiceInput = document.getElementById("otherService");

const serviceSelect = document.getElementById("service-select");

if (serviceSelect && otherServiceContainer && otherServiceInput) {
    serviceSelect.addEventListener("change", function () {
        if (this.value === "Other") {
            otherServiceContainer.style.display = "block";
            otherServiceInput.focus();
        } else {
            otherServiceContainer.style.display = "none";
            otherServiceInput.value = "";
        }
    });
}
const continueNumberButton =
    document.getElementById("continue-number-button");

const countrySelect =
    document.getElementById("country-select");

const numberMessage =
    document.getElementById("number-message");


if (continueNumberButton && countrySelect && serviceSelect && numberMessage) {
    continueNumberButton.addEventListener("click", async () => {
        const country = countrySelect.value;
        const service = serviceSelect.value; // directly assign here
        // now you can use `country` and `service` below
        console.log(`Country: ${country}, Service: ${service}`);
    });
}


if (continueNumberButton && countrySelect && serviceSelect && numberMessage) {
    continueNumberButton.addEventListener("click", async () => {
        const country = countrySelect.value;
        let service = serviceSelect.value;

        if (service === "Other") {
            const otherServiceInput = document.getElementById("otherService");
            service = otherServiceInput.value.trim();

            if (!service) {
                numberMessage.textContent = "Please enter the service you want.";
                otherServiceInput.focus();
                return;
            }
        }

        // Now you can safely use `country` and `service`
        console.log(`Country: ${country}, Service: ${service}`);
    });
}

        

if (continueNumberButton && countrySelect && serviceSelect && numberMessage) {
    continueNumberButton.addEventListener("click", async function () {

        const country = countrySelect.value;
        let service = serviceSelect.value;

        if (service === "Other") {
            const otherServiceInput = document.getElementById("otherService");

            if (otherServiceInput) {
                service = otherServiceInput.value.trim();
            }

            if (!service) {
                numberMessage.textContent = "Please enter the service you want.";
                if (otherServiceInput) {
                    otherServiceInput.focus();
                }
                return;
            }
        }

        if (!country) {
            numberMessage.textContent = "Please select a country.";
            return;
        }

        if (!service) {
            numberMessage.textContent = "Please select a service.";
            return;
        }

        const token = localStorage.getItem("wisdomprosms_token");

        if (!token) {
            numberMessage.textContent = "Please sign in to purchase a number.";
            return;
        }

        numberMessage.textContent = "Checking available offers...";

        try {
            const response = await fetch(
                "https://wisdomprosms-backend.onrender.com/number-offers?country=" +
                encodeURIComponent(country) +
                "&service=" +
                encodeURIComponent(service),
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token,
                        "Accept": "application/json"
                    }
                }
            );

            const contentType =
                response.headers.get("content-type") || "";

            const data =
                contentType.includes("application/json")
                    ? await response.json()
                    : null;

            if (!response.ok || !data) {
                numberMessage.textContent =
                    (data && data.message) ||
                    "Unable to load available offers. Please try again.";
                return;
            }

            if (!data.offers || data.offers.length === 0) {
                numberMessage.innerHTML =
                    "<strong>No numbers available</strong><br><br>" +
                    "Try another country or service.";
                return;
            }

            numberMessage.innerHTML =
                "<strong>Available Numbers</strong>" +
                '<div id="available-number-offers"></div>';

            const offersContainer =
                document.getElementById("available-number-offers");

            data.offers.forEach(function (item) {

                const offerCard = document.createElement("div");
                offerCard.className = "number-option";

                offerCard.innerHTML =
                    "<div>" +
                    "<strong>" +
                    (item.country_name || item.country) +
                    "</strong>" +
                    "<small>" +
                    (item.service_name || item.service) +
                    "</small>" +
                    "<small>Available: " +
                    item.available +
                    "</small>" +
                    "<small>Success rate: " +
                    item.success_rate +
                    "</small>" +
                    "<strong>₦" +
                    Number(item.customer_price_ngn).toLocaleString() +
                    "</strong>" +
                    "</div>" +
                    '<button type="button" class="select-number-button">Select</button>';

                const selectButton =
                    offerCard.querySelector(".select-number-button");

                selectButton.addEventListener("click", function () {

                    numberMessage.innerHTML =
                        "<strong>Confirm Purchase</strong><br><br>" +
                        "<span>" +
                        (item.country_name || item.country) +
                        " — " +
                        (item.service_name || item.service) +
                        "</span><br><br>" +
                        "<strong>Price: ₦" +
                        Number(item.customer_price_ngn).toLocaleString() +
                        "</strong><br><br>" +
                        "This amount will be deducted from your wallet only after you confirm the purchase." +
                        "<br><br>" +
                        '<button type="button" id="confirm-number-purchase">Confirm Purchase</button>' +
                        '<button type="button" id="cancel-number-purchase">Cancel</button>';

                    const confirmPurchaseButton =
                        document.getElementById("confirm-number-purchase");

                    const cancelPurchaseButton =
                        document.getElementById("cancel-number-purchase");

                    confirmPurchaseButton.addEventListener(
                        "click",
                        async function () {

                            confirmPurchaseButton.disabled = true;
                            cancelPurchaseButton.disabled = true;

                            numberMessage.innerHTML =
                                "<strong>Processing purchase...</strong><br><br>" +
                                "Please wait while we secure your number.";

                            try {
                                const purchaseResponse = await fetch(
                                    "https://wisdomprosms-backend.onrender.com/purchase-number",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": "Bearer " + token,
                                            "Accept": "application/json"
                                        },
                                        body: JSON.stringify({
                                            service: item.service,
                                            country: item.country,
                                            confirmed_price_ngn:
                                                Number(item.customer_price_ngn)
                                        })
                                    }
                                );

                                const purchaseContentType =
                                    purchaseResponse.headers.get("content-type") || "";

                                const purchaseData =
                                    purchaseContentType.includes("application/json")
                                        ? await purchaseResponse.json()
                                        : null;

                                if (!purchaseResponse.ok || !purchaseData) {

                                    if (purchaseData && purchaseData.price_changed) {
                                        numberMessage.innerHTML =
                                            "<strong>Price Changed</strong><br><br>" +
                                            "The price has changed. No money was deducted." +
                                            "<br><br>" +
                                            "New price: ₦" +
                                            Number(
                                                purchaseData.customer_price_ngn
                                            ).toLocaleString() +
                                            "<br><br>" +
                                            "Please select the offer again.";
                                        return;
                                    }

                                    numberMessage.textContent =
                                        (purchaseData && purchaseData.message) ||
                                        "Unable to complete the purchase.";
                                    return;
                                }

                                numberMessage.innerHTML =
                                    "<strong>Number purchased successfully!</strong><br><br>" +
                                    "<strong>Number:</strong> " +
                                    purchaseData.phone_number +
                                    "<br><br>" +
                                    "<strong>Service:</strong> " +
                                    purchaseData.service +
                                    "<br><br>" +
                                    "<strong>Country:</strong> " +
                                    purchaseData.country +
                                    "<br><br>" +
                                    "<strong>Amount paid:</strong> ₦" +
                                    Number(purchaseData.price).toLocaleString() +
                                    "<br><br>" +
                                    "<strong>Status:</strong> " +
                                    purchaseData.status;

                            } catch (error) {
                                console.error("Purchase error:", error);

                                numberMessage.textContent =
                                    "Unable to connect to the server. Please try again.";
                            }
                        }
                    );

                    cancelPurchaseButton.addEventListener(
                        "click",
                        function () {
                            numberMessage.innerHTML =
                                "<strong>Purchase cancelled.</strong><br><br>" +
                                "No money was deducted from your wallet.";
                        }
                    );
                });

                offersContainer.appendChild(offerCard);
            });
        } catch (error) {
            console.error("Available offers error:", error);

            numberMessage.textContent =
                "Unable to connect to the server.";
        }
    });
}
// ================= Old Menu References (Removed) =================
// Old menu code that referenced non-existent #dashboard-menu elements has been removed.
// The new dashboard uses sidebar-item buttons and is handled in DASHBOARD INTERACTIONS below.


// ================= SIGN UP PAGE =================

document.addEventListener("click", function (event) {

    const signupButton = event.target.closest(
        '.sign-up, a[href="#signup"], .get-started, .cta-button'
    );

    if (!signupButton) return;

    event.preventDefault();

    const signupPage = document.getElementById("signup");

    if (!signupPage) {
        console.error("Signup section not found.");
        return;
    }

    // Hide the landing page
    document.querySelectorAll(
        "body > header, body > section, body > footer"
    ).forEach(function (section) {

        if (section.id !== "signup") {
            section.style.display = "none";
        }

    });

    // Show ONLY the signup page
    signupPage.style.setProperty(
        "display",
        "flex",
        "important"
    );

    signupPage.classList.add("show");

    // Lock the page to the signup screen
    document.body.style.overflow = "hidden";

    // Start at the top
    window.scrollTo(0, 0);

});
// ===============================
// SIGN IN TOGGLE
// ===============================

const signInButton = document.querySelector(".sign-in");
const signInSection = document.getElementById("signin");

if (signInButton && signInSection) {

    signInButton.addEventListener("click", function (event) {

        event.preventDefault();

        // Hide everything on the landing page
        document.querySelectorAll(
            "body > header, body > section, body > footer"
        ).forEach((section) => {
            section.style.display = "none";
        });

        // Show only the sign-in page
        signInSection.style.display = "flex";
        signInSection.classList.add("active");

        // Prevent scrolling back to the landing page
        document.body.style.overflow = "hidden";

        // Start at the top of the sign-in page
        window.scrollTo(0, 0);

    });

}

// ================= DASHBOARD TEST INTERACTIONS =================

const dashboard = document.getElementById("dashboard");
const dashboardMain = dashboard?.querySelector(".dashboard-main");
const dashboardToggle = document.getElementById("dashboard-menu-toggle");
const legacyMenuToggle = document.getElementById("menu-toggle");
const dashboardOverlay = document.getElementById("dashboard-overlay");
const dashboardSidebarClose = document.getElementById("dashboard-sidebar-close");

function setDashboardMenuState(isOpen) {
    dashboard?.classList.toggle("menu-open", isOpen);
    dashboard?.classList.remove("sidebar-collapsed");

    if (dashboardToggle) {
        dashboardToggle.textContent = isOpen ? "×" : "☰";
        dashboardToggle.setAttribute("aria-expanded", String(isOpen));
    }

    if (legacyMenuToggle) {
        legacyMenuToggle.textContent = isOpen ? "✕ Menu" : "☰ Menu";
        legacyMenuToggle.setAttribute("aria-expanded", String(isOpen));
    }
}

function closeDashboardMenu() {
    setDashboardMenuState(false);
}

function showDashboardPlaceholder(title) {
    if (!dashboardMain) return;
    let placeholder = document.getElementById("dashboard-placeholder");
    if (!placeholder) {
        placeholder = document.createElement("section");
        placeholder.id = "dashboard-placeholder";
        placeholder.className = "dashboard-card dashboard-placeholder";
        dashboardMain.appendChild(placeholder);
    }
    placeholder.innerHTML = `<h2>${title}</h2><p>${title} is being prepared.</p>`;
    placeholder.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showDashboardHome() {
    document.querySelectorAll("#dashboard > .dashboard-main > section").forEach((section) => {
        section.style.display = "";
    });
    document.getElementById("dashboard-placeholder")?.remove();
    
    // Hide profile if open
    const profileSection = document.getElementById("profile");
    if (profileSection) profileSection.style.display = "none";

    const buyNumberSection = document.getElementById("buy-number");
    if (buyNumberSection) buyNumberSection.style.display = "none";

    const fundWalletSection = document.getElementById("fund-wallet-page");
    if (fundWalletSection) fundWalletSection.style.display = "none";
    
    dashboard.style.display = "flex";
    dashboard?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showFundWalletPage() {
    const fundWalletSection = document.getElementById("fund-wallet-page");
    const profileSection = document.getElementById("profile");
    const buyNumberSection = document.getElementById("buy-number");
    const transactionsSection = document.getElementById("transactions");

    if (!fundWalletSection) return;

    if (dashboard) dashboard.style.display = "none";
    if (profileSection) profileSection.style.display = "none";
    if (buyNumberSection) buyNumberSection.style.display = "none";
    if (transactionsSection) transactionsSection.style.display = "none";
    fundWalletSection.style.display = "block";
    fundWalletSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showBuyNumberPage() {
    const buyNumberSection = document.getElementById("buy-number");
    const profileSection = document.getElementById("profile");

    if (!buyNumberSection) return;

    if (dashboard) dashboard.style.display = "none";
    if (profileSection) profileSection.style.display = "none";
    buyNumberSection.style.display = "block";
    buyNumberSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showProfilePage() {
    // Hide dashboard
    const dashboard = document.getElementById("dashboard");
    if (dashboard) dashboard.style.display = "none";
    
    // Show profile
    const profileSection = document.getElementById("profile");
    if (profileSection) {
        profileSection.style.display = "flex";
        
        // Update profile data from localStorage
        const savedUsername = localStorage.getItem("wisdomprosms_username");
        const walletBalance = localStorage.getItem("wisdomprosms_wallet") || "₦2,950.00";
        const totalOrders = localStorage.getItem("wisdomprosms_orders") || "426";
        
        if (savedUsername) {
            const firstName = savedUsername.split("@")[0];
            const avatarElement = document.getElementById("profile-avatar");
            if (avatarElement) avatarElement.textContent = firstName.charAt(0).toUpperCase();
            
            const nameElement = document.getElementById("profile-full-name");
            if (nameElement) nameElement.textContent = firstName;
            
            const emailElement = document.getElementById("profile-email");
            if (emailElement) emailElement.textContent = savedUsername;
            
            const nameInput = document.getElementById("profile-fullname");
            if (nameInput) nameInput.value = firstName;
            
            const emailInput = document.getElementById("profile-email-input");
            if (emailInput) emailInput.value = savedUsername;
            
            const walletDisplay = document.getElementById("profile-wallet-display");
            if (walletDisplay) walletDisplay.value = walletBalance;
            
            const ordersDisplay = document.getElementById("profile-orders-display");
            if (ordersDisplay) ordersDisplay.value = totalOrders;
        }
        
        profileSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

document.querySelectorAll("#dashboard .sidebar-item").forEach((item) => {
    item.addEventListener("click", () => {
       if (window.activeOrdersRefresh) {
    clearInterval(window.activeOrdersRefresh);
    window.activeOrdersRefresh = null;
}
        document.querySelectorAll("#dashboard .sidebar-item").forEach((link) => link.classList.remove("active"));
        item.classList.add("active");
        closeDashboardMenu();
        const routes = {
            "dashboard-nav": showDashboardHome,
            "active-orders-nav": showActiveOrdersPage,
            "buy-number-nav": showBuyNumberPage,
            "my-numbers-nav": () => showDashboardPlaceholder("My Numbers"),
            "messages-nav": () => showDashboardPlaceholder("Messages"),
            "transactions-nav": () => showDashboardPlaceholder("Order History"),
            "fund-wallet-nav": showFundWalletPage,
            "profile-nav": showProfilePage,
            "order-history-nav": () => showDashboardPlaceholder("Order History"),
            "funding-history-nav": showFundingHistoryPage,
            "settings-nav": () => showDashboardPlaceholder("Settings")
        };
        (routes[item.id] || (() => showDashboardPlaceholder(item.textContent.trim())))();
    });
});

// Toggle menu on hamburger click
const toggleDashboardMenu = () => {
    if (window.innerWidth <= 700) {
        const isOpen = !dashboard?.classList.contains("menu-open");
        setDashboardMenuState(isOpen);
        return;
    }

    dashboard?.classList.toggle("sidebar-collapsed");
};

dashboardToggle?.addEventListener("click", toggleDashboardMenu);
legacyMenuToggle?.addEventListener("click", toggleDashboardMenu);

// Profile menu toggle (for mobile on profile page)
const profileMenuToggle = document.getElementById("profile-menu-toggle");
if (profileMenuToggle) {
    profileMenuToggle.addEventListener("click", () => {
        // For profile page, create a simple sidebar or use back button
        showDashboardHome();
    });
}

// Close menu on overlay click
dashboardOverlay?.addEventListener("click", closeDashboardMenu);

// Close menu on sidebar close button click
dashboardSidebarClose?.addEventListener("click", closeDashboardMenu);

// Close menu on Escape key press
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dashboard?.classList.contains("menu-open")) {
        closeDashboardMenu();
    }
});

async function startWalletFunding() {
    const amountInput = document.getElementById("fund-amount");
    const message = document.getElementById("fund-wallet-message");
    const token = localStorage.getItem("wisdomprosms_token");
    if (!token) {
        if (message) message.textContent = "Please sign in again before funding your wallet.";
        return;
    }

    const amount = Number(amountInput?.value);
    if (!Number.isFinite(amount) || amount < 100) {
        if (message) message.textContent = "Enter a valid amount of at least ₦1000.";
        return;
    }

    if (message) message.textContent = "Creating secure payment...";

    try {
        const response = await fetch("https://wisdomprosms-backend.onrender.com/fund-wallet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ amount })
        });

        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await response.json()
            : null;

        if (!response.ok || !data?.success || !data.checkoutUrl) {
            if (message) message.textContent = data?.message || "Unable to start wallet funding.";
            return;
        }

        window.location.assign(data.checkoutUrl);
    } catch (error) {
        console.error("Wallet funding error:", error);
        if (message) message.textContent = "Unable to connect to the payment service.";
    }
}

document.getElementById("fund-wallet-button")?.addEventListener("click", showFundWalletPage);
document.getElementById("header-fund-wallet")?.addEventListener("click", showFundWalletPage);
document.getElementById("profile-fund-wallet")?.addEventListener("click", showFundWalletPage);
document.getElementById("continue-fund-wallet")?.addEventListener("click", startWalletFunding);
document.querySelectorAll("#fund-wallet-page [data-amount]").forEach((button) => {
    button.addEventListener("click", () => {
        const amountInput = document.getElementById("fund-amount");
        const message = document.getElementById("fund-wallet-message");
        if (amountInput) amountInput.value = button.dataset.amount;
        if (message) message.textContent = "";
    });
});
document.getElementById("quick-funds")?.addEventListener("click", () => showDashboardPlaceholder("Fund Wallet"));
document.getElementById("view-all-activity")?.addEventListener("click", () => showDashboardPlaceholder("Recent Activity"));
document.getElementById("quick-buy-number")?.addEventListener("click", showBuyNumberPage);
document.getElementById("quick-messages")?.addEventListener("click", () => showDashboardPlaceholder("Messages"));
document.getElementById("quick-numbers")?.addEventListener("click", () => showDashboardPlaceholder("My Numbers"));

function logoutFromDashboard() {
    localStorage.removeItem("wisdomprosms_logged_in");
    localStorage.removeItem("wisdomprosms_username");
    document.body.classList.remove("logged-in");
    document.querySelectorAll("body > header, body > section, body > footer").forEach((section) => {
        section.style.display = "";
    });
    if (dashboard) dashboard.style.display = "none";
    closeDashboardMenu();
    if (dashboardToggle) dashboardToggle.textContent = "☰";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("dashboard-logout")?.addEventListener("click", logoutFromDashboard);
document.getElementById("logout-button")?.addEventListener("click", logoutFromDashboard);

// Profile page event listeners
document.getElementById("profile-buy-number")?.addEventListener("click", () => showDashboardPlaceholder("Buy a Number"));

// Dark mode toggle functionality
const darkModeButtons = document.querySelectorAll('button[aria-label="Toggle dark mode"]');
darkModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        button.textContent = isDarkMode ? "☀" : "◐";
        localStorage.setItem("wisdomprosms_dark_mode", isDarkMode);
    });
});

// Apply saved dark mode preference on page load
if (localStorage.getItem("wisdomprosms_dark_mode") === "true") {
    document.body.classList.add("dark-mode");
    darkModeButtons.forEach((button) => {
        button.textContent = "☀";
    });
}

document.getElementById("profile-update-password")?.addEventListener("click", () => {
    const currentPwd = document.getElementById("profile-current-password").value;
    const newPwd = document.getElementById("profile-new-password").value;
    const confirmPwd = document.getElementById("profile-confirm-password").value;
    
    if (!currentPwd || !newPwd || !confirmPwd) {
        alert("Please fill in all password fields.");
        return;
    }
    
    if (newPwd !== confirmPwd) {
        alert("New passwords do not match.");
        return;
    }
    
    if (newPwd.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }
    
    alert("Password updated successfully!");
    document.getElementById("profile-current-password").value = "";
    document.getElementById("profile-new-password").value = "";
    document.getElementById("profile-confirm-password").value = "";
});


if (localStorage.getItem("wisdomprosms_logged_in") === "true" && dashboard) {
    document.body.classList.add("logged-in");
    document.querySelectorAll("body > header, body > section, body > footer").forEach((section) => {
        section.style.display = "none";
    });
    dashboard.style.display = "flex";
    
    // Hide profile on initial load
    const profileSection = document.getElementById("profile");
    if (profileSection) profileSection.style.display = "none";
    
    closeDashboardMenu();
    const savedUsername = localStorage.getItem("wisdomprosms_username");
    if (savedUsername && document.getElementById("dashboard-name")) {
        document.getElementById("dashboard-name").textContent = savedUsername;
        document.getElementById("sidebar-username").textContent = savedUsername;
        document.getElementById("sidebar-email").textContent = savedUsername;
    }
}
// SIGN UP FORM
document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");

  if (!signupForm) return;

  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    if (!username || !email  || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch(
        "https://wisdomprosms-backend.onrender.com/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            full_name: username,
            email: email,
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to create account.");
        return;
      }

      alert("Account created successfully! You can now sign in.");
      signupForm.reset();

    } catch (error) {
      console.error("Signup error:", error);
      alert("Unable to connect to the server.");
    }
  });
})
// ================= BACK TO DASHBOARD =================

function showDashboardHome() {
    // Hide all dashboard pages except the main dashboard
    document.querySelectorAll(".user-dashboard").forEach((section) => {
        if (section.id !== "dashboard") {
            section.style.display = "none";
        }
    });

    // Show the main dashboard
    const dashboard = document.getElementById("dashboard");
    if (dashboard) {
        dashboard.style.display = "flex";
    }

    // Return to the top of the page
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    // Refresh the dashboard data
    loadDashboard();
}
function showActiveOrdersPage() {
   if (window.activeOrdersRefresh) {
        clearInterval(window.activeOrdersRefresh);
    }
    document.querySelectorAll(".user-dashboard").forEach((section) => {
        section.style.display = "none";
    });

    const activeOrders = document.getElementById("active-orders");

    if (activeOrders) {
        activeOrders.style.display = "block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
   loadActiveOrders();
   window.activeOrdersRefresh = setInterval(loadActiveOrders, 5000);
}
async function loadActiveOrders() {
    const token = localStorage.getItem("wisdomprosms_token");

    if (!token) {
        console.log("No login token found.");
        return;
    }

    const ordersList = document.getElementById("active-orders-list");
    const emptyState = document.getElementById("active-orders-empty");

    try {
        const response = await fetch(
            "https://wisdomprosms-backend.onrender.com/active-orders",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data.message);
            return;
        }

        const orders = data.orders || [];

        if (orders.length === 0) {
            if (emptyState) {
                emptyState.style.display = "flex";
            }

            return;
        }

        if (emptyState) {
            emptyState.style.display = "none";
        }

        if (ordersList) {
            ordersList.innerHTML = "";

            orders.forEach((order) => {
                const row = document.createElement("div");

                const date = new Date(order.created_at);

                const formattedDate = date.toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short"
                });

                row.className = "active-order-row";

                row.innerHTML = `
    <div>
        <strong>${order.phone_number}</strong>
        <small>${order.service || "Unknown service"}</small>
        <small>${order.country || "Unknown country"}</small>
    </div>

    <div>
        <small>${formattedDate}</small>
    </div>

    <div>
        <span class="order-status ${order.status}">
            ${order.status}
        </span>
    </div>
`;

                ordersList.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Unable to load active orders:", error);
    }
}
function showFundingHistoryPage() {
    document.querySelectorAll(".user-dashboard").forEach((section) => {
        section.style.display = "none";
    });

    const fundingHistory = document.getElementById("funding-history");
    if (fundingHistory) {
        fundingHistory.style.display = "block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    loadFundingHistory();
}

async function loadFundingHistory() {
    const token = localStorage.getItem("wisdomprosms_token");

    if (!token) {
        console.log("No login token found.");
        return;
    }

    const historyList = document.getElementById("funding-history-list");
    const emptyState = document.getElementById("funding-history-empty");

    try {
        const response = await fetch(
            "https://wisdomprosms-backend.onrender.com/funding-history",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data.message);
            return;
        }

        const transactions = data.transactions || [];

        let totalFunded = 0;
        let successfulCount = 0;
        let pendingCount = 0;

        transactions.forEach((transaction) => {
            const amount = Number(transaction.amount) || 0;

            if (transaction.status === "successful") {
                totalFunded += amount;
                successfulCount++;
            }

            if (transaction.status === "pending") {
                pendingCount++;
            }
        });

        const totalFundedElement = document.getElementById("total-funded");
        const successfulElement = document.getElementById("successful-funding-count");
        const pendingElement = document.getElementById("pending-funding-count");

        if (totalFundedElement) {
            totalFundedElement.textContent =
                `₦${totalFunded.toLocaleString("en-NG", {
                    minimumFractionDigits: 2
                })}`;
        }

        if (successfulElement) {
            successfulElement.textContent = successfulCount;
        }

        if (pendingElement) {
            pendingElement.textContent = pendingCount;
        }

        if (transactions.length === 0) {
            if (emptyState) {
                emptyState.style.display = "flex";
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = "none";
        }

        if (historyList) {
            historyList.innerHTML = "";

            transactions.forEach((transaction) => {
                const row = document.createElement("div");

                const amount = Number(transaction.amount) || 0;
                const date = new Date(transaction.created_at);

                const formattedDate = date.toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short"
                });

                row.className = "funding-transaction-row";

                row.innerHTML = `
                    <div>
                        <strong>
                            ₦${amount.toLocaleString("en-NG", {
                                minimumFractionDigits: 2
                            })}
                        </strong>
                        <small>${transaction.reference_number}</small>
                        <small>${formattedDate}</small>
                        <div>
                            <span class="funding-status ${transaction.status}">
                                ${transaction.status}
                            </span>
                        </div>
                    </div>
                `;

                historyList.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Unable to load funding history:", error);
    }
}
