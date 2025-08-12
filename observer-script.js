// 관찰자 전용 JavaScript 파일
// GitHub Pages에서 독립적으로 작동

// 전역 변수
let socket;
let observerId;
let currentChecklist = [];
let checklistState = [];
let roleChecklist = {};

// 역할별 체크리스트 정의
const roleChecklists = {
    '초기발견자1': [
        '환자 의식 확인',
        '신고자1에게 신고 요청',
        '보조자1에게 AED요청',
        'CPR시작'
    ],
    '초기발견자2': [
        '환자 의식 확인',
        '신고자2에게 신고 요청',
        '보조자2에게 AED요청',
        'CPR시작'
    ],
    '신고자1': [
        '119에 장소 설명',
        '119에 환자 상태 설명',
        '초기발견자1에게 도착시간 알려주기',
        'CPR이어받기'
    ],
    '신고자2': [
        '119에 장소 설명',
        '119에 환자 상태 설명',
        '초기발견자2에게 도착시간 알려주기',
        'CPR이어받기'
    ],
    '보조자1': [
        'AED가져오기',
        'AED열고 부착하기',
        '주변 사람들 물린 후 AED 작동하기',
        'CPR이어받기'
    ],
    '보조자2': [
        'AED가져오기',
        'AED열고 부착하기',
        '주변 사람들 물린 후 AED 작동하기',
        'CPR이어받기'
    ],
    '초기발견자(통합)': [
        '환자 의식 확인',
        '신고자에게 신고 요청',
        '보조자에게 AED요청',
        'CPR시작'
    ],
    '신고자(통합)': [
        '119에 장소 설명',
        '119에 환자 상태 설명',
        '초기발견자에게 도착시간 알려주기',
        'CPR이어받기'
    ],
    '보조자(통합)': [
        'AED가져오기',
        'AED열고 부착하기',
        '주변 사람들 물린 후 AED 작동하기',
        'CPR이어받기'
    ],
    '신고자/보조자1(통합)': [
        '119에 장소 설명',
        '119에 환자 상태 설명',
        '초기발견자1에게 도착시간 알려주기',
        'AED가져오기',
        'AED열고 부착하기',
        '주변 사람들 물린 후 AED 작동하기',
        'CPR이어받기'
    ],
    '신고자/보조자2(통합)': [
        '119에 장소 설명',
        '119에 환자 상태 설명',
        '초기발견자2에게 도착시간 알려주기',
        'AED가져오기',
        'AED열고 부착하기',
        '주변 사람들 물린 후 AED 작동하기',
        'CPR이어받기'
    ],
    '신고자2/보조자2(통합)': [
        '119에 장소 설명',
        '119에 환자 상태 설명',
        '초기발견자2에게 도착시간 알려주기',
        'AED가져오기',
        'AED열고 부착하기',
        '주변 사람들 물린 후 AED 작동하기',
        'CPR이어받기'
    ]
};

// 서버 URL 설정 (GitHub Pages 배포 후 실제 서버 URL로 변경)
const SERVER_URL = 'http://127.0.0.1:3000'; // 교사용 서버 URL

// 소켓 연결 초기화
function initializeSocket() {
    // 실제 서버 연결 시도
    try {
        console.log('교사용 서버에 연결 시도 중...');
        console.log('서버 URL:', SERVER_URL);
        
        socket = io(SERVER_URL, {
            transports: ['websocket', 'polling'],
            timeout: 5000,
            forceNew: true
        });
        
        setupSocketEvents();
        
        // 연결 성공 시 시뮬레이션 모드 비활성화
        socket.on('connect', () => {
            console.log('교사용 서버에 성공적으로 연결되었습니다!');
            console.log('소켓 ID:', socket.id);
            console.log('연결 상태:', socket.connected);
            updateConnectionStatus(true);
            showMessage('교사용 서버에 연결되었습니다!', 'success');
        });
        
        // 연결 실패 시 시뮬레이션 모드로 전환
        socket.on('connect_error', (error) => {
            console.log('서버 연결 실패, 시뮬레이션 모드로 전환:', error);
            console.log('에러 상세:', error.message);
            simulateServerConnection();
        });
        
        // 연결 시도 중
        socket.on('connecting', () => {
            console.log('서버에 연결 시도 중...');
        });
        
        // 연결 해제
        socket.on('disconnect', (reason) => {
            console.log('서버 연결 해제:', reason);
            updateConnectionStatus(false);
        });
        
    } catch (error) {
        console.log('소켓 연결 오류, 시뮬레이션 모드로 전환:', error);
        simulateServerConnection();
    }
}

// 서버 연결 시뮬레이션 (GitHub Pages용)
function simulateServerConnection() {
    updateConnectionStatus(true);
    showMessage('GitHub Pages 모드: 서버 연결 시뮬레이션', 'success');
    
    // 세션 시작 시뮬레이션
    setTimeout(() => {
        document.getElementById('sessionInfo').style.display = 'flex';
        document.getElementById('currentGroupInfo').textContent = '현재 조: 1조';
        document.getElementById('sessionStatus').textContent = '세션 상태: 진행 중';
    }, 1000);
}

