// DOM Elements
let donorsData = [];
let uniqueAreas = new Set();
let googleSheetsAPI = null;
let useGoogleSheets = false;

const donorsGrid = document.getElementById('donorsGrid');
const emptyMessageDiv = document.getElementById('emptyMessage');
const searchNameInput = document.getElementById('searchName');
const searchAreaSelect = document.getElementById('searchArea');
const searchBloodSelect = document.getElementById('searchBlood');
const resetBtn = document.getElementById('resetFiltersBtn');
const backToTopBtn = document.getElementById('backToTopBtn');
const addDonorBtn = document.getElementById('addDonorBtn');
const addDonorModal = document.getElementById('addDonorModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const addDonorForm = document.getElementById('addDonorForm');
const donorAreaSelect = document.getElementById('donorArea');
const formMessage = document.getElementById('formMessage');
const submitDonorBtn = document.getElementById('submitDonorBtn');
const toastContainer = document.getElementById('toastContainer');

// Area Modal Elements
const addAreaBtn = document.getElementById('addAreaBtn');
const addAreaModal = document.getElementById('addAreaModal');
const closeAreaModalBtn = document.getElementById('closeAreaModalBtn');
const cancelAreaModalBtn = document.getElementById('cancelAreaModalBtn');
const addAreaForm = document.getElementById('addAreaForm');
const newAreaNameInput = document.getElementById('newAreaName');
const areaFormMessage = document.getElementById('areaFormMessage');
const submitAreaBtn = document.getElementById('submitAreaBtn');

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
        typedTextElement.style.animation = "blink 0.7s infinite";
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.className = `${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideInRight`;
    toast.innerHTML = `
        <i class="fas ${icon} text-xl"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-fadeOut');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Show Form Message
function showFormMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.className = `p-3 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    formMessage.classList.remove('hidden');
}

function hideFormMessage() {
    formMessage.classList.add('hidden');
}

// Modal Functions
function openModal() {
    addDonorModal.classList.remove('hidden');
    addDonorModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    // Focus first input
    setTimeout(() => document.getElementById('donorName').focus(), 100);
}

function closeModal() {
    addDonorModal.classList.add('hidden');
    addDonorModal.classList.remove('flex');
    document.body.style.overflow = '';
    addDonorForm.reset();
    hideFormMessage();
    populateAreaDropdown();
}

// Populate Area Dropdown in Modal
function populateAreaDropdown() {
    const currentValue = donorAreaSelect.value;
    donorAreaSelect.innerHTML = '<option value="">اختر المنطقة أو اكتبها</option>';
    const sortedAreas = Array.from(uniqueAreas).sort();
    sortedAreas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        donorAreaSelect.appendChild(option);
    });
    // Restore value if it exists in the list
    if (sortedAreas.includes(currentValue)) {
        donorAreaSelect.value = currentValue;
    }
}

// Load saved areas from localStorage
function loadSavedAreas() {
    try {
        const saved = localStorage.getItem('bloodDonorAreas');
        if (saved) {
            const areas = JSON.parse(saved);
            areas.forEach(area => uniqueAreas.add(area));
        }
    } catch (e) {
        console.warn('Could not load saved areas:', e);
    }
}

// Save areas to localStorage
function saveAreas() {
    try {
        const areas = Array.from(uniqueAreas).sort();
        localStorage.setItem('bloodDonorAreas', JSON.stringify(areas));
    } catch (e) {
        console.warn('Could not save areas:', e);
    }
}

