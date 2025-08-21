document.addEventListener("DOMContentLoaded", () => {
    let monthlyChartInstance = null;

    // Get current user email for per-user storage
    const currentUser = localStorage.getItem("userEmail");    // Reads user's email
    if (!currentUser) {
        // If no user is logged in, send them to login page
        window.location.href = "login.html";
        return;
    }
    const userKey = `financeData_${currentUser}`;

    // Show a specific section
    window.showSection = function (section) {
        document.getElementById("entrySection").style.display = "none";
        document.getElementById("analyticsSection").style.display = "none";
        document.getElementById("profileSection").style.display = "none";
        document.getElementById(section + "Section").style.display = "flex";

        if (section === 'profile') loadProfile();
        if (section === 'analytics') setTimeout(fetchAndRenderAnalytics, 50);
    };

    // Load Profile Data
    function loadProfile() {
        const data = JSON.parse(localStorage.getItem("userData"));
        if (!data) return;
        document.getElementById("profileName").textContent = data.name;
        document.getElementById("profileEmail").textContent = data.email;
        document.getElementById("profileDOB").textContent = data.dob;
        document.getElementById("profileAddress").textContent = data.address;
        document.getElementById("profileInitial").textContent = data.name.charAt(0).toUpperCase();
    }

    // Fetch and Render Analytics Graph
    function fetchAndRenderAnalytics() {
        const financeData = JSON.parse(localStorage.getItem(userKey)) || [];
        if (!financeData.length) {
            alert("No data available.");
            return;
        }

        const labels = financeData.map(d => `${d.month} ${d.year}`);
        const ctx = document.getElementById('monthlyChart').getContext('2d');

        if (monthlyChartInstance) monthlyChartInstance.destroy();

        monthlyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Remaining', data: financeData.map(d => d.income - d.expenses - d.extra - d.savings), backgroundColor: '#28a745' },
                    { label: 'Savings', data: financeData.map(d => d.savings), backgroundColor: '#17a2b8' },
                    { label: 'Extra Expenses', data: financeData.map(d => d.extra), backgroundColor: '#dc3545' },
                    { label: 'Needy Expenses', data: financeData.map(d => d.expenses), backgroundColor: '#ffc107' }
                ]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    // Live Remaining Calculation
    ['income', 'expenses', 'extra', 'savings'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const income = +document.getElementById('income').value || 0;
            const expenses = +document.getElementById('expenses').value || 0;
            const extra = +document.getElementById('extra').value || 0;
            const savings = +document.getElementById('savings').value || 0;
            document.getElementById('remaining').textContent = `₹${income - (expenses + extra + savings)}`;
        });
    });

    // Save Data
    document.getElementById('saveDataBtn').addEventListener('click', () => {
        const income = parseFloat(document.getElementById('income').value);
        const expenses = parseFloat(document.getElementById('expenses').value);
        const extra = parseFloat(document.getElementById('extra').value);
        const savings = parseFloat(document.getElementById('savings').value);

        if ([income, expenses, extra, savings].some(val => isNaN(val))) {
            alert('Please fill all fields with numbers');
            return;
        }

        const payload = {
            income,
            expenses,
            extra,
            savings,
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear()
        };

        let financeData = JSON.parse(localStorage.getItem(userKey)) || [];
        financeData.push(payload);
        localStorage.setItem(userKey, JSON.stringify(financeData));

        showSection('analytics');
    });

    // Back from analytics to entry
    document.getElementById('backBtn').addEventListener('click', () => {
        showSection('entry');
    });

    // Add new month (clear form fields)
        document.getElementById('nextMonthBtn').addEventListener('click', () => {
        document.getElementById('income').value = '';
        document.getElementById('expenses').value = '';
        document.getElementById('extra').value = '';
        document.getElementById('savings').value = '';
        document.getElementById('remaining').textContent = '₹0';
        showSection('entry');
    });

    // Back from profile to entry
    document.getElementById('profileBackBtn').addEventListener('click', () => {
        showSection('entry');
    });
});