// 실제 소켓 이벤트 설정
function setupSocketEvents() {
    socket.on('connect', () => {
        updateConnectionStatus(true);
        showMessage('서버에 연결되었습니다.', 'success');
    });

    socket.on('disconnect', () => {
        updateConnectionStatus(false);
        showMessage('서버 연결이 끊어졌습니다.', 'error');
    });

    socket.on('sessionStarted', (data) => {
        console.log('세션 시작:', data);
        showMessage(`${data.groupNumber}조 세션이 시작되었습니다.`, 'success');
        
        document.getElementById('sessionInfo').style.display = 'flex';
        document.getElementById('currentGroupInfo').textContent = `현재 조: ${data.groupNumber}조`;
        document.getElementById('sessionStatus').textContent = '세션 상태: 진행 중';
    });

    socket.on('sessionEnded', (data) => {
        console.log('세션 종료:', data);
        showMessage('세션이 종료되었습니다.', 'success');
        
        document.getElementById('sessionInfo').style.display = 'none';
        resetToRegistration();
    });

    socket.on('observerRegistrationSuccess', (data) => {
        console.log('관찰자 등록 성공:', data);
        
        currentChecklist = roleChecklists[data.targetStudentRole] || [];
        checklistState = new Array(currentChecklist.length).fill(false);

        document.getElementById('checklistContainer').classList.add('active');
        
        document.getElementById('roleTitle').textContent = `관찰 대상: ${data.targetStudentRole}`;
        document.getElementById('studentInfo').textContent = `${data.targetStudentName} (${data.targetStudentNumber}번 학생)`;
        
        renderChecklist();
        updateProgress();
        
        showMessage('관찰이 시작되었습니다!', 'success');
    });

    socket.on('observerRegistrationFailed', (data) => {
        console.log('관찰자 등록 실패:', data);
        document.getElementById('registrationForm').classList.add('active');
        showMessage(data.message, 'error');
    });

    socket.on('availableStudents', (data) => {
        console.log('사용 가능한 학생들:', data);
        
        if (data.students.length === 0) {
            showMessage('관찰 가능한 학생이 없습니다. 모든 학생이 이미 관찰자에게 배정되었습니다.', 'error');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * data.students.length);
        const selectedStudent = data.students[randomIndex];
        
        console.log('선택된 학생:', selectedStudent);
        
        document.getElementById('targetStudentNumber').value = selectedStudent.number;
        
        showMessage(`${selectedStudent.number}번 학생 (${selectedStudent.role})이 랜덤으로 배정되었습니다.`, 'success');
    });

    socket.on('dramaStarted', (data) => {
        console.log('상황극 시작:', data);
        showMessage('상황극이 시작되었습니다! 관찰을 시작하세요.', 'success');
        
        const dramaNotification = document.createElement('div');
        dramaNotification.className = 'drama-notification';
        dramaNotification.innerHTML = `
            <h3>🎭 상황극 시작!</h3>
            <p>${data.message}</p>
            <p>시작 시간: ${new Date(data.startTime).toLocaleTimeString()}</p>
        `;
        
        document.body.appendChild(dramaNotification);
        
        setTimeout(() => {
            if (dramaNotification.parentNode) {
                dramaNotification.parentNode.removeChild(dramaNotification);
            }
        }, 5000);
    });

    socket.on('connect_error', (error) => {
        console.error('연결 오류:', error);
        updateConnectionStatus(false);
        showMessage('서버 연결에 실패했습니다.', 'error');
    });
}

// 연결 상태 업데이트
function updateConnectionStatus(connected) {
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('connectionText');
    
    if (connected) {
        statusIndicator.classList.add('connected');
        statusText.textContent = '서버에 연결됨';
    } else {
        statusIndicator.classList.remove('connected');
        statusText.textContent = '서버 연결 끊어짐';
    }
}

// 메시지 표시
function showMessage(message, type) {
    const errorEl = document.getElementById('errorMessage');
    const successEl = document.getElementById('successMessage');
    
    if (type === 'error') {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        successEl.style.display = 'none';
    } else {
        successEl.textContent = message;
        successEl.style.display = 'block';
        errorEl.style.display = 'none';
    }

    setTimeout(() => {
        errorEl.style.display = 'none';
        successEl.style.display = 'none';
    }, 3000);
}