// Show Area Form Message
function showAreaFormMessage(message, isError = false) {
    areaFormMessage.textContent = message;
    areaFormMessage.className = `p-3 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    areaFormMessage.classList.remove('hidden');
}

function hideAreaFormMessage() {
    areaFormMessage.classList.add('hidden');
}

// Area Modal Functions
function openAreaModal() {
    addAreaModal.classList.remove('hidden');
    addAreaModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    hideAreaFormMessage();
    setTimeout(() => newAreaNameInput.focus(), 100);
}

function closeAreaModal() {
    addAreaModal.classList.add('hidden');
    addAreaModal.classList.remove('flex');
    document.body.style.overflow = '';
    addAreaForm.reset();
    hideAreaFormMessage();
}

// Handle Add Area Form Submit
function handleAddArea(e) {
    e.preventDefault();
    
    const areaName = newAreaNameInput.value.trim();
    
    if (!areaName) {
        showAreaFormMessage('اسم المنطقة مطلوب', true);
        return;
    }
    
    // Check if area already exists
    if (uniqueAreas.has(areaName)) {
        showAreaFormMessage('هذه المنطقة موجودة بالفعل', true);
        return;
    }
    
    // Add to uniqueAreas
    uniqueAreas.add(areaName);
    
    // Save to localStorage
    saveAreas();
    
    // Update both dropdowns
    updateAreasDropdown();
    populateAreaDropdown();
    
    // Select the new area in the donor form
    donorAreaSelect.value = areaName;
    
    showToast(`تم إضافة المنطقة "${areaName}" بنجاح`, 'success');
    closeAreaModal();
}

// Load Donors Data
async function loadDonorsData() {
    try {
        // Load saved areas first
        loadSavedAreas();
        
        // Check if Google Sheets API is configured
        if (window.GOOGLE_SHEETS_CONFIG && window.GOOGLE_SHEETS_CONFIG.apiUrl && 
            window.GOOGLE_SHEETS_CONFIG.apiUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            
            googleSheetsAPI = new window.GoogleSheetsAPI(window.GOOGLE_SHEETS_CONFIG);
            useGoogleSheets = true;
            
            // Show loading indicator
            donorsGrid.innerHTML = '<div class="loader col-span-full"></div>';
            
            donorsData = await googleSheetsAPI.getDonors();
            showToast('تم تحميل البيانات من Google Sheets', 'success');
        } else {
            // Fallback to local data
            useGoogleSheets = false;
            donorsData = window.donorsData || [];
            showToast('جاري استخدام البيانات المحلية (لم يتم إعداد Google Sheets)', 'info');
        }
        
        // Extract unique areas from donors data
        donorsData.forEach(donor => {
            if (donor.area && donor.area.trim()) {
                uniqueAreas.add(donor.area);
            }
        });
        
        // Save combined areas to localStorage
        saveAreas();
        
        updateAreasDropdown();
        populateAreaDropdown();
        
    } catch (error) {
        console.error('Error loading donors:', error);
        showToast('فشل في تحميل البيانات، جاري استخدام البيانات المحلية', 'error');
        
        // Fallback to local data
        useGoogleSheets = false;
        donorsData = window.donorsData || [];
        donorsData.forEach(donor => {
            if (donor.area && donor.area.trim()) {
                uniqueAreas.add(donor.area);
            }
        });
        
        // Load saved areas and save combined
        loadSavedAreas();
        saveAreas();
        
        updateAreasDropdown();
        populateAreaDropdown();
    }
}

// Update Areas Dropdown (Search Section)
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

// Handle Add Donor Form Submit
async function handleAddDonor(e) {
    e.preventDefault();
    
    const formData = new FormData(addDonorForm);
    const donorData = {
        name: formData.get('name').trim(),
        area: formData.get('area').trim(),
        bloodType: formData.get('bloodType'),
        phone: formData.get('phone').trim(),
        image: formData.get('image').trim() || 'https://img.icons8.com/?size=100&id=11178&format=png&color=000000'
    };

    // Validation
    if (!donorData.name) {
        showFormMessage('الاسم مطلوب', true);
        return;
    }
    if (!donorData.bloodType) {
        showFormMessage('فصيلة الدم مطلوبة', true);
        return;
    }

    // Disable submit button
    submitDonorBtn.disabled = true;
    submitDonorBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-1"></i><span>جاري الحفظ...</span>';

    try {
        let newDonor;
        
        if (useGoogleSheets && googleSheetsAPI) {
            newDonor = await googleSheetsAPI.addDonor(donorData);
            
            // Verify by refetching data
            if (newDonor && newDonor.id) {
                donorsData = await googleSheetsAPI.getDonors(false); // force refresh
                showToast('تم إضافة المتبرع بنجاح إلى Google Sheets', 'success');
            } else {
                throw new Error('لم يتم إرجاع معرف للمتبرع المضاف');
            }
        } else {
            // Local fallback - add to memory only
            const newId = donorsData.length > 0 ? Math.max(...donorsData.map(d => d.id)) + 1 : 1;
            newDonor = { id: newId, ...donorData };
            donorsData.push(newDonor);
            showToast('تم إضافة المتبرع محلياً (غير محفوظ في Google Sheets)', 'info');
        }

        // Update unique areas
        if (newDonor.area && newDonor.area.trim()) {
            uniqueAreas.add(newDonor.area);
        }
        
        updateAreasDropdown();
        populateAreaDropdown();
        
        // Close modal and refresh
        closeModal();
        filterAndRender();
        
    } catch (error) {
        console.error('Error adding donor:', error);
        showFormMessage('فشل في إضافة المتبرع: ' + error.message, true);
        showToast('فشل في إضافة المتبرع', 'error');
    } finally {
        submitDonorBtn.disabled = false;
        submitDonorBtn.innerHTML = '<i class="fas fa-save"></i><span>حفظ المتبرع</span>';
    }
}

// Event Listeners
function initEventListeners() {
    // Search filters
    searchNameInput.addEventListener('input', filterAndRender);
    searchAreaSelect.addEventListener('change', filterAndRender);
    searchBloodSelect.addEventListener('change', filterAndRender);
    resetBtn.addEventListener('click', () => {
        searchNameInput.value = '';
        searchAreaSelect.value = '';
        searchBloodSelect.value = '';
        filterAndRender();
    });

    // Modal events
    addDonorBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    addDonorForm.addEventListener('submit', handleAddDonor);

    // Area Modal events
    addAreaBtn.addEventListener('click', openAreaModal);
    closeAreaModalBtn.addEventListener('click', closeAreaModal);
    cancelAreaModalBtn.addEventListener('click', closeAreaModal);
    addAreaForm.addEventListener('submit', handleAddArea);

    // Close modal on backdrop click
    addDonorModal.addEventListener('click', (e) => {
        if (e.target === addDonorModal) {
            closeModal();
        }
    });

    addAreaModal.addEventListener('click', (e) => {
        if (e.target === addAreaModal) {
            closeAreaModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!addDonorModal.classList.contains('hidden')) {
                closeModal();
            }
            if (!addAreaModal.classList.contains('hidden')) {
                closeAreaModal();
            }
        }
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