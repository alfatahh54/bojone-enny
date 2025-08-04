// Countdown Timer
function updateCountdown() {
    const weddingDate = new Date('2025-09-19T14:00:00').getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Scroll to sections
document.querySelector('.scroll-down-btn').addEventListener('click', () => {
    document.querySelector('section:not(.hero-section)').scrollIntoView({ behavior: 'smooth' });
});

// RSVP Form Handling
document.getElementById('rsvpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const attending = document.querySelector('input[name="attendance"]:checked').value;
    const message = document.getElementById('message').value;
    
    const rsvpData = {
        name,
        attending,
        message,
        timestamp: new Date().toISOString()
    };
    
    // In production, this would be an API call to your ExpressJS backend
    fetch('/api/rsvp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpData)
    })
    .then(response => {
        if (response.ok) {
            document.getElementById('rsvpSuccess').classList.remove('hidden');
            document.getElementById('rsvpForm').reset();
            setTimeout(() => {
                document.getElementById('rsvpSuccess').classList.add('hidden');
            }, 3000);
            
            // Refresh RSVP list
            loadRSVPs();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// RSVP List Pagination
let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 1
function loadRSVPs(page=1) {
    // In production, this would be an API call to your ExpressJS backend
    fetch(`/api/rsvp?page=${page}&limit=${itemsPerPage}`)
    .then(response => response.json())
    .then(data => {
        totalPages = data.totalPages
        
        renderRSVPList(data.items);
        updatePaginationControls(data.total, totalPages);
    });
}
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " tahun yang lalu";
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " bulan yang lalu";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " hari yang lalu";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " jam yang lalu";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " menit yang lalu";
    return "Baru saja";
}
function renderRSVPList(items) {
    const rsvpList = document.getElementById('rsvpList');
    rsvpList.innerHTML = '';
    
    if (items.length === 0) {
        rsvpList.innerHTML = '<p class="text-center text-gray-500">Belum ada konfirmasi kehadiran.</p>';
        return;
    }
    
    items.forEach(item => {
        const rsvpItem = document.createElement('div');
        rsvpItem.className = 'mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200';
        rsvpItem.innerHTML = `
            <div class="flex justify-between mb-2">
                <span class="font-bold text-gray-800">${item.name}</span>
                <span class="text-sm ${item.attending ? 'text-green-600' : 'text-red-600'}">
                    ${item.attending  ? 'Hadir' : 'Tidak Hadir'}
                </span>
            </div>
            ${item.message ? `<p class="text-gray-700 italic">"${item.message}"</p>` : ''}
            <p class="text-xs text-gray-500 mt-2">${timeAgo(new Date(item.createdAt))}</p>
        `;
        rsvpList.appendChild(rsvpItem);
    });
}

function updatePaginationControls(totalItems, totalPages) {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages} (${totalItems} total)`;
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadRSVPs(currentPage);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadRSVPs(currentPage);
    }
});

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Tersalin ke clipboard!');
    }).catch(err => {
        console.error('Gagal menyalin: ', err);
    });
}

// Open Map Function
function openMap(type) {
    let url;
    
    if (type === 'akad') {
        // Replace with actual Google Maps URL for Akad location
        url = 'https://maps.app.goo.gl/GTKtb3rDwJF5Fe6k6';
    } else {
        // Replace with actual Google Maps URL for Resepsi location
        url = 'https://maps.app.goo.gl/PFNyKZLTfTpZz3fD8';
    }
    
    window.open(url, '_blank');
}

// Calendar Save Function
document.querySelector('.btn-primary').addEventListener('click', () => {
    const weddingDate = new Date('2023-06-10T08:00:00');
    const event = {
        title: 'Pernikahan John & Jane',
        start: weddingDate,
        end: new Date(weddingDate.getTime() + 4 * 60 * 60 * 1000),
        location: 'Masjid Al-Falah, Jakarta',
        description: 'Acara pernikahan John & Jane. Mohon doa restunya.'
    };
    
    // For Google Calendar
    const googleCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDateForGoogleCal(weddingDate)}/${formatDateForGoogleCal(event.end)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(googleCalUrl, '_blank');
});

function formatDateForGoogleCal(date) {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
}

// Floating hearts click animation
document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('.floral-pattern');
    
    footer.addEventListener('click', function(e) {
        if (e.target === footer) {
            createHeart(e.clientX, e.clientY);
        }
    });
    
    function createHeart(x, y) {
        const heart = document.createElement('div');
        heart.classList.add('heart-click');
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 1000);
    }
    
    // Original floating hearts
    const count = 15;
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.top = Math.random() * 100 + 'vh';
        heart.style.animationDuration = 5 + Math.random() * 15 + 's';
        heart.style.animationDelay = Math.random() * 5 + 's';
        document.body.appendChild(heart);
    }
    // Initial load
    loadRSVPs();
    createHeart();
});

// Add CSS for click hearts
const style = document.createElement('style');
style.textContent = `
    .heart-click {
        position: absolute;
        width: 30px;
        height: 30px;
        background-image: url('https://i.imgur.com/eDpmztW.png');
        background-size: contain;
        background-repeat: no-repeat;
        animation: heartClick 1s ease-out forwards;
        transform: translate(-50%, -50%);
        z-index: 100;
    }
    
    @keyframes heartClick {
        0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -150%) scale(1.2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);