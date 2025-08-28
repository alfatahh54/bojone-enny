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
  const guestFrom = urlParams.get('from');
  const id = randomizeString(8);
  if (!guestLocale || (guestLocale && guestLocale.split('|')[1] !== guestName)) {
    localStorage.setItem('guest', `${guestName}|${guestFrom}`);
    guestLocale = `${guestName}|${guestFrom}`;
  }
  makeQrCode(guestLocale);
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
    const weddingDate = new Date('2025-09-28T14:00:00').getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    if (distance < 0) {
        clearInterval(countdownInterval);
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
    // toast.classList.add('flex');
    
    setTimeout(() => {
        toast.classList.add('hidden');
        // toast.classList.remove('flex');
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
document.querySelector('#save-to-calendar').addEventListener('click', () => {
    const weddingDate = new Date('2025-09-28T14:00:00');
    const event = {
        title: 'Pernikahan Alfatah & Anggreyni',
        start: weddingDate,
        end: new Date(weddingDate.getTime() + 3 * 60 * 60 * 1000),
        location: 'Kampung Kecil Sawangan, Jl. Raya Sawangan No.81, RT.1/RW.9, Mampang, Kec. Pancoran Mas, Kota Depok, Jawa Barat 16511',
        description: 'Acara pernikahan Alfatah & Anggreyni. Mohon doa restunya.'
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
        isPlaying = !isPlaying;
    } else {
        backgroundMusic.play().then(() => {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            musicBalloon.classList.add('playing');
            isPlaying = !isPlaying;
        }).catch(error => {
            console.error("Autoplay prevented:", error);
            // Optionally, show a message to the user to click to play music
        });
    }
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

function createPetal() {
    const petal = document.createElement('div');
    petal.className = 'petal';
    // Mengatur ukuran acak untuk kelopak
    petal.style.backgroundImage = `url("../assets/petal-${Math.floor(Math.random() * 3) + 1}.png")`;
    petal.style.top = 0
    const size = Math.random() * 10 + 10; // Ukuran antara 10px hingga 20px
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    // Mengatur posisi horizontal kelopak
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = Math.random() * 5 + 10 + 's'; // Durasi acak antara 10-15 detik
    document.getElementById('petal-container').appendChild(petal);
    // Hapus kelopak setelah animasi selesai
    petal.addEventListener('animationend', () => {
        petal.remove();
    });
}

function generaterandomno(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

// Floating hearts click animation
document.addEventListener('DOMContentLoaded', function() {
    countdownInterval = setInterval(updateCountdown, 1000);

    // Setup Intersection Observer untuk animasi scroll-trigger
    const observerOptions = {
        threshold: 0.1,
        // rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            } else {
                entry.target.classList.remove('animate-in');
            }
        });
    }, observerOptions);

    // Target semua elemen yang perlu animasi
    const animatedElements = document.querySelectorAll('.section-animate, .slide-left, .slide-right');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Buat kelopak setiap 1000ms
    setInterval(createPetal, 3000);

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
    const formName = document.getElementById('name');
    const invitationSection = document.getElementById('invitation-section');
    const openInvitationButton = document.getElementById('open-invitation-button');

    // Get all sections that should be hidden initially
    const hiddenSections = document.querySelectorAll('body > div > section:not(#invitation-section), footer, #hidden-section');

    if (guestName) {
        guestNameElement.textContent = guestName;
        formName.value = guestName;
    } else {
        guestNameElement.textContent = 'Tamu Undangan'; // Default if 'to' parameter is not present
    }
    openInvitationButton.addEventListener('click', () => {
        if(screen.width >= 768)
            openInvitationButton.classList.add('hidden');
        else
            invitationSection.classList.add('hidden'); // Hide the invitation section
       
        hiddenSections.forEach(section => {
            section.classList.remove('hidden'); // Show all other sections
        });
        // Optional: Scroll to the top or to the hero section
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Initialize butterfly animations when invitation is opened
        setTimeout(() => {
            initButterflies();
        }, 1000);
    });

    // Butterfly Animation Functions
    function flutter(giftSection, id, vartimer, pos) {
        let wrapper = document.getElementById(id);
        if (!wrapper) return;

        // Store previous position for direction calculation
        const prevX = pos.x;
        const prevY = pos.y;
        // Size variation
        pos.size += generaterandomno(-10, 10);
        pos.size = (pos.size < 15 ? 15 : pos.size);
        pos.size = (pos.size > 20 ? 20 : pos.size);

        let angle = generaterandomno(-45, 45);
        pos.rotation += angle;
        pos.rotation = (pos.rotation);

        // set random distance
        let distance = generaterandomno(50, 100);
        // set new position
        pos.x += distance * Math.cos(pos.rotation * (Math.PI / 180));
        pos.y += distance * Math.sin(pos.rotation * (Math.PI / 180));

        // Boundary checks
        pos.x = (pos.x > giftSection.offsetWidth ? giftSection.offsetWidth : pos.x);
        pos.y = (pos.y < giftSection.offsetHeight * 0.3 ? giftSection.offsetHeight * 0.3 : pos.y > giftSection.offsetHeight ? giftSection.offsetHeight : pos.y);
        const dx = pos.x - prevX;
        const dy = pos.y - prevY;
        const checkAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        const angleDiff = Math.abs(checkAngle - pos.rotation);
        if (angleDiff > 0) {
            pos.rotation = checkAngle;
        }

        pos.rotation = (pos.rotation + 90) % 360;
        let transitiontimer = distance / generaterandomno(10, 30);
        // if (transitiontimer < 1) transitiontimer = 1;
        wrapper.style.left = pos.x + "px";
        wrapper.style.top = pos.y + "px";
        wrapper.style.width = pos.size + "px";
        wrapper.style.height = pos.size + "px";
        wrapper.style.transform = "rotate(" + pos.rotation + "deg)";
        wrapper.style.transition = "left " + transitiontimer + "s 2s, top " + transitiontimer + "s 2s, width " + transitiontimer + "s 2s, height " + transitiontimer + "s 2s, transform  2s";

        let wingtimer = generaterandomno(1, 5);
        wrapper.querySelectorAll(".upperwing,.lowerwing").forEach(w => {
            w.style.animationDuration = "0." + wingtimer + "s";
        });

        let nexttimer = (transitiontimer + 3) * 1000;

        setTimeout(function() { flutter(giftSection, id, nexttimer, pos); }, vartimer);
    }

    function initButterflies() {
        // Initialize butterflies only if the gift section is visible
        const giftSection = document.getElementById('verse-section');
        
        if (giftSection) {
            // create 8 elements butterflies
            for (let i = 0; i < 9; i++) {
                const wrapper = document.createElement('div');
                wrapper.classList.add('butterfly_wrapper');
                wrapper.id = "butterfly-" + i;
                wrapper.innerHTML = `
                    <div class="leftwings">
                        <div class="perspective">
                            <div class="upperwing${i%2==0 ? '' : '2'} upperwing_left"></div>
                        </div>
                        <div class="perspective">
                            <div class="lowerwing${i%2==0 ? '' : '2'} lowerwing_left"></div>
                        </div>
                    </div>
                    <div class="rightwings">
                        <div class="perspective">
                            <div class="upperwing${i%2==0 ? '' : '2'} upperwing_right"></div>
                        </div>
                        <div class="perspective">
                            <div class="lowerwing${i%2==0 ? '' : '2'} lowerwing_right"></div>
                        </div>
                    </div>
                `;
                giftSection.appendChild(wrapper);
                
                const id = "butterfly-" + i;
                const vartimer = generaterandomno(1500, 3000);
                const pos = {
                    x: generaterandomno(0, giftSection.offsetWidth),
                    y: generaterandomno(giftSection.offsetHeight * 0.5, giftSection.offsetHeight),
                    size: generaterandomno(15, 20),
                    rotation: 0
                };
                flutter(giftSection, id, vartimer, pos);
            }            
        }
    }
});
