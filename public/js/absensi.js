document.addEventListener('DOMContentLoaded', function() {
    // Update clock
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID');
        const dateString = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        document.getElementById('clock').textContent = `${dateString}, ${timeString}`;
    }
    setInterval(updateClock, 1000);
    updateClock();
    
    // QR Scanner Logic
    let scanner = null;
    const preview = document.getElementById('preview');
    const scanAnimation = document.getElementById('scan-animation');
    const scannerOverlay = document.getElementById('scanner-overlay');
    const startBtn = document.getElementById('start-scanner');
    const stopBtn = document.getElementById('stop-scanner');
    const scannerStatus = document.getElementById('scanner-status');
    const scanResult = document.getElementById('scan-result');
    const attendanceList = document.getElementById('attendance-list');
    const clearDataBtn = document.getElementById('clear-data');
    const switchCameraBtn = document.getElementById('switch-camera');   
    
    let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
    
    // Initialize scanner
    function initScanner() {
        scanner = new Instascan.Scanner({ video: preview, mirror: false });
        
        scanner.addListener('scan', function(content) {
            // Show processing overlay
            scannerOverlay.classList.remove('hidden');
            
            // Hide scan animation
            scanAnimation.style.display = 'none';
            
            // Simulate processing delay
            setTimeout(() => {
                try {
                    // Parse QR content (format: id|nama)
                    const dateNow = new Date()
                    const data = content.split('|');
                    const id = data[0] || 'ID Tidak Valid';
                    const name = data[1] || 'Nama Tidak Valid';
                    const time = dateNow.toLocaleString('id-ID');
                    
                    // Update result display
                    document.getElementById('result-name').textContent = name;
                    document.getElementById('result-id').textContent = id;
                    document.getElementById('result-time').textContent = time;
                    
                    // Add to attendance list
                    // attendanceData.unshift({
                    //     id,
                    //     name,
                    //     time,
                    //     status: 'Hadir'
                    // });
                    fetch('/api/absensi', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id,
                            name,
                            time: dateNow,
                            status: 'Hadir'
                        })
                    })
                    // Save to localStorage
                    // localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
                    
                    // Update attendance table
                    updateAttendanceTable();
                    
                    // Show result
                    scanResult.classList.remove('hidden');
                    
                    // Hide processing overlay
                    scannerOverlay.classList.add('hidden');
                    
                    // Restart scanner after 3 seconds
                    setTimeout(() => {
                        scanAnimation.style.display = 'block';
                    }, 3000);
                    
                } catch (error) {
                    console.error('Error processing QR:', error);
                    scannerOverlay.classList.add('hidden');
                    scanAnimation.style.display = 'block';
                    alert('Gagal memproses QR Code. Format tidak valid.');
                }
            }, 1500);
        });
    }
    
    // Update attendance table
    function updateAttendanceTable() {
        fetch('/api/absensi')
        .then(response => response.json())
        .then(data => {
            attendanceData = data.items ?? [];
            if (attendanceData.length === 0) {
                attendanceList.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-center text-gray-500">Belum ada data absensi</td>
                    </tr>
                `;
                return;
            }
            
            let html = '';
            attendanceData.forEach((item, index) => {
                html += `
                    <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${index + 1}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.time}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                ${item.status}
                            </span>
                        </td>
                    </tr>
                `;
            });
            attendanceList.innerHTML = html;
        }).catch(error => {
            console.error('Error fetching attendance data:', error);
            attendanceList.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">Gagal memuat data absensi</td>
                </tr>
            `;
        })
    }
    
    // Initialize attendance table
    updateAttendanceTable();
    let cameraData = []
    let currentCameraIndex = 0;
    // Start scanner
    startBtn.addEventListener('click', function() {
        initScanner();
        
        Instascan.Camera.getCameras().then(function(cameras) {
            cameraData = cameras
            if (cameras.length < 2) {
                switchCameraBtn.disabled = true;
                switchCameraBtn.classList.add('hidden');
            } else {
                switchCameraBtn.disabled = false;
                switchCameraBtn.classList.remove('hidden');
            }
            if (cameras.length > 0) {
                scanner.start(cameras[0]);
                startBtn.disabled = true;
                stopBtn.disabled = false;
                switchCameraBtn.disabled = false;
                scannerStatus.textContent = 'Aktif';
                scannerStatus.className = 'px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800';
                scanAnimation.style.display = 'block';
            } else {
                alert('Tidak ada kamera yang terdeteksi!');
            }
        }).catch(function(e) {
            console.error(e);
            alert('Gagal mengakses kamera. Pastikan Anda sudah memberikan izin.');
        });
    });
    
    // Stop scanner
    stopBtn.addEventListener('click', function() {
        if (scanner) {
            scanner.stop();
            startBtn.disabled = false;
            stopBtn.disabled = true;
            switchCameraBtn.disabled = true;
            scannerStatus.textContent = 'Tidak Aktif';
            scannerStatus.className = 'px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
            scanAnimation.style.display = 'none';
        }
    });
    
    // Clear all data
    clearDataBtn.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin menghapus semua data absensi?')) {
            attendanceData = [];
            localStorage.removeItem('attendanceData');
            updateAttendanceTable();
            scanResult.classList.add('hidden');
        }
    });

    // Switch camera
    document.getElementById('switch-camera').addEventListener('click', function() {
        if (cameraData.length < 2) return;
        
        currentCameraIndex = (currentCameraIndex + 1) % cameraData.length;
        scanner.stop().then(() => {
            scanner.start(cameraData[currentCameraIndex]);
        });
        
        // Show camera name in status temporarily
        const cameraName = cameraData[currentCameraIndex].name || `Camera ${currentCameraIndex + 1}`;
        scannerStatus.textContent = `Aktif (${cameraName})`;
        setTimeout(() => {
            scannerStatus.textContent = 'Aktif';
        }, 2000);
    });
    
    // Initialize scanner status
    scannerStatus.textContent = 'Tidak Aktif';
    scannerStatus.className = 'px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';

    
});