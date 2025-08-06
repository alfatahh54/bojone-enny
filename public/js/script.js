// Ambil tombol untuk membuka popup
const qrCodeButton = document.getElementById('qr-code-button');

// Ambil popup dan konten popup
const qrCodePopup = document.getElementById('qr-code-popup');
const qrCodeContent = document.querySelector('.popup-content');

// Ambil elemen untuk menampilkan QR code
const qrCodeImage = document.getElementById('qr-code-image');
const btnSaveToCalendar = document.getElementById('save-to-calendar');

// Fungsi untuk membuat QR code
function makeQrCode(text) {
  qrCodeImage.innerHTML = '';
  new QRCode(qrCodeImage, {
    text: text,
    width: 200,
    height: 200,
    colorDark: '#000',
    colorLight: '#fff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

function randomizeString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
// Fungsi untuk membuka popup
function openPopup() {
  qrCodePopup.style.display = 'block';
  const urlParams = new URLSearchParams(window.location.search);
  let guestLocale = localStorage.getItem('guest');
  const guestName = urlParams.get('to');
  const id = randomizeString(8);
  if (!guestLocale || (guestLocale && guestLocale.split('|')[1] !== guestName)) {
    localStorage.setItem('guest', `${id}|${guestName}`);
    guestLocale = `${id}|${guestName}`;
  }
  makeQrCode(`${id}|${guestName}`);
}

// Fungsi untuk menutup popup
function closePopup() {
  qrCodePopup.style.display = 'none';
}

// Tambahkan event listener untuk tombol membuka popup
qrCodeButton.addEventListener('click', openPopup);

// Tambahkan event listener untuk tombol menutup popup
document.querySelector('.close').addEventListener('click', closePopup);

// Tambahkan event listener untuk klik di luar popup
window.addEventListener('click', (e) => {
  if (e.target === qrCodePopup) {
    closePopup();
  }
});
let countdownInterval;
// Countdown Timer
function updateCountdown() {
    const weddingDate = new Date('2025-08-06T14:00:00').getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        btnSaveToCalendar.classList.add('hidden');
        qrCodeButton.classList.remove('hidden');
        return;
    } else if (distance < 7200000) {
        btnSaveToCalendar.classList.add('hidden');
        qrCodeButton.classList.remove('hidden');
    }
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

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
    pageInfo.textContent = `${currentPage} / ${totalPages ?? 1}`;
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('flex');
    
    setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('flex');
    }, 3000);
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
        showToast('Tersalin ke clipboard!');
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

// Music Player
const backgroundMusic = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const musicBalloon = document.getElementById('music-balloon');

let isPlaying = false;

// Function to toggle music play/pause
function toggleMusic() {
    if (isPlaying) {
        backgroundMusic.pause();
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        musicBalloon.classList.remove('playing');
    } else {
        backgroundMusic.play().catch(error => {
            console.error("Autoplay prevented:", error);
            // Optionally, show a message to the user to click to play music
        });
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        musicBalloon.classList.add('playing');
    }
    isPlaying = !isPlaying;
}

// Event listener for music toggle button
musicToggle.addEventListener('click', toggleMusic);

// Play music automatically when the invitation is opened
document.getElementById('open-invitation-button').addEventListener('click', function() {
    // Show music balloon
    musicBalloon.classList.remove('hidden');

    // Attempt to play music
    backgroundMusic.play().then(() => {
        isPlaying = true;
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        musicBalloon.classList.add('playing');
    }).catch(error => {
        console.error("Autoplay prevented:", error);
        // If autoplay is prevented, ensure the play icon is visible
        isPlaying = false;
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    });
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

// Floating hearts click animation
document.addEventListener('DOMContentLoaded', function() {
    countdownInterval = setInterval(updateCountdown, 1000);
    // updateCountdown();

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
    
    // Initial load
    loadRSVPs();
    createHeart();

    // Get guest name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    const guestNameElement = document.getElementById('guest-name');
    const invitationSection = document.getElementById('invitation-section');
    const openInvitationButton = document.getElementById('open-invitation-button');

    // Get all sections that should be hidden initially
    const hiddenSections = document.querySelectorAll('body > div > section:not(#invitation-section), footer');

    if (guestName) {
        guestNameElement.textContent = guestName;
    } else {
        guestNameElement.textContent = 'Tamu Undangan'; // Default if 'to' parameter is not present
    }
    if(screen.width >= 768){
        openInvitationButton.classList.add('hidden');   
        hiddenSections.forEach(section => {
            section.classList.remove('hidden'); // Show all other sections
        });
        // playIcon.classList.add('hidden');
        // pauseIcon.classList.remove('hidden');
        
        musicBalloon.classList.remove('hidden');
        // backgroundMusic.play().catch(error => {
        //     console.error("Autoplay prevented:", error);
        //     // Optionally, show a message to the user to click to play music
        // });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        openInvitationButton.classList.remove('hidden');
    }
    openInvitationButton.addEventListener('click', () => {
        invitationSection.classList.add('hidden'); // Hide the invitation section
        hiddenSections.forEach(section => {
            section.classList.remove('hidden'); // Show all other sections
        });
        // Optional: Scroll to the top or to the hero section
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
