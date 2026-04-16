// DOM Elements
let donorsData = [];
let uniqueAreas = new Set();

const donorsGrid = document.getElementById('donorsGrid');
const emptyMessageDiv = document.getElementById('emptyMessage');
const searchNameInput = document.getElementById('searchName');
const searchAreaSelect = document.getElementById('searchArea');
const searchBloodSelect = document.getElementById('searchBlood');
const resetBtn = document.getElementById('resetFiltersBtn');
const backToTopBtn = document.getElementById('backToTopBtn');

// Typing Animation Text
const textToType = "فصائل دم قرية العامرية";
let index = 0;
const typedTextElement = document.getElementById('typedText');

// Initialize Typing Animation
function typeWriter() {
    if (index < textToType.length) {
        typedTextElement.innerHTML = textToType.substring(0, index + 1);
        index++;
        setTimeout(typeWriter, 100);
    } else {
        // Stop typing and keep cursor
        typedTextElement.style.animation = "blink 0.7s infinite";
    }
}

// Load Donors Data
function loadDonorsData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            donorsData = window.donorsData || [];
            // Extract unique areas
            donorsData.forEach(donor => {
                if (donor.area && donor.area.trim()) {
                    uniqueAreas.add(donor.area);
                }
            });
            updateAreasDropdown();
            resolve();
        }, 1000);
    });
}

// Update Areas Dropdown
function updateAreasDropdown() {
    searchAreaSelect.innerHTML = '<option value="">جميع المناطق</option>';
    const sortedAreas = Array.from(uniqueAreas).sort();
    sortedAreas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        searchAreaSelect.appendChild(option);
    });
}

// Filter and Render Donors
function filterAndRender() {
    const nameQuery = searchNameInput.value.trim().toLowerCase();
    const areaValue = searchAreaSelect.value;
    const bloodValue = searchBloodSelect.value;

    const filtered = donorsData.filter(donor => {
        const nameMatch = nameQuery === "" || donor.name.toLowerCase().includes(nameQuery);
        const areaMatch = areaValue === "" || donor.area === areaValue;
        const bloodMatch = bloodValue === "" || donor.bloodType === bloodValue;
        return nameMatch && areaMatch && bloodMatch;
    });

    if (filtered.length === 0) {
        donorsGrid.innerHTML = '';
        emptyMessageDiv.classList.remove('hidden');
        return;
    }

    emptyMessageDiv.classList.add('hidden');
    renderCardsWithAnimation(filtered);
}

// Render Cards with Animation
function renderCardsWithAnimation(donorsArray) {
    donorsGrid.innerHTML = '';
    donorsArray.forEach((donor, idx) => {
        const card = createDonorCard(donor);
        card.style.animation = `fadeInUp 0.5s ease-out ${idx * 0.05}s forwards`;
        card.style.opacity = '0';
        donorsGrid.appendChild(card);
    });
}

// Create Donor Card
function createDonorCard(donor) {
    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl overflow-hidden shadow-lg card";

    const bloodColors = {
        'A+': 'bg-green-100 text-green-800',
        'A-': 'bg-green-100 text-green-800',
        'B+': 'bg-blue-100 text-blue-800',
        'B-': 'bg-blue-100 text-blue-800',
        'AB+': 'bg-purple-100 text-purple-800',
        'AB-': 'bg-purple-100 text-purple-800',
        'O+': 'bg-red-100 text-red-800',
        'O-': 'bg-red-100 text-red-800'
    };

    const bloodColor = bloodColors[donor.bloodType] || 'bg-gray-100 text-gray-800';

    const imgSrc = donor.image || `https://randomuser.me/api/portraits/${donor.id % 2 === 0 ? 'women' : 'men'}/${donor.id % 70}.jpg`;

    const phoneId = `phone-${donor.id}-${Date.now()}-${Math.random()}`;
    const callId = `call-${donor.id}-${Date.now()}-${Math.random()}`;

    card.innerHTML = `
        <div class="relative h-48 overflow-hidden">
            <img class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                 src="${imgSrc}" alt="${donor.name}"
                 onerror="this.src='https://via.placeholder.com/400x300?text=تبرع+بالدم'">
            <div class="absolute top-2 right-2">
                <span class="blood-badge px-3 py-1 rounded-full text-xs font-bold ${bloodColor} shadow-lg">
                    <i class="fas fa-tint ml-1"></i>${donor.bloodType}
                </span>
            </div>
        </div>
        <div class="p-5">
            <h3 class="text-xl font-bold text-gray-800 mb-2">
                <i class="fas fa-user ml-2 text-crimson"></i>${escapeHtml(donor.name)}
            </h3>
            <div class="flex items-center text-gray-600 text-sm mb-4">
                <i class="fas fa-map-marker-alt ml-2 text-crimson"></i>
                <span>${escapeHtml(donor.area)}</span>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-200">
                <div id="${phoneId}" class="phone-hidden text-sm bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition text-center">
                    <i class="fas fa-lock ml-1"></i>
                    <span>🔒 رقم مخفي (اضغط للكشف)</span>
                </div>
                <div id="${callId}" class="hidden mt-2"></div>
            </div>
        </div>
    `;

    // Phone reveal logic
    setTimeout(() => {
        const phoneContainer = document.getElementById(phoneId);
        const callContainer = document.getElementById(callId);

        if (phoneContainer) {
            phoneContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                const password = prompt("🔐 أدخل كلمة المرور لعرض رقم الهاتف:");
                if (password === "hassan1234") {
                    phoneContainer.innerHTML = `
                        <i class="fas fa-phone ml-1 text-green-600"></i>
                        <span dir="ltr" class="font-mono font-bold">${donor.phone}</span>
                    `;
                    phoneContainer.classList.remove('cursor-pointer', 'bg-gray-100', 'hover:bg-gray-200');
                    phoneContainer.classList.add('bg-green-50');
                    callContainer.innerHTML = `
                        <a href="tel:+2${donor.phone.replace(/\D/g, '')}" 
                           class="call-btn inline-flex items-center justify-center w-full gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300">
                            <i class="fas fa-phone-alt"></i>
                            <span>اتصل الآن</span>
                        </a>
                    `;
                    callContainer.classList.remove('hidden');
                    callContainer.classList.add('phone-reveal');
                } else if (password !== null) {
                    alert("❌ كلمة المرور غير صحيحة! الرقم السري هو: 1234");
                }
            });
        }
    }, 0);

    return card;
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Back to Top
function initBackToTop() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.remove('opacity-0', 'invisible');
            backToTopBtn.classList.add('opacity-100', 'visible');
        } else {
            backToTopBtn.classList.add('opacity-0', 'invisible');
            backToTopBtn.classList.remove('opacity-100', 'visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Event Listeners
function initEventListeners() {
    searchNameInput.addEventListener('input', filterAndRender);
    searchAreaSelect.addEventListener('change', filterAndRender);
    searchBloodSelect.addEventListener('change', filterAndRender);
    resetBtn.addEventListener('click', () => {
        searchNameInput.value = '';
        searchAreaSelect.value = '';
        searchBloodSelect.value = '';
        filterAndRender();
    });
}

// Initialize App
async function init() {
    await loadDonorsData();
    initEventListeners();
    initBackToTop();
    typeWriter();
    filterAndRender();

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true
    });
}

// Start the application
document.addEventListener('DOMContentLoaded', init);