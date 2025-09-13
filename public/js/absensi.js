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
    // const clearDataBtn = document.getElementById('clear-data');
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
                    const name = data[0] || '';
                    const from = data[1] || '-';

                    
                    // Add to attendance list
                    // attendanceData.unshift({
                    //     id,
                    //     name,
                    //     time,
                    //     status: 'Hadir'
                    // });
                    if (name === '') {
                        throw new Error('Invalid QR code format');
                    }
                    fetch('/api/absensi', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name,
                            from,
                            time: dateNow,
                            status: 'Hadir'
                        })
                    }).then(response => response.json()).then(data => {
                        // Update result display
                        if (data.message === 'Anda sudah absen') {
                            document.getElementById('result-message').textContent = 'Anda sudah melakukan absensi';
                        } else {
                            document.getElementById('result-message').textContent = 'Absensi berhasil dicatat!';
                        }

                        document.getElementById('result-name').textContent = data.data?.name ?? '-';
                        document.getElementById('result-id').textContent = data.data?.id ?? '-';
                        document.getElementById('result-from').textContent = data.data?.from ?? '-';
                        document.getElementById('result-time').textContent = dateNow.toLocaleString('id-ID');
                        // Show result
                        scanResult.classList.remove('hidden');
                        
                        // Hide processing overlay
                        scannerOverlay.classList.add('hidden');
                        
                        // Restart scanner after 1.5 seconds
                        setTimeout(() => {
                            scanAnimation.style.display = 'block';
                        }, 1500);
                        updateAttendanceTable();
                    }).catch(err => {
                        console.log(err);
                    })
                    // Save to localStorage
                    // localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
                    
                    // Update attendance table
                    
                    
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
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.from}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${new Date(item.time).toLocaleString('id-ID')}</td>
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
                let backCam = cameras.find(cam => /back|rear/i.test(cam.name));
                if (backCam) {
                    scanner.start(backCam);
                    console.log("Menggunakan kamera belakang:", backCam.name);
                } else {
                    scanner.start(cameras[0]);
                    console.log("Kamera belakang tidak ada, pakai kamera pertama.");
                }
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
    // clearDataBtn.addEventListener('click', function() {
    //     if (confirm('Apakah Anda yakin ingin menghapus semua data absensi?')) {
    //         attendanceData = [];
    //         localStorage.removeItem('attendanceData');
    //         updateAttendanceTable();
    //         scanResult.classList.add('hidden');
    //     }
    // });

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

    // Realtime attendance update using SSE
    const eventSource = new EventSource('/api/absensi/stream');
    eventSource.onmessage = function(event) {
        const newAttendance = JSON.parse(event.data);
        
        // Add new attendance to the list and update table
        attendanceData.unshift(newAttendance);
        // Limit to latest 50 records to avoid memory bloat
        if (attendanceData.length > 50) {
            attendanceData.pop();
        }
        // Re-render attendance table
        let html = '';
        attendanceData.forEach((item, index) => {
            html += `
                <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${index + 1}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.from}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${new Date(item.time).toLocaleString('id-ID')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ${item.status}
                        </span>
                    </td>
                </tr>
            `;
        });
        attendanceList.innerHTML = html;
    };
    eventSource.onerror = function(err) {
        console.error('EventSource failed:', err);
        eventSource.close();
    };
});
