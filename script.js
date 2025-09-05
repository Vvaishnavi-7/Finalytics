document.addEventListener("DOMContentLoaded", () => {
    let monthlyChartInstance = null;

    // Get current user
    const currentUser = localStorage.getItem("userEmail");
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }
    const userKey = `financeData_${currentUser}`;

    // === SECTION SWITCHER ===
    window.showSection = function (section) {
        document.getElementById("entrySection").style.display = "none";
        document.getElementById("analyticsSection").style.display = "none";
        document.getElementById("profileSection").style.display = "none";
        document.getElementById("settingsSection").style.display = "none";

        document.getElementById(section + "Section").style.display = "flex";

        if (section === "profile") loadProfile();
        if (section === "analytics") setTimeout(fetchAndRenderAnalytics, 50);
    };

    // === PROFILE LOADER ===
    function loadProfile() {
        const data = JSON.parse(localStorage.getItem("userData"));
        if (!data) return;
        document.getElementById("profileName").textContent = data.name;
        document.getElementById("profileEmail").textContent = data.email;
        document.getElementById("profileDOB").textContent = data.dob;
        document.getElementById("profileAddress").textContent = data.address;
        document.getElementById("profileInitial").textContent =
            data.name.charAt(0).toUpperCase();
    }

    // === CURRENCY HANDLER ===
    function getCurrencySymbol() {
        return localStorage.getItem("currency") || "₹";
    }

    // === ANALYTICS GRAPH ===
    function fetchAndRenderAnalytics() {
        const financeData = JSON.parse(localStorage.getItem(userKey)) || [];
        if (!financeData.length) {
            alert("No data available.");
            return;
        }

        const labels = financeData.map((d) => `${d.month} ${d.year}`);
        const ctx = document.getElementById("monthlyChart").getContext("2d");

        if (monthlyChartInstance) monthlyChartInstance.destroy();

        monthlyChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Savings",
                        data: financeData.map((d) => d.savings),
                        backgroundColor: "#17a2b8",
                    },
                    {
                        label: "Extra Expenses",
                        data: financeData.map((d) => d.extra),
                        backgroundColor: "#dc3545",
                    },
                    {
                        label: "Needy Expenses",
                        data: financeData.map((d) => d.expenses),
                        backgroundColor: "#ffc107",
                    },
                    {
                        label: "Remaining",
                        data: financeData.map(
                            (d) =>
                                d.income - d.expenses - d.extra - d.savings
                        ),
                        backgroundColor: "#28a745",
                    },
                ],
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } },
        });
    }

    // === LIVE REMAINING CALCULATION ===
    ["income", "expenses", "extra", "savings"].forEach((id) => {
        document.getElementById(id).addEventListener("input", () => {
            const income = +document.getElementById("income").value || 0;
            const expenses = +document.getElementById("expenses").value || 0;
            const extra = +document.getElementById("extra").value || 0;
            const savings = +document.getElementById("savings").value || 0;
            const currency = getCurrencySymbol();
            document.getElementById(
                "remaining"
            ).textContent = `${currency}${income - (expenses + extra + savings)}`;
        });
    });

    // === SAVE DATA ===
    document.getElementById("saveDataBtn").addEventListener("click", () => {
        const incomeEl = document.getElementById("income");
        const expensesEl = document.getElementById("expenses");
        const extraEl = document.getElementById("extra");
        const savingsEl = document.getElementById("savings");

        let income = parseFloat(incomeEl.value);
        let expenses = parseFloat(expensesEl.value);
        let extra = parseFloat(extraEl.value);
        let savings = parseFloat(savingsEl.value);

        if ([income, expenses, extra, savings].some((val) => isNaN(val))) {
            alert("Please fill all fields with numbers");
            return;
        }

        if (income < 0 || expenses < 0 || extra < 0 || savings < 0) {
            alert("Values cannot be negative.");
            return;
        }

        if (income < expenses + extra + savings) {
            alert("Total expenses + savings cannot exceed income!");
            return;
        }

        const payload = {
            income,
            expenses,
            extra,
            savings,
            month: new Date().toLocaleString("default", { month: "long" }),
            year: new Date().getFullYear(),
        };

        let financeData = JSON.parse(localStorage.getItem(userKey)) || [];
        financeData.push(payload);
        localStorage.setItem(userKey, JSON.stringify(financeData));

        showSection("analytics");
    });

    // === BUTTON HANDLERS ===
    document.getElementById("backBtn").addEventListener("click", () => {
        showSection("entry");
    });

    document.getElementById("nextMonthBtn").addEventListener("click", () => {
        document.getElementById("income").value = "";
        document.getElementById("expenses").value = "";
        document.getElementById("extra").value = "";
        document.getElementById("savings").value = "";
        document.getElementById("remaining").textContent = getCurrencySymbol() + "0";
        showSection("entry");
    });

    document.getElementById("profileBackBtn").addEventListener("click", () => {
        showSection("entry");
    });

    document.getElementById("settingsBackBtn").addEventListener("click", () => {
        showSection("entry");
    });

    // === LOGOUT ===
    window.logout = function () {
        localStorage.clear();
        window.location.href = "login.html";
    };

    // ===============================
    // SETTINGS: THEME, CURRENCY, NOTIFS
    // ===============================
    const themeToggle = document.getElementById("themeToggle");

    // Load settings
    (function loadSettings() {
        let savedTheme = localStorage.getItem("theme") || "dark"; // default dark
        applyTheme(savedTheme);

        themeToggle.checked = savedTheme === "dark";

        if (localStorage.getItem("currency")) {
            document.getElementById("currencySelector").value =
                localStorage.getItem("currency");
        }
        if (localStorage.getItem("notifications") === "on") {
            document.getElementById("notifToggle").checked = true;
        }
    })();

    // Apply theme function
    function applyTheme(theme) {
        document.body.classList.remove("dark-theme", "light-theme");
        document.body.classList.add(theme + "-theme");
        localStorage.setItem("theme", theme);
    }

    // Theme toggle
    themeToggle.addEventListener("change", (e) => {
        if (e.target.checked) {
            applyTheme("dark");
        } else {
            applyTheme("light");
        }
    });

    // Currency
    document
        .getElementById("currencySelector")
        .addEventListener("change", (e) => {
            localStorage.setItem("currency", e.target.value);
            alert("Currency changed to " + e.target.value);
        });

    // Notifications
    document.getElementById("notifToggle").addEventListener("change", (e) => {
        localStorage.setItem(
            "notifications",
            e.target.checked ? "on" : "off"
        );
        alert("Notifications " + (e.target.checked ? "enabled" : "disabled"));
    });
});