// 랜덤 학생 배정
function assignRandomStudent() {
    console.log('랜덤 배정 버튼 클릭됨');
    
    if (window.location.hostname.includes('github.io')) {
        // GitHub Pages 모드: 시뮬레이션
        const mockStudents = [
            { number: 1, role: '초기발견자1', name: '1번 학생' },
            { number: 2, role: '신고자1', name: '2번 학생' },
            { number: 3, role: '보조자1', name: '3번 학생' },
            { number: 4, role: '초기발견자2', name: '4번 학생' },
            { number: 5, role: '신고자2', name: '5번 학생' },
            { number: 6, role: '보조자2', name: '6번 학생' }
        ];
        
        const randomIndex = Math.floor(Math.random() * mockStudents.length);
        const selectedStudent = mockStudents[randomIndex];
        
        document.getElementById('targetStudentNumber').value = selectedStudent.number;
        showMessage(`${selectedStudent.number}번 학생 (${selectedStudent.role})이 랜덤으로 배정되었습니다.`, 'success');
        return;
    }
    
    if (!socket || !socket.connected) {
        showMessage('서버에 연결되지 않았습니다.', 'error');
        return;
    }
    
    console.log('getAvailableStudents 요청 전송');
    socket.emit('getAvailableStudents');
}

// 관찰자 등록
function registerObserver() {
    const observerName = document.getElementById('observerName').value.trim();
    const observerNumber = document.getElementById('observerNumber').value.trim();
    const targetStudentNumber = document.getElementById('targetStudentNumber').value.trim();

    if (!observerName || !observerNumber || !targetStudentNumber) {
        showMessage('모든 필드를 입력해주세요.', 'error');
        return;
    }

    observerId = `${observerNumber}_${Date.now()}`;
    
    if (window.location.hostname.includes('github.io')) {
        // GitHub Pages 모드: 시뮬레이션
        simulateObserverRegistration(observerName, observerNumber, targetStudentNumber);
        return;
    }
    
    socket.emit('registerObserver', {
        observerId,
        observerName,
        observerNumber: parseInt(observerNumber),
        targetStudentNumber: parseInt(targetStudentNumber)
    });

    document.getElementById('registrationForm').classList.remove('active');
    showMessage('관찰 대상 정보를 확인 중입니다...', 'success');
}

// GitHub Pages 모드에서 관찰자 등록 시뮬레이션
function simulateObserverRegistration(observerName, observerNumber, targetStudentNumber) {
    const mockRole = '초기발견자1'; // 시뮬레이션용 역할
    
    currentChecklist = roleChecklists[mockRole] || [];
    checklistState = new Array(currentChecklist.length).fill(false);

    document.getElementById('checklistContainer').classList.add('active');
    
    document.getElementById('roleTitle').textContent = `관찰 대상: ${mockRole}`;
    document.getElementById('studentInfo').textContent = `${targetStudentNumber}번 학생`;
    
    renderChecklist();
    updateProgress();
    
    showMessage('GitHub Pages 모드: 관찰이 시작되었습니다!', 'success');
}

// 체크리스트 렌더링
function renderChecklist() {
    const checklistEl = document.getElementById('checklist');
    checklistEl.innerHTML = '';

    currentChecklist.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `checklist-item ${checklistState[index] ? 'checked' : ''}`;
        
        li.innerHTML = `
            <div class="checkbox">
                <input type="checkbox" 
                       id="check-${index}" 
                       ${checklistState[index] ? 'checked' : ''}
                       onchange="toggleChecklistItem(${index})">
                <span>${item}</span>
            </div>
        `;
        
        checklistEl.appendChild(li);
    });
}

// 체크리스트 항목 토글
function toggleChecklistItem(index) {
    checklistState[index] = !checklistState[index];
    
    const itemEl = document.querySelector(`#check-${index}`).closest('.checklist-item');
    if (checklistState[index]) {
        itemEl.classList.add('checked');
    } else {
        itemEl.classList.remove('checked');
    }
    
    updateProgress();
    
    if (socket && socket.connected) {
        sendChecklistUpdate();
    }
}

// 진행률 업데이트
function updateProgress() {
    const completed = checklistState.filter(Boolean).length;
    const total = currentChecklist.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    document.getElementById('progressText').textContent = `${completed}/${total} 완료`;
    document.getElementById('progressFill').style.width = `${percentage}%`;
    
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
        `마지막 업데이트: ${now.toLocaleTimeString()}`;
}

// 체크리스트 업데이트 전송
function sendChecklistUpdate() {
    if (socket && observerId) {
        socket.emit('updateChecklist', {
            observerId,
            checklistState,
            roleName: document.getElementById('roleTitle').textContent.replace('관찰 대상: ', '')
        });
    }
}

// 등록 폼으로 리셋
function resetToRegistration() {
    document.getElementById('checklistContainer').classList.remove('active');
    document.getElementById('registrationForm').classList.add('active');
    
    document.getElementById('observerName').value = '';
    document.getElementById('observerNumber').value = '';
    document.getElementById('targetStudentNumber').value = '';
    
    observerId = null;
    currentChecklist = [];
    checklistState = [];
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeSocket();
});
