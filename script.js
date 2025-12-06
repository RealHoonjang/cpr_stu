// 전역 변수
let currentScreen = 'setup';
let groupCount = 5;
let timeLimit = 5;
let groupSizes = []; // 각 조별 인원 수
let currentGroup = 1;
let currentStep = 0;
let timer = null;
let timeRemaining = 0;
let groupTimes = [];
let allGroupResults = [];
let studentRoster = [];
let currentScenario = null;
let currentGroupRoles = []; // 현재 조의 역할 배정

// 릴레이 모드 전역 변수
let relayMode = false;
let relayTimeLimit = 3;
let relayRoundCount = 2;
let relayTeams = [];
let currentRelayRound = 1;
let relayTimer = null;
let relayTimeRemaining = 0;
let relayStudentRoster = []; // 릴레이 모드용 학생 명렬
let allAvailableTeams = []; // 사용 가능한 모든 팀 정보
let relayScenarios = [
    {
        situation: '쇼핑몰에서 심정지 환자 발견',
        environment: '실내, 사람이 많은 곳',
        condition: 'AED가 2층에 있어서 시간이 걸림',
        sound: 'sounds/classroom.mp3'
    },
    {
        situation: '공원에서 심정지 환자 발견',
        environment: '야외, 조용한 곳',
        condition: '119 도착까지 10분 소요',
        sound: 'sounds/classroom.mp3'
    },
    {
        situation: '지하철역에서 심정지 환자 발견',
        environment: '지하, 제한된 공간',
        condition: '승객들이 지켜보는 상황',
        sound: 'sounds/classroom.mp3'
    },
    {
        situation: '학교 운동장에서 심정지 환자 발견',
        environment: '야외, 넓은 공간',
        condition: '학생들이 많이 모여있음',
        sound: 'sounds/classroom.mp3'
    },
    {
        situation: '주차장에서 심정지 환자 발견',
        environment: '실외, 차량이 많은 곳',
        condition: '야간이라 어두운 상황',
        sound: 'sounds/classroom.mp3'
    }
];

// 역할 정의 (3-6명에 맞춰 조정)
const roles = [
    '응급구조사 1',
    '응급구조사 2', 
    '의료진',
    '보조자 1',
    '보조자 2',
    '관찰자'
];

// 역할별 체크리스트 및 통합 규칙
const baseRoleChecklists = {
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
        '119에 주변 환경 설명',
        'CPR이어받기'
    ],
    '신고자2': [
        '119에 장소 설명',
        '119에 환자 상태 설명',
        '119에 주변 환경 설명',
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
    ]
};

// 중복을 제거하면서 체크리스트를 병합하는 헬퍼 함수
function mergeAndDeduplicateChecklists(...checklists) {
    const combined = checklists.flat();
    return [...new Set(combined)];
}

function getRolesByStudentCount(count) {
    if (count >= 6) {
        return [
            { name: '초기발견자1', checklist: baseRoleChecklists['초기발견자1'] },
            { name: '초기발견자2', checklist: baseRoleChecklists['초기발견자2'] },
            { name: '신고자1', checklist: baseRoleChecklists['신고자1'] },
            { name: '신고자2', checklist: baseRoleChecklists['신고자2'] },
            { name: '보조자1', checklist: baseRoleChecklists['보조자1'] },
            { name: '보조자2', checklist: baseRoleChecklists['보조자2'] }
        ];
    } else if (count === 5) {
        return [
            { name: '초기발견자1', checklist: baseRoleChecklists['초기발견자1'] },
            { name: '초기발견자2', checklist: baseRoleChecklists['초기발견자2'] },
            { name: '보조자1', checklist: baseRoleChecklists['보조자1'] },
            { name: '신고자1', checklist: baseRoleChecklists['신고자1'] },
            { name: '신고자2/보조자2(통합)', checklist: mergeAndDeduplicateChecklists(baseRoleChecklists['신고자2'], baseRoleChecklists['보조자2']) }
        ];
    } else if (count === 4) {
        return [
            { name: '초기발견자1', checklist: baseRoleChecklists['초기발견자1'] },
            { name: '초기발견자2', checklist: baseRoleChecklists['초기발견자2'] },
            { name: '신고자/보조자1(통합)', checklist: mergeAndDeduplicateChecklists(baseRoleChecklists['신고자1'], baseRoleChecklists['보조자1']) },
            { name: '신고자/보조자2(통합)', checklist: mergeAndDeduplicateChecklists(baseRoleChecklists['신고자2'], baseRoleChecklists['보조자2']) }
        ];
    } else if (count === 3) {
        return [
            { name: '초기발견자(통합)', checklist: mergeAndDeduplicateChecklists(baseRoleChecklists['초기발견자1'], baseRoleChecklists['초기발견자2']) },
            { name: '신고자(통합)', checklist: mergeAndDeduplicateChecklists(baseRoleChecklists['신고자1'], baseRoleChecklists['신고자2']) },
            { name: '보조자(통합)', checklist: mergeAndDeduplicateChecklists(baseRoleChecklists['보조자1'], baseRoleChecklists['보조자2']) }
        ];
    } else {
        return [];
    }
}

// getRolesByStudentCount 함수에서 역할명 배열을 반환하는 함수 추가
function getRoleNamesByStudentCount(count) {
    return getRolesByStudentCount(count).map(role => role.name);
}

let currentRoles = [];
let checklistState = [];

// CPR 상황 시나리오
const scenarioData = [
    {
        title: '심정지 환자 발견 - 거리에서',
        description: '도로에서 갑자기 쓰러진 중년 남성을 발견했습니다. 주변에는 많은 사람들이 지나다니고 있습니다.',
        patientCondition: '의식 없음, 호흡 없음, 맥박 없음',
        environment: '도로변, 사람들이 많은 곳',
        sound: 'sounds/street.mp3',
        requiredEquipment: 'AED, 인공호흡 마스크, 장갑',
        steps: [
            '환경 안전 확인',
            '의식 확인',
            '119 신고 및 AED 요청',
            '호흡 확인',
            '가슴압박 시작 (30회)',
            '인공호흡 (2회)',
            'AED 도착 시 사용',
            'CPR 계속 (30:2 비율)',
            '응급차 도착까지 지속'
        ]
    },
    {
        title: '심정지 환자 발견 - 실내(교실)에서',
        description: '교실에서 갑자기 쓰러진 친구를 발견했습니다. 익숙한 환경에서 응급상황이 발생했습니다.',
        patientCondition: '의식 없음, 호흡 없음, 맥박 없음',
        environment: '사무실 내부, 조용한 환경',
        sound: 'sounds/classroom.mp3',
        requiredEquipment: 'AED, 인공호흡 마스크, 장갑',
        steps: [
            '환경 안전 확인',
            '의식 확인',
            '119 신고 및 AED 요청',
            '호흡 확인',
            '가슴압박 시작 (30회)',
            '인공호흡 (2회)',
            'AED 도착 시 사용',
            'CPR 계속 (30:2 비율)',
            '응급차 도착까지 지속'
        ]
    },
    {
        title: '심정지 환자 발견 - 체육관에서',
        description: '체육관에서 운동 중 갑자기 쓰러진 학생을 발견했습니다. 많은 학생들이 지켜보고 있습니다.',
        patientCondition: '의식 없음, 호흡 없음, 맥박 없음',
        environment: '체육관, 학생들이 많은 곳',
        sound: 'sounds/gym.mp3',
        requiredEquipment: 'AED, 인공호흡 마스크, 장갑',
        steps: [
            '환경 안전 확인',
            '의식 확인',
            '119 신고 및 AED 요청',
            '호흡 확인',
            '가슴압박 시작 (30회)',
            '인공호흡 (2회)',
            'AED 도착 시 사용',
            'CPR 계속 (30:2 비율)',
            '응급차 도착까지 지속'
        ]
    },
    {
        title: '심정지 환자 발견 - 상가에서',
        description: '상가에서 쇼핑 중 갑자기 쓰러진 고객을 발견했습니다. 상점 내부에서 발생한 응급상황입니다.',
        patientCondition: '의식 없음, 호흡 없음, 맥박 없음',
        environment: '상가 내부, 쇼핑객들이 있는 곳',
        sound: 'sounds/mall.mp3',
        requiredEquipment: 'AED, 인공호흡 마스크, 장갑',
        steps: [
            '환경 안전 확인',
            '의식 확인',
            '119 신고 및 AED 요청',
            '호흡 확인',
            '가슴압박 시작 (30회)',
            '인공호흡 (2회)',
            'AED 도착 시 사용',
            'CPR 계속 (30:2 비율)',
            '응급차 도착까지 지속'
        ]
    },
    {
        title: '심정지 환자 발견 - 운동장에서',
        description: '운동장에서 갑자기 쓰러진 친구를 발견했습니다. 시끄러운 환경에서 발생한 응급상황입니다.',
        patientCondition: '의식 없음, 호흡 없음, 맥박 없음',
        environment: '아파트 단지, 조용한 주거환경',
        sound: 'sounds/playground.mp3',
        requiredEquipment: 'AED, 인공호흡 마스크, 장갑',
        steps: [
            '환경 안전 확인',
            '의식 확인',
            '119 신고 및 AED 요청',
            '호흡 확인',
            '가슴압박 시작 (30회)',
            '인공호흡 (2회)',
            'AED 도착 시 사용',
            'CPR 계속 (30:2 비율)',
            '응급차 도착까지 지속'
        ]
    }
];

// 교육 피드백 메시지
const feedbackMessages = [
    "환경 안전 확인이 가장 중요합니다. 자신의 안전을 먼저 확보하세요.",
    "의식 확인 시 '괜찮으세요?'라고 큰 소리로 물어보세요.",
    "119 신고 시 정확한 위치와 상황을 명확히 전달하세요.",
    "호흡 확인은 10초 이내에 완료해야 합니다.",
    "가슴압박은 분당 100-120회의 속도로 실시하세요.",
    "가슴압박 깊이는 성인 기준 5-6cm입니다.",
    "인공호흡 시 코를 막고 입으로 1초간 숨을 불어넣으세요.",
    "CPR은 30:2 비율로 실시합니다 (가슴압박 30회, 인공호흡 2회).",
    "AED 사용 시 음성 안내를 따라주세요.",
    "응급차가 도착할 때까지 CPR을 중단하지 마세요.",
    "팀워크가 중요합니다. 역할 분담을 명확히 하세요.",
    "체력 소모가 크므로 2분마다 역할을 교대하세요."
];

// DOM 요소들
const screens = {
    setup: document.getElementById('setup-screen'),
    drama: document.getElementById('drama-screen'),
    result: document.getElementById('result-screen'),
    relay: document.getElementById('relay-screen'),
    'relay-game': document.getElementById('relay-game-screen')
};

const modal = document.getElementById('role-assignment-modal');
const cprScoreModal = document.getElementById('cpr-score-modal');
const bgAudio = document.getElementById('bg-audio');
const sfxAudio = document.getElementById('sfx-audio');

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로딩 완료');
    
    // 조 수 변경 시 조별 설정 업데이트
    document.getElementById('group-count').addEventListener('change', updateGroupConfig);
    
    // 명렬 파일 업로드
    document.getElementById('roster-upload').addEventListener('change', handleRosterUpload);

    // 설정 완료 버튼
    document.getElementById('start-setup').addEventListener('click', startSetup);
    
    // Modal 내 버튼 이벤트
    document.getElementById('assign-and-show-roles').addEventListener('click', assignCurrentGroupRoles);
    document.getElementById('start-drama-from-modal').addEventListener('click', startDramaFromModal);
    document.getElementById('save-scores-and-continue').addEventListener('click', saveCprScoresAndContinue);
    
    // 다음 조 버튼
    document.getElementById('next-group-button').addEventListener('click', nextGroup);
    
    // 결과 화면 버튼들
    document.getElementById('restart-program').addEventListener('click', restartProgram);
    document.getElementById('export-results').addEventListener('click', exportResults);
    
    // 릴레이 모드 이벤트 리스너 설정
    setupRelayEventListeners();
    
    // 초기 조별 설정 생성
    updateGroupConfig();
    
    // 추가 확인: 릴레이 게임 시작 버튼이 있는지 확인
    setTimeout(() => {
        const startRelayGameBtn = document.getElementById('start-relay-game');
        if (startRelayGameBtn) {
            console.log('DOM 로딩 후 릴레이 게임 시작 버튼 확인됨');
        } else {
            console.error('DOM 로딩 후에도 릴레이 게임 시작 버튼을 찾을 수 없습니다');
        }
    }, 500);
});

// 조별 설정 업데이트
function updateGroupConfig() {
    const groupCount = parseInt(document.getElementById('group-count').value);
    const groupConfigElement = document.getElementById('group-config');
    groupConfigElement.innerHTML = '';
    
    for (let i = 1; i <= groupCount; i++) {
        const groupItem = document.createElement('div');
        groupItem.className = 'group-item-config';
        
        groupItem.innerHTML = `
            <label for="group-${i}">${i}조 인원</label>
            <input type="number" id="group-${i}" value="6" min="3" max="6" required>
        `;
        
        groupConfigElement.appendChild(groupItem);
    }
}

// 화면 전환 함수
function showScreen(screenName) {
    console.log(`showScreen 호출됨: ${screenName}`);
    
    // 모든 화면 숨기기
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 요청된 화면 표시
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        console.log(`화면 '${screenName}' 찾음, 활성화 중...`);
        targetScreen.classList.add('active');
        currentScreen = screenName;
        console.log(`화면 '${screenName}' 활성화 완료`);
    } else {
        console.error(`Screen '${screenName}' not found`);
        console.log('사용 가능한 화면들:', document.querySelectorAll('.screen'));
    }
}

// 설정 완료 -> 교육 시작
function startSetup() {
    groupCount = parseInt(document.getElementById('group-count').value);
    timeLimit = parseInt(document.getElementById('time-limit').value);
    
    groupSizes = [];
    
    for (let i = 1; i <= groupCount; i++) {
        const groupSizeInput = document.getElementById(`group-${i}`);
        if (!groupSizeInput) {
            console.error(`Element with id "group-${i}" not found.`);
            continue;
        }
        const groupSize = parseInt(groupSizeInput.value);
        if (groupSize < 3 || groupSize > 6) {
            alert(`${i}조의 인원은 3-6명 사이여야 합니다.`);
            return;
        }
        groupSizes.push(groupSize);
    }
    
    // 첫 상황극 시작
    startDrama();
}

// 현재 조 역할 랜덤 배정 (학생 수에 따라 통합된 역할명 사용)
function assignCurrentGroupRoles() {
    // 1. 학생 번호 읽기 및 유효성 검사
    const studentNumberInputs = document.querySelectorAll('#student-selector-container input');
    const studentNumbers = [];
    for (const input of studentNumberInputs) {
        if (input.value.trim() === '') {
            alert('모든 학생의 번호를 입력해주세요.');
            return;
        }
        const num = parseInt(input.value, 10);
        if (isNaN(num)) {
            alert('학생 번호는 숫자여야 합니다.');
            return;
        }
        if (studentRoster.length > 0 && !studentRoster.some(s => parseInt(s['번호'], 10) === num)) {
             alert(`${num}번 학생을 명렬에서 찾을 수 없습니다. 다시 확인해주세요.`);
             return;
        }
        studentNumbers.push(num);
    }

    const uniqueStudentNumbers = new Set(studentNumbers);
    if (uniqueStudentNumbers.size !== studentNumbers.length) {
        alert('학생 번호가 중복되었습니다. 다시 확인해주세요.');
        return;
    }

    // 2. 역할 배정
    const currentGroupSize = groupSizes[currentGroup - 1];
    const roleNames = getRoleNamesByStudentCount(currentGroupSize);
    currentGroupRoles = [];
    
    let availableRoles = [...roleNames];
    studentNumbers.forEach(num => {
        const randomIndex = Math.floor(Math.random() * availableRoles.length);
        const selectedRole = availableRoles.splice(randomIndex, 1)[0];
        currentGroupRoles.push({ number: num, role: selectedRole });
    });
    
    displayAssignedRolesInModal();

    // 버튼 상태 변경
    document.getElementById('assign-and-show-roles').style.display = 'none';
    document.getElementById('start-drama-from-modal').style.display = 'inline-block';
}

// 현재 조 역할 표시
function displayAssignedRolesInModal() {
    const display = document.getElementById('modal-roles-display');
    display.innerHTML = '';
    currentGroupRoles.forEach(member => {
        const roleItem = document.createElement('div');
        roleItem.className = 'role-item';
        roleItem.innerHTML = `<div class="role-number">${member.number}번 학생</div><div class="role-name">${member.role}</div>`;
        display.appendChild(roleItem);
    });
}

// 상황극 시작 (첫 조 또는 다음 조)
function startDrama() {
    currentStep = 0;
    
    if (currentGroup > groupCount) {
        endDrama();
        return;
    }

    // 역할 배정 팝업창 표시
    showRoleAssignmentModal();
}

function showRoleAssignmentModal() {
    modal.style.display = 'flex';
    document.getElementById('modal-title').textContent = `${currentGroup}조 역할 배정`;
    const groupSize = groupSizes[currentGroup - 1];
    document.getElementById('modal-group-size').textContent = groupSize;

    // 학생 번호 입력 필드 생성
    const selectorContainer = document.getElementById('student-selector-container');
    selectorContainer.innerHTML = '';
    for (let i = 0; i < groupSize; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'student-number-input';
        input.placeholder = `${i + 1}번째 학생`;
        selectorContainer.appendChild(input);
    }

    // 모달 초기화
    document.getElementById('modal-roles-display').innerHTML = '';
    document.getElementById('start-drama-from-modal').style.display = 'none';
    document.getElementById('assign-and-show-roles').style.display = 'inline-block';
}

function startDramaFromModal() {
    modal.style.display = 'none'; // 모달 숨기기

    // 현재 조의 학생 수에 따라 역할/체크리스트 결정
    const groupSize = groupSizes[currentGroup - 1];
    currentRoles = getRolesByStudentCount(groupSize); // Role definitions

    // 학생별로 체크리스트 상태를 초기화
    checklistState = {};
    currentGroupRoles.forEach(assignedRole => {
        const roleDef = currentRoles.find(r => r.name === assignedRole.role);
        if (roleDef) {
            checklistState[assignedRole.number] = Array(roleDef.checklist.length).fill(false);
        }
    });

    if (currentGroup === 1) {
        // 첫 조인 경우, 결과 초기화
        groupTimes = [];
        allGroupResults = [];
    }
    
    loadScenario(); // 시나리오 로드 및 화면 업데이트
    showScreen('drama'); // 드라마 화면 표시
    startTimer(); // 타이머 시작
}

// 모든 역할별 체크리스트를 한 화면에 카드로 표시
function renderAllRoleChecklists() {
    const checklistContainer = document.getElementById('role-checklist-container');
    checklistContainer.innerHTML = '';

    currentGroupRoles.forEach(assignedRole => {
        const studentNumber = assignedRole.number;
        const roleName = assignedRole.role;
        const roleDef = currentRoles.find(r => r.name === roleName);

        if (!roleDef) return;

        const card = document.createElement('div');
        card.className = 'role-checklist-card';
        
        const student = studentRoster.find(s => parseInt(s['번호'], 10) === studentNumber);
        const studentDisplayName = student ? `${student['성명']} (${studentNumber}번 학생)` : `${studentNumber}번 학생`;
        
        // 제목을 더 읽기 쉽게 분리
        const title = document.createElement('h3');
        title.innerHTML = `
            <div class="role-title-main">${roleName}</div>
            <div class="role-title-student">${studentDisplayName}</div>
        `;
        card.appendChild(title);
        
        const ul = document.createElement('ul');
        ul.className = 'role-checklist';
        
        roleDef.checklist.forEach((item, itemIdx) => {
            const li = document.createElement('li');
            const isChecked = checklistState[studentNumber] && checklistState[studentNumber][itemIdx];
            li.className = isChecked ? 'checked' : '';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = !!isChecked;
            checkbox.onchange = () => {
                if (checklistState[studentNumber]) {
                    checklistState[studentNumber][itemIdx] = checkbox.checked;
                    li.className = checkbox.checked ? 'checked' : '';
                }
            };
            li.appendChild(checkbox);
            li.appendChild(document.createTextNode(' ' + item));
            ul.appendChild(li);
        });
        card.appendChild(ul);
        checklistContainer.appendChild(card);
    });
}

// 시나리오 로드
function loadScenario() {
    const randomIndex = Math.floor(Math.random() * scenarioData.length);
    currentScenario = scenarioData[randomIndex];
    
    // 헤더 정보 업데이트
    document.getElementById('current-group-number-pres').textContent = currentGroup;
    document.getElementById('scenario-title-pres').textContent = currentScenario.title;
    document.getElementById('patient-condition-pres').textContent = currentScenario.patientCondition;
    document.getElementById('environment-pres').textContent = currentScenario.environment;
    document.getElementById('scenario-description-pres').textContent = currentScenario.description;
    
    // 마지막 조인 경우, 버튼 텍스트 변경
    const nextButton = document.getElementById('next-group-button');
    if (currentGroup === groupCount) {
        nextButton.textContent = '평가 종료';
    } else {
        nextButton.textContent = '다음 조로';
    }

    // 배경 소리 재생
    if (currentScenario.sound) {
        bgAudio.src = currentScenario.sound;
        bgAudio.play().catch(e => console.error("배경음 재생 실패. 사용자 상호작용이 필요할 수 있습니다.", e));
    } else {
        bgAudio.pause();
    }

    // 체크리스트 렌더링
    renderAllRoleChecklists();
}

// 다음 조
function nextGroup() {
    // 모든 소리 정지
    bgAudio.pause();
    sfxAudio.pause();

    if(timer) {
        clearInterval(timer);
    }
    
    // 점수 입력 모달 표시
    showCprScoreModal();
}

// CPR 점수 입력 모달 표시
function showCprScoreModal() {
    cprScoreModal.style.display = 'flex';
    document.getElementById('cpr-modal-title').textContent = `${currentGroup}조 CPR 점수 입력`;
    
    const modalBody = document.getElementById('cpr-modal-body');
    modalBody.innerHTML = '';

    currentGroupRoles.forEach(member => {
        const student = studentRoster.find(s => parseInt(s['번호'], 10) === member.number);
        const studentName = student ? student['성명'] : '';
        const labelName = studentName ? `${studentName} (${member.number}번)` : `${member.number}번 학생`;

        const scoreItem = document.createElement('div');
        scoreItem.className = 'cpr-score-item';
        scoreItem.innerHTML = `
            <label for="score-student-${member.number}">${labelName} - ${member.role}</label>
            <input type="number" id="score-student-${member.number}" class="cpr-score-input" min="0" max="100" placeholder="0-100점">
        `;
        modalBody.appendChild(scoreItem);
    });
}

// CPR 점수 저장 후 계속
function saveCprScoresAndContinue() {
    const scores = [];
    let allScoresValid = true;
    currentGroupRoles.forEach(member => {
        const input = document.getElementById(`score-student-${member.number}`);
        const score = parseInt(input.value, 10);
        if (input.value === '' || isNaN(score) || score < 0 || score > 100) {
            allScoresValid = false;
        }
        scores.push({ studentNumber: member.number, score: (isNaN(score) || score < 0) ? 0 : score });
    });

    if (!allScoresValid) {
        alert("모든 학생의 점수를 0에서 100 사이의 숫자로 입력해주세요.");
        return;
    }
    
    cprScoreModal.style.display = 'none';

    // 현재 조의 결과(체크리스트, CPR 점수) 저장
    const groupTime = timeLimit * 60 - timeRemaining;
    groupTimes.push(groupTime);
    allGroupResults.push({
        groupNumber: currentGroup,
        roleDefinitions: [...currentRoles],
        assignedRoles: [...currentGroupRoles],
        checklistState: { ...checklistState },
        cprScores: scores
    });

    // 다음 단계로 진행
    currentGroup++;
    if (currentGroup > groupCount) {
        endDrama();
    } else {
        startDrama();
    }
}

// 타이머 시작
function startTimer() {
    timeRemaining = timeLimit * 60; // 분을 초로 변환
    updateTimer();
    
    timer = setInterval(() => {
        timeRemaining--;
        updateTimer();
        
        // 평가가 끝나기 5초 전에 구급차 소리 재생
        if (timeRemaining === 5) {
            sfxAudio.src = 'sounds/ambulance.mp3';
            sfxAudio.play();
        }
        
        if (timeRemaining <= 2) {
            clearInterval(timer);
            bgAudio.pause();
            alert('시간이 종료되었습니다!');
            nextGroup(); // nextGroup 호출은 점수 입력 모달을 띄움
        }
    }, 1000);
}

// 타이머 업데이트
function updateTimer() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerEl = document.getElementById('time-remaining-pres');
    timerEl.textContent = timeString;
    
    const timerContainer = timerEl.parentElement;
    
    // 기존 경고 클래스 제거
    timerContainer.classList.remove('warning', 'critical');
    
    // 시간에 따른 경고 효과 적용
    if (timeRemaining <= 30) {
        timerContainer.classList.add('critical');
    } else if (timeRemaining <= 60) {
        timerContainer.classList.add('warning');
    }
}

// 상황극 일시정지
function pauseDrama() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        document.getElementById('pause-drama').textContent = '재개';
    } else {
        startTimer();
        document.getElementById('pause-drama').textContent = '일시정지';
    }
}

// 상황극 종료
function endDrama() {
    // 모든 소리 정지
    bgAudio.pause();
    sfxAudio.pause();
    
    if (timer) {
        clearInterval(timer);
    }
    
    const resultsContainer = document.getElementById('detailed-results-container');
    resultsContainer.innerHTML = ''; // Clear previous results

    allGroupResults.forEach(result => {
        const groupResultCard = document.createElement('div');
        groupResultCard.className = 'group-result-card';

        const cprScores = result.cprScores || [];
        const totalCprScore = cprScores.reduce((sum, s) => sum + s.score, 0);
        const avgCprScore = cprScores.length > 0 ? Math.round(totalCprScore / cprScores.length) : 0;

        const studentsHtml = result.assignedRoles.map(assignedRole => {
            const studentNumber = assignedRole.number;
            const roleName = assignedRole.role;

            const studentInfo = studentRoster.find(s => parseInt(s['번호'], 10) === studentNumber) || {};
            const studentDisplayName = studentInfo['성명'] ? `${studentInfo['성명']} (${studentNumber}번 학생)` : `${studentNumber}번 학생`;
            
            const roleDef = result.roleDefinitions.find(r => r.name === roleName);
            const checklist = roleDef ? roleDef.checklist : [];
            const studentChecklistState = result.checklistState[studentNumber] || [];

            const studentScoreData = cprScores.find(s => s.studentNumber === studentNumber);
            const studentCprScore = studentScoreData ? studentScoreData.score : 'N/A';
            
            const checklistHtml = checklist.map((item, itemIdx) => {
                const isChecked = studentChecklistState[itemIdx];
                return `<li class="${isChecked ? 'completed' : 'not-completed'}"><span>${item}</span></li>`;
            }).join('');
            
            return `
                <div class="role-result">
                    <h4>${roleName} (${studentDisplayName}) - CPR: ${studentCprScore}점</h4>
                    <ul>${checklistHtml}</ul>
                </div>
            `;
        }).join('');

        groupResultCard.innerHTML = `
            <h3>${result.groupNumber}조 결과 (평균 CPR 점수: ${avgCprScore}점)</h3>
            <div class="roles-container">
                ${studentsHtml}
            </div>
        `;
        resultsContainer.appendChild(groupResultCard);
    });

    showScreen('result');
}

// 시간 포맷팅
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 프로그램 재시작
function restartProgram() {
    currentGroup = 1;
    currentStep = 0;
    groupTimes = [];
    allGroupResults = [];
    studentRoster = [];
    timeRemaining = 0;
    groupSizes = [];
    currentGroupRoles = [];
    
    // 릴레이 모드 변수 초기화
    relayMode = false;
    relayTeams = [];
    relayStudentRoster = [];
    relayTimeRemaining = 0;
    currentRelayRound = 1;
    
    // 게임별 랜덤 시드 초기화
    initializeGameRandomSeed();
    
    // 입력값 초기화
    document.getElementById('group-count').value = 5;
    document.getElementById('time-limit').value = 5;
    document.getElementById('roster-upload').value = '';
    document.getElementById('roster-status').textContent = '';
    
    // 릴레이 모드 입력값 초기화
    if (document.getElementById('relay-roster-upload')) {
        document.getElementById('relay-roster-upload').value = '';
        document.getElementById('relay-roster-status').textContent = '';
    }
    
    updateGroupConfig();
    showScreen('setup');
}

// 결과 내보내기
function exportResults() {
    const dataForExcel = [];
    // 헤더 추가
    dataForExcel.push(["반", "번호", "성명", "조", "역할", "수행 항목", "역할 수행", "CPR 점수"]);

    const rosterMap = new Map();
    if (studentRoster.length > 0) {
        studentRoster.forEach(student => rosterMap.set(parseInt(student['번호'], 10), { ban: student['반'], name: student['성명'] }));
    }

    allGroupResults.forEach(result => {
        // Iterate through each student who participated in this group
        result.assignedRoles.forEach(assignedRole => {
            const studentNumber = assignedRole.number;
            const roleName = assignedRole.role;

            const studentInfo = rosterMap.get(studentNumber) || { ban: '', name: '(이름 없음)' };
            
            // Find role definition to get the checklist
            const roleDef = result.roleDefinitions.find(r => r.name === roleName);
            const checklist = roleDef ? roleDef.checklist : [];
            
            // Get performance data
            const studentChecklistState = result.checklistState[studentNumber] || [];
            const taskList = checklist.join(',');
            const completedCount = studentChecklistState.filter(Boolean).length;
            const totalCount = checklist.length;
            const completionRatio = totalCount > 0 ? `${completedCount}/${totalCount}` : '0/0';
            
            // Get CPR score
            const studentScoreData = result.cprScores.find(s => s.studentNumber === studentNumber);
            const studentCprScore = studentScoreData ? studentScoreData.score : '';

            dataForExcel.push([
                studentInfo.ban,
                studentNumber,
                studentInfo.name,
                `${result.groupNumber}조`,
                roleName,
                taskList || '(수행 항목 없음)',
                completionRatio,
                studentCprScore
            ]);
        });
    });

    if (dataForExcel.length <= 1) {
        alert("내보낼 평가 결과가 없습니다.");
        return;
    }

    // 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet(dataForExcel);

    // 열 너비 설정
    ws['!cols'] = [
        { wch: 8 },  // 반
        { wch: 8 },  // 번호
        { wch: 12 }, // 성명
        { wch: 8 },  // 조
        { wch: 20 }, // 역할
        { wch: 50 }, // 수행 항목
        { wch: 12 }, // 역할 수행
        { wch: 10 }  // CPR 점수
    ];

    // 워크북 생성 및 워크시트 추가
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CPR 평가 결과");

    // 엑셀 파일 내보내기
    XLSX.writeFile(wb, `CPR_평가결과_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// 명렬 파일 핸들러
function handleRosterUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        studentRoster = XLSX.utils.sheet_to_json(worksheet);
        
        const statusEl = document.getElementById('roster-status');
        statusEl.textContent = `'${file.name}' 파일이 업로드되었습니다. (총 ${studentRoster.length}명)`;
        console.log("명렬:", studentRoster);
    };
    reader.readAsArrayBuffer(file);
}

// 릴레이 모드 명렬 파일 핸들러
function handleRelayRosterUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // 릴레이 모드용 학생 명렬 저장
            relayStudentRoster = XLSX.utils.sheet_to_json(worksheet);
            
            // 빈 행 제거 (빈 데이터 필터링)
            relayStudentRoster = relayStudentRoster.filter(student => 
                student['성명'] && student['성명'].toString().trim() !== '' &&
                student['번호'] && student['번호'].toString().trim() !== ''
            );
            
            // 팀 정보가 있는지 확인
            const hasTeamInfo = checkTeamInfoInRoster(relayStudentRoster);
            
            const statusEl = document.getElementById('relay-roster-status');
            if (hasTeamInfo) {
                statusEl.textContent = `'${file.name}' 파일이 업로드되었습니다. (총 ${relayStudentRoster.length}명, 팀 정보 포함)`;
            } else {
                statusEl.textContent = `'${file.name}' 파일이 업로드되었습니다. (총 ${relayStudentRoster.length}명)`;
            }
            console.log("릴레이 모드 명렬:", relayStudentRoster);
        } catch (error) {
            console.error('릴레이 명렬 파일 처리 오류:', error);
            alert('파일 처리 중 오류가 발생했습니다.');
        }
    };
    reader.readAsArrayBuffer(file);
}

// 엑셀 파일에서 팀 정보 확인
function checkTeamInfoInRoster(roster) {
    if (!roster || roster.length === 0) return false;
    
    const firstRow = roster[0];
    const teamColumns = ['조', '모둠', '팀', 'team', 'group'];
    
    console.log('팀 정보 확인 중...', firstRow);
    console.log('사용 가능한 컬럼들:', Object.keys(firstRow));
    
    for (const column of teamColumns) {
        if (firstRow.hasOwnProperty(column)) {
            console.log(`팀 정보 발견: ${column} = ${firstRow[column]}`);
            return true;
        }
    }
    console.log('팀 정보를 찾을 수 없습니다.');
    return false;
}

// 팀 정보를 기반으로 팀 구성
function createTeamsFromRoster() {
    if (!relayStudentRoster || relayStudentRoster.length === 0) {
        console.log('학생 명렬이 비어있습니다.');
        return false;
    }
    
    const firstRow = relayStudentRoster[0];
    const teamColumns = ['조', '모둠', '팀', 'team', 'group'];
    let teamColumn = null;
    
    console.log('첫 번째 행 데이터:', firstRow);
    
    // 팀 정보 컬럼 찾기
    for (const column of teamColumns) {
        if (firstRow.hasOwnProperty(column)) {
            teamColumn = column;
            console.log(`팀 컬럼 발견: ${column}`);
            break;
        }
    }
    
    if (!teamColumn) {
        console.log('팀 정보 컬럼을 찾을 수 없습니다.');
        return false;
    }
    
        // 팀별로 학생 그룹화
    const teams = {};
    relayStudentRoster.forEach(student => {
        const teamNumber = student[teamColumn];
        if (!teams[teamNumber]) {
            teams[teamNumber] = [];
        }
        teams[teamNumber].push(student);
    });
    
    console.log('팀별 학생 그룹화 결과:', teams);
    
    // 팀 번호 배열 생성
    const teamNumbers = Object.keys(teams).sort((a, b) => a - b);
    console.log('발견된 팀들:', teamNumbers);
    
    // 모든 팀 정보 저장
    allAvailableTeams = teamNumbers.map(teamNumber => ({
        number: teamNumber,
        students: teams[teamNumber]
    }));
    
    console.log('사용 가능한 모든 팀:', allAvailableTeams);
    
    // 팀 구성 (선택된 팀만)
    relayTeams = [];
    
    // 선택된 팀들만 구성 (기본적으로는 모든 팀 선택)
    allAvailableTeams.forEach((teamInfo, index) => {
        const teamStudents = teamInfo.students;
        const teamMembers = [];
        
        // 학생 수에 따라 역할 배정
        const isMultipleOfThree = teamStudents.length % 3 === 0;
        
        if (isMultipleOfThree) {
            // 3의 배수: 첫 라운드용 3명 선택
            const firstRoundStudents = teamStudents.slice(0, 3);
            const roles = ['초기발견자', '신고자', '보조자'];
            
            // 역할 랜덤 배정
            const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
            
            firstRoundStudents.forEach((student, studentIndex) => {
                const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                const studentNumber = student['번호'] || studentIndex + 1;
                
                teamMembers.push({
                    role: shuffledRoles[studentIndex],
                    name: `${studentName} (${studentNumber}번)`,
                    studentNumber: studentNumber,
                    studentName: studentName,
                    score: 0,
                    status: 'waiting',
                    round: 1
                });
            });
        } else {
            // 3의 배수가 아님: 중복 참여 허용
            const roles = ['초기발견자', '신고자', '보조자'];
            const shuffledStudents = [...teamStudents].sort(() => Math.random() - 0.5);
            const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
            
            shuffledRoles.forEach((role, roleIndex) => {
                const student = shuffledStudents[roleIndex % shuffledStudents.length];
                const studentName = student['성명'] || student['이름'] || `학생${roleIndex + 1}`;
                const studentNumber = student['번호'] || roleIndex + 1;
                
                teamMembers.push({
                    role: role,
                    name: `${studentName} (${studentNumber}번)`,
                    studentNumber: studentNumber,
                    studentName: studentName,
                    score: 0,
                    status: 'waiting',
                    round: 1
                });
            });
        }
        
        relayTeams.push({
            id: index + 1,
            name: `${teamInfo.number}모둠`,
            members: teamMembers,
            currentMember: 0,
            totalScore: 0,
            round: 1,
            allStudents: teamStudents, // 전체 학생 정보 저장
            roundScores: {},
            roundMembers: { 1: [...teamMembers] } // 첫 라운드 멤버 저장
        });
    });
    
    console.log('릴레이 팀 구성 완료:', relayTeams);
    return true;
}



// 릴레이 역할 배정 모달 표시
function showRelayRoleAssignmentModal() {
    console.log('릴레이 역할 배정 모달 표시 시작');
    console.log('현재 라운드:', currentRelayRound);
    
    // 모달 요소 가져오기
    const modal = document.getElementById('relay-role-assignment-modal');
    if (!modal) {
        console.error('역할 배정 모달을 찾을 수 없습니다.');
        return;
    }
    
    // 모달 초기화 및 표시
    modal.style.display = 'flex';
    console.log('모달 초기 표시 완료');
    
    // 학생 명렬이 업로드되지 않은 경우 경고
    if (!relayStudentRoster || relayStudentRoster.length === 0) {
        console.log('학생 명렬이 없음 - 경고 표시');
        alert('릴레이 게임을 시작하기 전에 학생 명렬 파일을 업로드해주세요.');
        return;
    }
    
    console.log('학생 명렬 확인됨:', relayStudentRoster.length, '명');
    
    // 라운드 정보 표시
    if (currentRelayRound > 1) {
        console.log(`${currentRelayRound}라운드 역할 배정 시작`);
        console.log(`${currentRelayRound}라운드 시작을 위한 역할 배정`);
    }
    
    // 팀 정보가 있는지 확인
    const hasTeamInfo = checkTeamInfoInRoster(relayStudentRoster);
    console.log('팀 정보 존재 여부:', hasTeamInfo);
    
    if (hasTeamInfo) {
        // 팀 정보가 있으면 자동으로 팀 구성 시도
        console.log('자동 팀 구성 시도...');
        const success = createTeamsFromRoster();
        console.log('자동 팀 구성 결과:', success);
        
        if (success) {
            // 성공하면 모둠 선택 체크박스 표시
            console.log('모둠 선택 체크박스 표시...');
            showTeamSelectionCheckboxes();
            return;
        } else {
            // 실패하면 수동 입력 모달 표시
            console.log('자동 팀 구성 실패 - 수동 입력으로 전환');
            alert('팀 정보를 기반으로 자동 구성에 실패했습니다. 수동으로 입력해주세요.');
        }
    }
    
    // 수동 입력 모달 표시
    console.log('수동 입력 모달 표시...');
    showManualInputModal();
}

// 모둠 선택 체크박스 표시
function showTeamSelectionCheckboxes() {
    console.log('모둠 선택 체크박스 표시 시작');
    console.log('사용 가능한 팀들:', allAvailableTeams);
    
    const modal = document.getElementById('relay-role-assignment-modal');
    const modalTitle = document.getElementById('relay-modal-title');
    
    // 라운드 정보 표시
    if (currentRelayRound > 1) {
        modalTitle.textContent = `${currentRelayRound}라운드 - 참여할 모둠 선택`;
    } else {
        modalTitle.textContent = '참여할 모둠 선택';
    }
    
    // 모둠 선택 체크박스 컨테이너 표시
    const teamSelector = document.getElementById('relay-team-selector');
    const checkboxesContainer = document.getElementById('relay-team-checkboxes');
    
    if (teamSelector) {
        teamSelector.style.display = 'block';
    }
    
    checkboxesContainer.innerHTML = '';
    
    allAvailableTeams.forEach((teamInfo, index) => {
        console.log(`팀 ${teamInfo.number} 체크박스 생성:`, teamInfo);
        
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'relay-team-checkbox-item';
        checkboxItem.innerHTML = `
            <input type="checkbox" id="team-${teamInfo.number}" value="${teamInfo.number}" checked>
            <label for="team-${teamInfo.number}">${teamInfo.number}모둠 (${teamInfo.students.length}명)</label>
        `;
        
        // 체크박스 변경 이벤트
        const checkbox = checkboxItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                checkboxItem.classList.add('checked');
            } else {
                checkboxItem.classList.remove('checked');
            }
        });
        
        // 기본적으로 체크된 상태로 시작
        checkboxItem.classList.add('checked');
        checkboxesContainer.appendChild(checkboxItem);
    });
    
    // 역할 배정 버튼 표시
    document.getElementById('assign-relay-roles').style.display = 'inline-block';
    if (currentRelayRound > 1) {
        document.getElementById('assign-relay-roles').textContent = `${currentRelayRound}라운드 역할 배정`;
    } else {
        document.getElementById('assign-relay-roles').textContent = '선택된 모둠으로 역할 배정';
    }
    
    // 다른 섹션들 숨기기
    document.getElementById('relay-student-selector-container').style.display = 'none';
    document.getElementById('relay-modal-roles-display').innerHTML = '';
    document.getElementById('start-relay-game-from-modal').style.display = 'none';
    
    modal.style.display = 'flex';
    console.log('모둠 선택 체크박스 표시 완료 - 모달 표시됨');
    console.log('모달 요소:', modal);
    console.log('모달 display 스타일:', modal.style.display);
}

// 수동 입력 모달 표시
function showManualInputModal() {
    const modal = document.getElementById('relay-role-assignment-modal');
    const modalTitle = document.getElementById('relay-modal-title');
    
    // 라운드 정보 표시
    if (currentRelayRound > 1) {
        modalTitle.textContent = `${currentRelayRound}라운드 - 릴레이 역할 배정`;
    } else {
        modalTitle.textContent = '릴레이 역할 배정';
    }
    
    // 모둠 선택 섹션 숨기기
    const teamSelector = document.getElementById('relay-team-selector');
    const checkboxesContainer = document.getElementById('relay-team-checkboxes');
    
    if (teamSelector) {
        teamSelector.style.display = 'none';
    }
    if (checkboxesContainer) {
        checkboxesContainer.innerHTML = '';
        checkboxesContainer.style.display = 'none';
    }
    
    // 학생 번호 입력 필드 생성
    const selectorContainer = document.getElementById('relay-student-selector-container');
    selectorContainer.innerHTML = '';
    selectorContainer.style.display = 'block';
    
    // 기본적으로 3팀으로 설정
    const defaultTeamCount = 3;
    
    for (let i = 1; i <= defaultTeamCount; i++) {
        const teamSection = document.createElement('div');
        teamSection.className = 'relay-team-section';
        teamSection.innerHTML = `
            <h5>${i}팀</h5>
            <div class="relay-team-inputs">
                <input type="number" id="relay-modal-team-${i}-student1" placeholder="1번 학생 번호" min="1" required>
                <input type="number" id="relay-modal-team-${i}-student2" placeholder="2번 학생 번호" min="1" required>
                <input type="number" id="relay-modal-team-${i}-student3" placeholder="3번 학생 번호" min="1" required>
            </div>
        `;
        selectorContainer.appendChild(teamSection);
    }
    
    // 모달 초기화
    document.getElementById('relay-modal-roles-display').innerHTML = '';
    document.getElementById('start-relay-game-from-modal').style.display = 'none';
    document.getElementById('assign-relay-roles').style.display = 'inline-block';
    document.getElementById('assign-relay-roles').textContent = '역할 랜덤 배정';
    
    modal.style.display = 'flex';
}

// 릴레이 역할 배정
function assignRelayRoles() {
    // 체크박스가 있는지 확인 (자동 팀 구성)
    const checkboxesContainer = document.getElementById('relay-team-checkboxes');
    if (checkboxesContainer.children.length > 0) {
        // 체크된 모둠들로 팀 구성
        const checkedTeams = [];
        checkboxesContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            const teamNumber = checkbox.value;
            const teamInfo = allAvailableTeams.find(team => team.number === teamNumber);
            if (teamInfo) {
                checkedTeams.push(teamInfo);
            }
        });
        
        if (checkedTeams.length === 0) {
            alert('최소 1개 이상의 모둠을 선택해주세요.');
            return;
        }
        
        // 선택된 팀들로 역할 배정
        relayTeams = [];
        checkedTeams.forEach((teamInfo, index) => {
            const teamStudents = teamInfo.students;
            
            // 조원 수에 따른 참여자 배정 로직
            const teamSize = teamStudents.length;
            console.log(`${teamInfo.number}모둠 총 학생 수: ${teamSize}명`);
            
            // 1라운드와 2라운드용 멤버 배열 초기화
            const firstRoundMembers = [];
            const secondRoundMembers = [];
            
            if (teamSize >= 6) {
                // 6명 이상: 1라운드에 3명, 2라운드에 나머지 3명 (완전 제외)
                const shuffledStudents = [...teamStudents].sort(() => Math.random() - 0.5);
                const firstRoundStudents = shuffledStudents.slice(0, 3);
                const secondRoundStudents = shuffledStudents.slice(3, 6);
                
                const roles = ['초기발견자', '신고자', '보조자'];
                const shuffledRoles1 = [...roles].sort(() => Math.random() - 0.5);
                const shuffledRoles2 = [...roles].sort(() => Math.random() - 0.5);
                
                // 1라운드 멤버 배정
                firstRoundStudents.forEach((student, studentIndex) => {
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    
                    firstRoundMembers.push({
                        role: shuffledRoles1[studentIndex],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 1
                    });
                });
                
                // 2라운드 멤버 배정 (완전히 다른 학생들)
                secondRoundStudents.forEach((student, studentIndex) => {
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    
                    secondRoundMembers.push({
                        role: shuffledRoles2[studentIndex],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 2
                    });
                });
                
                console.log(`${teamInfo.number}모둠 1라운드 참여 학생:`, firstRoundStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                console.log(`${teamInfo.number}모둠 2라운드 참여 학생:`, secondRoundStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                
            } else if (teamSize === 5) {
                // 5명: 1라운드에 3명, 2라운드에 2명 + 1라운드 1명 (다른 역할로)
                const shuffledStudents = [...teamStudents].sort(() => Math.random() - 0.5);
                const firstRoundStudents = shuffledStudents.slice(0, 3);
                const secondRoundStudents = shuffledStudents.slice(3, 5);
                
                const roles = ['초기발견자', '신고자', '보조자'];
                const shuffledRoles1 = [...roles].sort(() => Math.random() - 0.5);
                const shuffledRoles2 = [...roles].sort(() => Math.random() - 0.5);
                
                // 1라운드 멤버 배정
                firstRoundStudents.forEach((student, studentIndex) => {
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    
                    firstRoundMembers.push({
                        role: shuffledRoles1[studentIndex],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 1
                    });
                });
                
                // 2라운드 멤버 배정 (2명 + 1라운드 1명)
                secondRoundStudents.forEach((student, studentIndex) => {
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    
                    secondRoundMembers.push({
                        role: shuffledRoles2[studentIndex],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 2
                    });
                });
                
                // 1라운드에서 1명 추가 (다른 역할로)
                const firstRoundStudent = firstRoundStudents[0];
                const studentName = firstRoundStudent['성명'] || firstRoundStudent['이름'] || `학생1`;
                const studentNumber = firstRoundStudent['번호'] || 1;
                const usedRoles = secondRoundMembers.map(m => m.role);
                const availableRoles = roles.filter(role => !usedRoles.includes(role));
                const randomRole = availableRoles[Math.floor(Math.random() * availableRoles.length)];
                
                secondRoundMembers.push({
                    role: randomRole,
                    name: `${studentName} (${studentNumber}번)`,
                    studentNumber: studentNumber,
                    studentName: studentName,
                    score: 0,
                    status: 'waiting',
                    round: 2
                });
                
                console.log(`${teamInfo.number}모둠 1라운드 참여 학생:`, firstRoundStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                console.log(`${teamInfo.number}모둠 2라운드 참여 학생:`, secondRoundMembers.map(m => `${m.studentName}(${m.studentNumber}번)`));
                
            } else if (teamSize === 4) {
                // 4명: 1라운드에 3명, 2라운드에 1명 + 1라운드 2명 (다른 역할로)
                const shuffledStudents = [...teamStudents].sort(() => Math.random() - 0.5);
                const firstRoundStudents = shuffledStudents.slice(0, 3);
                const secondRoundStudents = shuffledStudents.slice(3, 4);
                
                const roles = ['초기발견자', '신고자', '보조자'];
                const shuffledRoles1 = [...roles].sort(() => Math.random() - 0.5);
                const shuffledRoles2 = [...roles].sort(() => Math.random() - 0.5);
                
                // 1라운드 멤버 배정
                firstRoundStudents.forEach((student, studentIndex) => {
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    
                    firstRoundMembers.push({
                        role: shuffledRoles1[studentIndex],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 1
                    });
                });
                
                // 2라운드 멤버 배정 (1명 + 1라운드 2명)
                secondRoundStudents.forEach((student, studentIndex) => {
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    
                    secondRoundMembers.push({
                        role: shuffledRoles2[studentIndex],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 2
                    });
                });
                
                // 1라운드에서 2명 추가 (다른 역할로)
                const firstRoundStudentsForSecond = firstRoundStudents.slice(0, 2);
                const usedRoles = secondRoundMembers.map(m => m.role);
                const availableRoles = roles.filter(role => !usedRoles.includes(role));
                
                firstRoundStudentsForSecond.forEach((student, studentIndex) => {
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    const randomRole = availableRoles[studentIndex % availableRoles.length];
                    
                    secondRoundMembers.push({
                        role: randomRole,
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 2
                    });
                });
                
                console.log(`${teamInfo.number}모둠 1라운드 참여 학생:`, firstRoundStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                console.log(`${teamInfo.number}모둠 2라운드 참여 학생:`, secondRoundMembers.map(m => `${m.studentName}(${m.studentNumber}번)`));
                
            } else if (teamSize === 3) {
                // 3명: 매 라운드에 같은 학생이 배정되되 역할은 앞라운드와 다른 역할로 배정
                const roles = ['초기발견자', '신고자', '보조자'];
                const shuffledRoles1 = [...roles].sort(() => Math.random() - 0.5);
                const shuffledRoles2 = [...roles].sort(() => Math.random() - 0.5);
                
                // 1라운드 멤버 배정
                teamStudents.forEach((student, studentIndex) => {
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    
                    firstRoundMembers.push({
                        role: shuffledRoles1[studentIndex],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 1
                    });
                });
                
                // 2라운드 멤버 배정 (같은 학생, 다른 역할)
                teamStudents.forEach((student, studentIndex) => {
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    
                    secondRoundMembers.push({
                        role: shuffledRoles2[studentIndex],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 2
                    });
                });
                
                console.log(`${teamInfo.number}모둠 1라운드 참여 학생:`, teamStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                console.log(`${teamInfo.number}모둠 2라운드 참여 학생:`, secondRoundMembers.map(m => `${m.studentName}(${m.studentNumber}번)`));
                
            } else {
                // 2명 이하: 한 학생이 1개 혹은 2개 역할에 배정되도록
                const roles = ['초기발견자', '신고자', '보조자'];
                const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
                
                // 3명이 되도록 중복 허용하여 배정
                for (let i = 0; i < 3; i++) {
                    const student = teamStudents[i % teamStudents.length];
                    const studentName = student['성명'] || student['이름'] || `학생${i + 1}`;
                    const studentNumber = student['번호'] || i + 1;
                    
                    firstRoundMembers.push({
                        role: shuffledRoles[i],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: 1
                    });
                }
                
                console.log(`${teamInfo.number}모둠 1라운드 참여 학생 (중복 허용):`, firstRoundMembers.map(m => `${m.studentName}(${m.studentNumber}번)`));
            }
            
            // 팀 정보 저장 (1라운드 멤버를 현재 멤버로, 2라운드 멤버는 내부 저장)
            relayTeams.push({
                id: index + 1,
                name: `${teamInfo.number}모둠`,
                members: firstRoundMembers, // 현재 라운드용 멤버 (1라운드)
                currentMember: 0,
                totalScore: 0,
                round: 1,
                allStudents: teamStudents,
                roundMembers: {
                    1: firstRoundMembers,
                    2: secondRoundMembers
                }
            });
            
            console.log(`${teamInfo.number}모둠 최종 배정된 멤버 수: ${firstRoundMembers.length}명`);
            console.log(`${teamInfo.number}모둠 배정된 멤버들:`, firstRoundMembers.map(m => `${m.role}: ${m.name}`));
        });
        
        // 최종 검증: 모든 팀에 3명이 배정되었는지 확인
        console.log('=== 최종 역할 배정 검증 ===');
        relayTeams.forEach(team => {
            if (team.members.length !== 3) {
                console.error(`❌ ${team.name}에 ${team.members.length}명만 배정됨!`);
            } else {
                console.log(`✅ ${team.name}에 ${team.members.length}명 정상 배정됨`);
            }
        });
        console.log('=== 검증 완료 ===');
        
        // 역할 배정 결과 표시
        displayRelayAssignedRoles();
        
        // 게임 시작 버튼 표시
        const startButton = document.getElementById('start-relay-game-from-modal');
        if (startButton) {
            if (currentRelayRound > 1) {
                startButton.textContent = `${currentRelayRound}라운드 시작`;
            } else {
                startButton.textContent = '릴레이 게임 시작';
            }
            startButton.style.display = 'inline-block';
        }
        document.getElementById('assign-relay-roles').style.display = 'none';
        
        return;
    }
    
    // 수동 입력 방식 (기존 코드)
    const allStudentNumbers = [];
    let allValid = true;
    
    for (let i = 1; i <= 3; i++) {
        for (let j = 1; j <= 3; j++) {
            const input = document.getElementById(`relay-modal-team-${i}-student${j}`);
            if (!input || input.value.trim() === '') {
                alert(`모든 학생의 번호를 입력해주세요.`);
                return;
            }
            const num = parseInt(input.value, 10);
            if (isNaN(num)) {
                alert('학생 번호는 숫자여야 합니다.');
                return;
            }
            allStudentNumbers.push(num);
        }
    }
    
    // 중복 번호 확인
    const uniqueStudentNumbers = new Set(allStudentNumbers);
    if (uniqueStudentNumbers.size !== allStudentNumbers.length) {
        alert('학생 번호가 중복되었습니다. 다시 확인해주세요.');
        return;
    }
    
    // 명렬에서 학생 존재 여부 확인
    if (relayStudentRoster.length > 0) {
        for (const num of allStudentNumbers) {
            if (!relayStudentRoster.some(s => parseInt(s['번호'], 10) === num)) {
                alert(`${num}번 학생을 명렬에서 찾을 수 없습니다. 다시 확인해주세요.`);
                return;
            }
        }
    }
    
    // 팀별 역할 배정
    relayTeams = [];
    const roles = ['초기발견자', '신고자', '보조자'];
    
    for (let i = 1; i <= 3; i++) {
        const teamMembers = [];
        const teamStudents = [];
        
        for (let j = 1; j <= 3; j++) {
            const studentNumber = parseInt(document.getElementById(`relay-modal-team-${i}-student${j}`).value, 10);
            const student = relayStudentRoster.find(s => parseInt(s['번호'], 10) === studentNumber);
            const studentName = student ? student['성명'] || student['이름'] || `학생${studentNumber}` : `학생${studentNumber}`;
            
            // 학생 정보 저장
            if (student) {
                teamStudents.push(student);
            }
            
            // 역할 랜덤 배정
            const randomRoleIndex = Math.floor(Math.random() * roles.length);
            const role = roles.splice(randomRoleIndex, 1)[0];
            
            teamMembers.push({
                role: role,
                name: `${studentName} (${studentNumber}번)`,
                studentNumber: studentNumber,
                studentName: studentName,
                score: 0,
                status: 'waiting',
                round: 1
            });
        }
        
        relayTeams.push({
            id: i,
            name: `${i}팀`,
            members: teamMembers,
            currentMember: 0,
            totalScore: 0,
            round: 1,
            allStudents: teamStudents
        });
        
        // 역할 배열 재생성
        roles.push('초기발견자', '신고자', '보조자');
    }
    
    // 역할 배정 결과 표시
    displayRelayAssignedRoles();
    
    // 게임 시작 버튼 표시
    const startButton = document.getElementById('start-relay-game-from-modal');
    if (startButton) {
        if (currentRelayRound > 1) {
            startButton.textContent = `${currentRelayRound}라운드 시작`;
        } else {
            startButton.textContent = '릴레이 게임 시작';
        }
        startButton.style.display = 'inline-block';
    }
    document.getElementById('assign-relay-roles').style.display = 'none';
}

// 릴레이 역할 배정 결과 표시
function displayRelayAssignedRoles() {
    const display = document.getElementById('relay-modal-roles-display');
    
    // 라운드 정보 표시
    let titleText = '역할 배정 결과';
    if (currentRelayRound > 1) {
        titleText = `${currentRelayRound}라운드 역할 배정 결과`;
    }
    
    display.innerHTML = `<h4>${titleText}</h4>`;
    
    const teamsContainer = document.createElement('div');
    teamsContainer.className = 'relay-team-roles';
    
    relayTeams.forEach(team => {
        const teamItem = document.createElement('div');
        teamItem.className = 'relay-team-role-item';
        
        const teamTitle = document.createElement('h5');
        teamTitle.textContent = team.name;
        teamItem.appendChild(teamTitle);
        
        console.log(`${team.name} 표시할 멤버 수: ${team.members.length}명`);
        console.log(`${team.name} 표시할 멤버들:`, team.members.map(m => `${m.role}: ${m.name}`));
        
        team.members.forEach(member => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'relay-role-member';
            memberDiv.textContent = `${member.role}: ${member.name}`;
            teamItem.appendChild(memberDiv);
        });
        
        // 팀별 학생 수 정보 추가
        if (team.allStudents) {
            const studentCountDiv = document.createElement('div');
            studentCountDiv.className = 'relay-team-info';
            if (currentRelayRound > 1) {
                studentCountDiv.textContent = `총 ${team.allStudents.length}명 (${currentRelayRound}라운드 참여)`;
            } else {
                studentCountDiv.textContent = `총 ${team.allStudents.length}명 (라운드별 참여 예정)`;
            }
            teamItem.appendChild(studentCountDiv);
        }
        
        teamsContainer.appendChild(teamItem);
    });
    
    display.appendChild(teamsContainer);
}



// 추가 교육 요소들
const educationalFeatures = {
    // CPR 리듬 가이드
    cprRhythm: {
        start: function() {
            // 메트로놈 기능 (100-120 BPM)
            console.log('CPR 리듬 가이드 시작');
        }
    },
    
    // 실시간 피드백
    realTimeFeedback: {
        checkCompressionDepth: function() {
            // 가슴압박 깊이 체크 (5-6cm)
            console.log('가슴압박 깊이 확인');
        },
        checkCompressionRate: function() {
            // 가슴압박 속도 체크 (100-120회/분)
            console.log('가슴압박 속도 확인');
        }
    },
    
    // 시나리오 난이도 조절
    difficultyAdjustment: {
        easy: '초보자용 - 단계별 상세 안내',
        medium: '중급자용 - 기본 안내',
        hard: '고급자용 - 최소 안내'
    },
    
    // 팀워크 평가
    teamworkEvaluation: {
        communication: '의사소통 능력',
        roleExecution: '역할 수행 능력',
        coordination: '협조 능력',
        leadership: '리더십'
    }
};

// 교육 효과 향상을 위한 추가 기능들
console.log('교육 효과 향상 기능:', educationalFeatures);

// --- 릴레이 모드 관련 함수들 ---

// 릴레이 모드 이벤트 리스너 설정
function setupRelayEventListeners() {
    console.log('릴레이 모드 이벤트 리스너 설정 시작');
    
    // 릴레이 모드 시작 버튼
    const startRelayBtn = document.getElementById('start-relay');
    if (startRelayBtn) {
        console.log('릴레이 모드 시작 버튼 찾음');
        startRelayBtn.addEventListener('click', function() {
            console.log('릴레이 모드 시작 버튼 클릭됨');
            showScreen('relay');
        });
    } else {
        console.error('릴레이 모드 시작 버튼을 찾을 수 없습니다');
    }
    
    // 릴레이 명렬 파일 업로드
    const relayRosterUpload = document.getElementById('relay-roster-upload');
    if (relayRosterUpload) {
        relayRosterUpload.addEventListener('change', handleRelayRosterUpload);
    }
    
    // 릴레이 게임 시작 버튼
    const startRelayGameBtn = document.getElementById('start-relay-game');
    if (startRelayGameBtn) {
        console.log('릴레이 게임 시작 버튼 찾음');
        startRelayGameBtn.addEventListener('click', function() {
            console.log('릴레이 게임 시작 버튼 클릭됨');
            showRelayRoleAssignmentModal();
        });
    } else {
        console.error('릴레이 게임 시작 버튼을 찾을 수 없습니다');
        // DOM이 로드되지 않았을 수 있으므로 나중에 다시 시도
        setTimeout(() => {
            const retryBtn = document.getElementById('start-relay-game');
            if (retryBtn) {
                console.log('재시도: 릴레이 게임 시작 버튼 찾음');
                retryBtn.addEventListener('click', function() {
                    console.log('릴레이 게임 시작 버튼 클릭됨');
                    showRelayRoleAssignmentModal();
                });
            } else {
                console.error('재시도 실패: 릴레이 게임 시작 버튼을 찾을 수 없습니다');
            }
        }, 1000);
    }
    
    // 다음 라운드 버튼
    const nextRoundBtn = document.getElementById('next-round');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', function() {
            // 다음 라운드 시 항상 현재 라운드 점수 입력 모달 표시
            console.log('다음 라운드 버튼 클릭 - 점수 입력 모달 표시');
            showRelayScoreModal();
        });
    }
    
    // 릴레이 게임 종료 버튼
    const endRelayGameBtn = document.getElementById('end-relay-game');
    if (endRelayGameBtn) {
        endRelayGameBtn.addEventListener('click', function() {
            // 게임 종료 시 항상 현재 라운드 점수 입력 모달 표시
            console.log('게임 종료 버튼 클릭 - 점수 입력 모달 표시');
            showRelayScoreModal();
        });
    }
    
    // 릴레이 설정 변경 이벤트
    const relayTimeLimitInput = document.getElementById('relay-time-limit');
    if (relayTimeLimitInput) {
        relayTimeLimitInput.addEventListener('change', function() {
            relayTimeLimit = parseInt(this.value);
        });
    }
    
    const relayRoundCountInput = document.getElementById('relay-round-count');
    if (relayRoundCountInput) {
        relayRoundCountInput.addEventListener('change', function() {
            relayRoundCount = parseInt(this.value);
        });
    }
    
    // 릴레이 역할 배정 버튼
    const assignRelayRolesBtn = document.getElementById('assign-relay-roles');
    if (assignRelayRolesBtn) {
        assignRelayRolesBtn.addEventListener('click', assignRelayRoles);
    }
    
    // 릴레이 모달에서 게임 시작 버튼
    const startRelayGameFromModalBtn = document.getElementById('start-relay-game-from-modal');
    if (startRelayGameFromModalBtn) {
        startRelayGameFromModalBtn.addEventListener('click', startRelayGameFromModal);
    }
    
    console.log('릴레이 모드 이벤트 리스너 설정 완료');
}

// 릴레이 게임 시작
function startRelayGame() {
    // 팀이 생성되지 않은 경우 경고
    if (!relayTeams || relayTeams.length === 0) {
        alert('릴레이 게임을 시작하기 전에 역할을 배정해주세요.');
        return;
    }
    
    relayMode = true;
    
    // 라운드 정보 표시
    document.getElementById('current-round-display').textContent = currentRelayRound;
    document.getElementById('total-rounds-display').textContent = relayRoundCount;
    
    // 화면 전환
    showScreen('relay-game');
    
    // 첫 번째 라운드 시작
    startRelayRound();
}

// 릴레이 팀 생성
function createRelayTeams() {
    relayTeams = [];
    
    // 학생 명렬이 있는 경우 랜덤으로 학생 선택하여 팀 구성
    if (relayStudentRoster && relayStudentRoster.length > 0) {
        // 전체 학생 중에서 랜덤으로 선택
        const shuffledStudents = [...relayStudentRoster].sort(() => Math.random() - 0.5);
        let studentIndex = 0;
        
        // allAvailableTeams가 있으면 그 길이를 사용, 없으면 기본값 3 사용
        const teamCount = allAvailableTeams.length > 0 ? allAvailableTeams.length : 3;
        
        for (let i = 1; i <= teamCount; i++) {
            const teamMembers = [];
            
            for (let j = 0; j < 3; j++) {
                if (studentIndex < shuffledStudents.length) {
                    const student = shuffledStudents[studentIndex];
                    const studentName = student['성명'] || student['이름'] || `학생${studentIndex + 1}`;
                    const studentNumber = student['번호'] || studentIndex + 1;
                    
                    const roles = ['초기발견자', '신고자', '보조자'];
                    teamMembers.push({
                        role: roles[j],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting'
                    });
                    studentIndex++;
                } else {
                    // 학생이 부족한 경우 기본 이름 사용
                    const roles = ['초기발견자', '신고자', '보조자'];
                    teamMembers.push({
                        role: roles[j],
                        name: `팀${i}-${roles[j]}`,
                        studentNumber: null,
                        studentName: null,
                        score: 0,
                        status: 'waiting'
                    });
                }
            }
            
            relayTeams.push({
                id: i,
                name: `${i}팀`,
                members: teamMembers,
                currentMember: 0,
                totalScore: 0,
                round: 1
            });
        }
    } else {
        // 학생 명렬이 없는 경우 기본 팀 구성
        const teamCount = allAvailableTeams.length > 0 ? allAvailableTeams.length : 3;
        
        for (let i = 1; i <= teamCount; i++) {
            relayTeams.push({
                id: i,
                name: `${i}팀`,
                members: [
                    { role: '초기발견자', name: `팀${i}-초기발견자`, score: 0, status: 'waiting' },
                    { role: '신고자', name: `팀${i}-신고자`, score: 0, status: 'waiting' },
                    { role: '보조자', name: `팀${i}-보조자`, score: 0, status: 'waiting' }
                ],
                currentMember: 0,
                totalScore: 0,
                round: 1
            });
        }
    }
    
    renderRelayTeams();
}

// 릴레이 팀 렌더링
function renderRelayTeams() {
    const container = document.querySelector('.relay-teams-container');
    container.innerHTML = '';
    
    relayTeams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'relay-team-card';
        teamCard.innerHTML = `
            <h4>${team.name}</h4>
            <div class="relay-team-members">
                ${team.members.map((member, index) => `
                    <div class="relay-member ${member.status === 'current' ? 'current' : member.status === 'completed' ? 'completed' : ''}">
                        <div class="relay-member-info">
                            <div class="relay-member-role">${member.role}</div>
                            <div class="relay-member-name">${member.name}</div>
                        </div>

                    </div>
                `).join('')}
            </div>
            <div class="relay-team-total">
                <span>총점 (평균)</span>
                <span>${team.totalScore}점</span>
            </div>
            ${team.roundScores ? `
            <div class="relay-team-rounds">
                ${Object.entries(team.roundScores).map(([round, score]) => 
                    `<span class="round-score">${round}라운드: ${score}점</span>`
                ).join('')}
            </div>
            ` : ''}
            ${team.allStudents ? `
            <div class="relay-team-info">
                <span>총 ${team.allStudents.length}명 (${team.allStudents.length % 3 === 0 ? '3의 배수' : '중복 참여'})</span>
            </div>
            ` : ''}
        `;
        container.appendChild(teamCard);
    });
}

// 릴레이 라운드 시작
function startRelayRound() {
    console.log(`=== ${currentRelayRound}라운드 시작 ===`);
    
    // relayTimeLimit 값 확인 및 강제 설정
    const timeLimitInput = document.getElementById('relay-time-limit');
    if (timeLimitInput) {
        relayTimeLimit = parseInt(timeLimitInput.value) || 3;
        console.log(`relayTimeLimit 값 확인: ${relayTimeLimit}분`);
    }
    
    // 라운드별 시간 설정
    relayTimeRemaining = relayTimeLimit * 60;
    console.log(`라운드 ${currentRelayRound} 시간 초기화: ${relayTimeRemaining}초 (${relayTimeLimit}분)`);
    
    // 라운드별 고정 시나리오 선택 (라운드마다 다른 시나리오)
    const scenarioIndex = (currentRelayRound - 1) % relayScenarios.length;
    const currentScenario = relayScenarios[scenarioIndex];
    
    console.log(`라운드 ${currentRelayRound} 시나리오 선택:`, {
        round: currentRelayRound,
        scenarioIndex: scenarioIndex,
        totalScenarios: relayScenarios.length,
        selectedScenario: currentScenario
    });
    
    document.getElementById('relay-situation').textContent = currentScenario.situation;
    document.getElementById('relay-environment').textContent = currentScenario.environment;
    document.getElementById('relay-condition').textContent = currentScenario.condition;
    
    // 시나리오에 맞는 소리 재생
    if (currentScenario.sound) {
        playRelayScenarioSound(currentScenario.sound);
    }
    
    // 타이머 시작
    startRelayTimer();
    
    // 팀 상태 초기화
    relayTeams.forEach(team => {
        team.currentMember = 0;
        team.members.forEach(member => {
            member.status = 'waiting';
        });
        team.members[0].status = 'current';
    });
    
    renderRelayTeams();
    
    // 시간 표시 업데이트
    updateTimeDisplay();
    
    console.log(`=== ${currentRelayRound}라운드 시작 완료 ===`);
}

// 다음 릴레이 라운드
function nextRelayRound() {
    if (currentRelayRound < relayRoundCount) {
        // 현재 라운드 점수 입력 요청
        showRelayScoreModal();
    } else {
        // 마지막 라운드 완료 시 점수 입력 요청
        showRelayScoreModal();
    }
}

// 릴레이 타이머 시작
function startRelayTimer() {
    if (relayTimer) clearInterval(relayTimer);
    
    // 타이머 시작 시 배경음 재생
    let backgroundAudio = null;
    try {
        backgroundAudio = new Audio('sounds/classroom.mp3');
        backgroundAudio.loop = true;
        backgroundAudio.volume = 0.3;
        backgroundAudio.play().catch(e => console.log('배경음 재생 실패:', e));
    } catch (e) {
        console.log('배경음 재생 오류:', e);
    }
    
    relayTimer = setInterval(() => {
        relayTimeRemaining--;
        
        // 5초 전 엠뷸런스 소리 재생
        if (relayTimeRemaining === 5) {
            try {
                const ambulanceAudio = new Audio('sounds/ambulance.mp3');
                ambulanceAudio.volume = 0.7;
                ambulanceAudio.play().catch(e => console.log('엠뷸런스 소리 재생 실패:', e));
            } catch (e) {
                console.log('엠뷸런스 소리 재생 오류:', e);
            }
        }
        
        if (relayTimeRemaining <= 0) {
            clearInterval(relayTimer);
            
            // 배경음 정지
            if (backgroundAudio) {
                backgroundAudio.pause();
                backgroundAudio.currentTime = 0;
            }
            
            // 시간 종료 시 점수 입력 모달 표시
            showRelayScoreModal();
            return;
        }
        
        updateTimeDisplay();
    }, 1000);
}

// 릴레이 게임 종료
function endRelayGame() {
    if (relayTimer) {
        clearInterval(relayTimer);
        relayTimer = null;
    }
    
    // 최종 결과 계산 (라운드별 점수 평균)
    relayTeams.forEach(team => {
        if (team.roundScores && Object.keys(team.roundScores).length > 0) {
            const totalScore = Object.values(team.roundScores).reduce((sum, score) => sum + score, 0);
            team.totalScore = Math.round(totalScore / Object.keys(team.roundScores).length);
        } else {
            team.totalScore = 0;
        }
    });
    
    // 점수순으로 정렬
    relayTeams.sort((a, b) => b.totalScore - a.totalScore);
    
    // 게임 종료 시 랜덤 시드 초기화 (다음 게임을 위해)
    initializeGameRandomSeed();
    
    // 결과 표시
    showRelayResults();
}

// 릴레이 결과 표시
function showRelayResults() {
    const resultHTML = `
        <div class="relay-results">
            <h3>🏆 릴레이 게임 결과</h3>
            <div class="results-list">
                ${relayTeams.map((team, index) => `
                    <div class="result-item ${index === 0 ? 'winner' : ''}">
                        <h4>${index + 1}위 - ${team.name}</h4>
                        <p>총점: ${team.totalScore}점</p>
                        ${team.roundScores ? `
                        <div class="round-scores">
                            ${Object.entries(team.roundScores).map(([round, score]) => 
                                `<div class="round-score-item">
                                    <strong>${round}라운드: ${score}점</strong>
                                    ${team.roundMembers && team.roundMembers[round] ? `
                                    <div class="round-members">
                                        ${team.roundMembers[round].map(member => 
                                            `${member.role} (${member.name})`
                                        ).join(' | ')}
                                    </div>
                                    ` : ''}
                                </div>`
                            ).join('')}
                        </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <button onclick="showScreen(\'relay\')" class="btn btn-primary">다시 시작</button>
        </div>
    `;
    
    document.querySelector('.relay-teams-container').innerHTML = resultHTML;
}

// 릴레이 점수 입력 모달 표시
function showRelayScoreModal() {
    const modal = document.getElementById('relay-score-modal');
    const modalTitle = document.getElementById('relay-score-modal-title');
    const modalBody = document.getElementById('relay-score-modal-body');
    const roundDisplay = document.getElementById('relay-score-round-display');
    
    // DOM 요소 존재 확인
    if (!modal || !modalBody) {
        console.error('점수 입력 모달 요소를 찾을 수 없습니다.');
        alert('점수 입력 모달을 표시할 수 없습니다.');
        return;
    }
    
    // 선택적 요소들 안전하게 처리
    if (modalTitle) {
        modalTitle.textContent = `${currentRelayRound}라운드 점수 입력`;
    }
    if (roundDisplay) {
        roundDisplay.textContent = currentRelayRound;
    }
    
    // 모든 팀의 점수 입력 필드 생성
    const scoreInputsHTML = relayTeams.map(team => `
        <div class="relay-score-item">
            <label>${team.name} 점수:</label>
            <input type="number" id="relay-team-${team.id}-score" class="relay-score-input" min="0" max="100" placeholder="점수 입력">
            ${team.roundMembers && team.roundMembers[currentRelayRound] ? `
            <div class="relay-score-team-info">
                <small>참여 학생: ${team.roundMembers[currentRelayRound].map(member => 
                    `${member.role} (${member.name})`
                ).join(' | ')}</small>
            </div>
            ` : ''}
        </div>
    `).join('');
    
    modalBody.innerHTML = `
        <div class="relay-round-score-info">
            <p><strong>${currentRelayRound}</strong>라운드 점수를 입력하세요.</p>
            <p class="relay-round-detail">현재 라운드: ${currentRelayRound} / ${relayRoundCount}</p>
            ${currentRelayRound === relayRoundCount ? 
                '<p class="relay-final-round">⚠️ 마지막 라운드입니다!</p>' : 
                '<p class="relay-next-round">📋 다음 단계: 역할 배정 후 라운드 시작</p>'
            }
        </div>
        <div class="relay-score-inputs">
            ${scoreInputsHTML}
        </div>
    `;
    
    // 라운드별 버튼 텍스트 변경
    const saveButton = document.getElementById('relay-save-scores');
    if (saveButton) {
        if (currentRelayRound === relayRoundCount) {
            saveButton.textContent = '점수 저장 후 게임 종료';
        } else {
            saveButton.textContent = '저장 후 다음 라운드 역할 배정';
        }
    }
    
    modal.style.display = 'flex';
    
    // 점수 저장 버튼 이벤트 리스너
    document.getElementById('relay-save-scores').onclick = saveRelayScores;
}

// 릴레이 점수 저장
function saveRelayScores() {
    let allScoresValid = true;
    const roundScores = {};
    
    // 모든 팀의 점수 읽기
    relayTeams.forEach(team => {
        const scoreInput = document.getElementById(`relay-team-${team.id}-score`);
        if (scoreInput) {
            const score = parseInt(scoreInput.value, 10);
            if (!isNaN(score) && score >= 0 && score <= 100) {
                roundScores[team.id] = score;
            } else {
                allScoresValid = false;
                alert(`${team.name}의 점수를 0에서 100 사이의 숫자로 입력해주세요.`);
                return;
            }
        } else {
            allScoresValid = false;
            alert(`${team.name}의 점수를 입력해주세요.`);
            return;
        }
    });
    
    if (!allScoresValid) return;
    
    console.log(`${currentRelayRound}라운드 점수 저장:`, roundScores);
    
    // 현재 라운드 점수 저장
    relayTeams.forEach(team => {
        if (!team.roundScores) {
            team.roundScores = {};
        }
        team.roundScores[currentRelayRound] = roundScores[team.id];
        
        // 팀 총점을 평균으로 계산
        const totalScore = Object.values(team.roundScores).reduce((sum, score) => sum + score, 0);
        team.totalScore = Math.round(totalScore / Object.keys(team.roundScores).length);
        
        console.log(`${team.name} ${currentRelayRound}라운드 점수:`, roundScores[team.id], '총점:', team.totalScore);
    });
    
    // 모달 닫기
    document.getElementById('relay-score-modal').style.display = 'none';
    
    // 다음 라운드로 진행
    if (currentRelayRound < relayRoundCount) {
        // 다음 라운드 역할 배정 결과 표시 (현재 라운드 번호로)
        console.log('다음 라운드 역할 배정 결과 표시:', currentRelayRound + 1);
        showNextRoundRoleAssignment(currentRelayRound + 1);
    } else {
        console.log('모든 라운드 완료, 게임 종료');
        // 모든 라운드 완료
        endRelayGame();
    }
}

// 게임별 랜덤 시드 초기화
function initializeGameRandomSeed() {
    // 현재 시간을 기반으로 랜덤 시드 생성
    const seed = Date.now() + Math.random() * 1000;
    Math.seedrandom(seed);
    console.log(`새 게임 랜덤 시드 초기화: ${seed}`);
}

// 릴레이 모달에서 게임 시작
function startRelayGameFromModal() {
    document.getElementById('relay-role-assignment-modal').style.display = 'none';
    
    // 첫 번째 라운드인 경우 전체 게임 시작
    if (currentRelayRound === 1) {
        // 새 게임 시작 시 랜덤 시드 초기화
        initializeGameRandomSeed();
        startRelayGame();
    } else {
        // 다음 라운드인 경우 해당 라운드만 시작
        startRelayRound();
    }
}



// 다음 라운드 역할 배정 결과 표시
function showNextRoundRoleAssignment(nextRound) {
    console.log(`${nextRound}라운드 역할 배정 결과 표시 시작`);
    
    // 다음 라운드 역할 배정 수행
    currentRelayRound = nextRound;
    console.log(`다음 라운드로 진행: ${currentRelayRound} / ${relayRoundCount}`);
    
    // 라운드 정보 업데이트
    const currentRoundDisplay = document.getElementById('current-round-display');
    if (currentRoundDisplay) {
        currentRoundDisplay.textContent = currentRelayRound;
    }
    
    // 2라운드 멤버로 업데이트
    relayTeams.forEach(team => {
        if (team.roundMembers && team.roundMembers[currentRelayRound]) {
            team.members = team.roundMembers[currentRelayRound];
            console.log(`${team.name} ${currentRelayRound}라운드 멤버로 업데이트:`, team.members.map(m => `${m.role}: ${m.name}`));
        }
    });
    
    // 메인 화면을 역할 배정 결과 화면으로 변경
    const mainContainer = document.querySelector('.relay-teams-container');
    if (!mainContainer) {
        console.error('릴레이 팀 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    // 역할 배정 결과 HTML 생성
    const resultHTML = `
        <div class="relay-role-assignment-result">
            <h3>${currentRelayRound}라운드 역할 배정 결과</h3>
            <div class="relay-team-roles">
                ${relayTeams.map(team => `
                    <div class="relay-team-role-item">
                        <h5>${team.name}</h5>
                        ${team.members.map(member => `
                            <div class="relay-role-member">
                                ${member.role}: ${member.name}
                            </div>
                        `).join('')}
                        ${team.allStudents ? `
                        <div class="relay-team-info">
                            총 ${team.allStudents.length}명 (${currentRelayRound}라운드 참여)
                        </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="relay-next-round-actions">
                <button id="start-next-round" class="btn btn-primary">${currentRelayRound}라운드 시작</button>
                <button id="back-to-main" class="btn btn-secondary">메인으로 돌아가기</button>
            </div>
        </div>
    `;
    
    mainContainer.innerHTML = resultHTML;
    
    // 다음 라운드 시작 버튼 이벤트 리스너
    const startNextRoundBtn = document.getElementById('start-next-round');
    if (startNextRoundBtn) {
        startNextRoundBtn.addEventListener('click', function() {
            console.log(`${currentRelayRound}라운드 시작`);
            startRelayRound();
        });
    }
    
    // 메인으로 돌아가기 버튼 이벤트 리스너
    const backToMainBtn = document.getElementById('back-to-main');
    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', function() {
            console.log('메인으로 돌아가기');
            showScreen('setup');
        });
    }
    
    console.log(`${currentRelayRound}라운드 역할 배정 결과 표시 완료`);
}

// 릴레이 점수 입력 모달 닫기
function closeRelayScoreModal() {
    document.getElementById('relay-score-modal').style.display = 'none';
}

// 라운드별 팀 멤버 업데이트
function updateTeamMembersForRound() {
    console.log(`=== ${currentRelayRound}라운드 팀 멤버 업데이트 시작 ===`);
    
    relayTeams.forEach(team => {
        if (team.allStudents && team.allStudents.length > 0) {
            // roundMembers 초기화
            if (!team.roundMembers) {
                team.roundMembers = {};
            }
            
            const teamStudents = team.allStudents;
            const roles = ['초기발견자', '신고자', '보조자'];
            
            console.log(`${team.name} 총 학생 수: ${teamStudents.length}명`);
            console.log(`${team.name} 학생들:`, teamStudents.map(s => `${s['성명']}(${s['번호']}번)`));
            
            // 조원 수에 따른 참여자 배정 로직
            const teamSize = teamStudents.length;
            console.log(`${team.name} 총 학생 수: ${teamSize}명`);
            
            if (teamSize >= 6) {
                // 6명 이상: 1라운드와 2라운드 참여자가 다른 학생으로 배정
                let roundStudents = [];
                
                if (currentRelayRound === 1) {
                    // 1라운드: 게임별로 다른 시작 인덱스에서 3명 선택
                    const gameOffset = (team.id % 3) * 2; // 팀별로 다른 오프셋
                    const startIndex = gameOffset % teamStudents.length;
                    roundStudents = teamStudents.slice(startIndex, startIndex + 3);
                    
                    // 3명이 선택되지 않은 경우 순환하여 선택
                    if (roundStudents.length < 3) {
                        const neededStudents = 3 - roundStudents.length;
                        const remainingStudents = teamStudents.slice(0, neededStudents);
                        roundStudents = [...roundStudents, ...remainingStudents];
                    }
                    
                    console.log(`${team.name} 1라운드 참여 학생:`, roundStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                } else {
                    // 2라운드: 1라운드에 참여하지 않은 학생들을 우선 선택
                    const firstRoundMembers = team.roundMembers[1] || [];
                    const firstRoundStudentNumbers = firstRoundMembers.map(m => m.studentNumber);
                    
                    // 1라운드에 참여하지 않은 학생들 찾기
                    const remainingStudents = teamStudents.filter(student => 
                        !firstRoundStudentNumbers.includes(student['번호'])
                    );
                    
                    console.log(`${team.name} 1라운드 참여 학생 번호:`, firstRoundStudentNumbers);
                    console.log(`${team.name} 남은 학생들:`, remainingStudents.map(s => s['번호']));
                    
                    if (remainingStudents.length >= 3) {
                        // 남은 학생이 3명 이상이면 그 중에서 선택
                        roundStudents = remainingStudents.slice(0, 3);
                        console.log(`${team.name} 2라운드: 남은 학생들로 구성`);
                    } else {
                        // 남은 학생이 부족하면 1라운드에 참여하지 않은 학생들을 모두 포함하고, 부족한 만큼 1라운드 참여 학생 중에서 랜덤 선택
                        roundStudents = [...remainingStudents];
                        
                        // 부족한 인원만큼 1라운드 참여 학생 중에서 랜덤 선택
                        const neededStudents = 3 - remainingStudents.length;
                        
                        // 1라운드에 참여했던 학생들 중에서 랜덤 선택
                        const firstRoundStudents = teamStudents.filter(student => 
                            firstRoundStudentNumbers.includes(student['번호'])
                        );
                        const shuffledFirstRound = [...firstRoundStudents].sort(() => Math.random() - 0.5);
                        const additionalStudents = shuffledFirstRound.slice(0, neededStudents);
                        
                        roundStudents = [...roundStudents, ...additionalStudents];
                        console.log(`${team.name} 2라운드: 남은 학생 ${remainingStudents.length}명 + 추가 학생 ${additionalStudents.length}명`);
                        console.log(`${team.name} 2라운드 추가 학생:`, additionalStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                    }
                }
                
                // 역할 랜덤 배정
                const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
                
                team.members = roundStudents.map((student, index) => {
                    const studentName = student['성명'] || student['이름'] || `학생${index + 1}`;
                    const studentNumber = student['번호'] || index + 1;
                    
                    return {
                        role: shuffledRoles[index % 3], // 3개 역할 순환
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: currentRelayRound
                    };
                });
                
            } else if (teamSize === 5 || teamSize === 4) {
                // 5명 또는 4명: 1라운드에 참여하지 않은 학생을 2라운드에 우선 배정 후 랜덤으로 부족한 학생 만큼 배정
                let roundStudents = [];
                
                if (currentRelayRound === 1) {
                    // 1라운드: 처음 3명으로 시작
                    roundStudents = teamStudents.slice(0, 3);
                    console.log(`${team.name} 1라운드 참여 학생:`, roundStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                } else {
                    // 2라운드: 1라운드에 참여하지 않은 학생들을 우선 선택
                    const firstRoundMembers = team.roundMembers[1] || [];
                    const firstRoundStudentNumbers = firstRoundMembers.map(m => m.studentNumber);
                    
                    // 1라운드에 참여하지 않은 학생들 찾기
                    const remainingStudents = teamStudents.filter(student => 
                        !firstRoundStudentNumbers.includes(student['번호'])
                    );
                    
                    console.log(`${team.name} 1라운드 참여 학생 번호:`, firstRoundStudentNumbers);
                    console.log(`${team.name} 남은 학생들:`, remainingStudents.map(s => s['번호']));
                    
                    if (remainingStudents.length >= 3) {
                        // 남은 학생이 3명 이상이면 그 중에서 선택
                        roundStudents = remainingStudents.slice(0, 3);
                        console.log(`${team.name} 2라운드: 남은 학생들로 구성`);
                    } else {
                        // 남은 학생이 부족하면 1라운드에 참여하지 않은 학생들을 모두 포함하고, 부족한 만큼 1라운드 참여 학생 중에서 랜덤 선택
                        roundStudents = [...remainingStudents];
                        
                        // 부족한 인원만큼 1라운드 참여 학생 중에서 랜덤 선택
                        const neededStudents = 3 - remainingStudents.length;
                        
                        // 1라운드에 참여했던 학생들 중에서 랜덤 선택
                        const firstRoundStudents = teamStudents.filter(student => 
                            firstRoundStudentNumbers.includes(student['번호'])
                        );
                        const shuffledFirstRound = [...firstRoundStudents].sort(() => Math.random() - 0.5);
                        const additionalStudents = shuffledFirstRound.slice(0, neededStudents);
                        
                        roundStudents = [...roundStudents, ...additionalStudents];
                        console.log(`${team.name} 2라운드: 남은 학생 ${remainingStudents.length}명 + 추가 학생 ${additionalStudents.length}명`);
                        console.log(`${team.name} 2라운드 추가 학생:`, additionalStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                    }
                }
                
                // 역할 랜덤 배정
                const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
                
                team.members = roundStudents.map((student, index) => {
                    const studentName = student['성명'] || student['이름'] || `학생${index + 1}`;
                    const studentNumber = student['번호'] || index + 1;
                    
                    return {
                        role: shuffledRoles[index % 3], // 3개 역할 순환
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: currentRelayRound
                    };
                });
                
            } else if (teamSize === 3) {
                // 3명: 역할을 다르게 하여 1라운드에 배정한 학생을 2라운드에 또 배정
                const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
                
                team.members = teamStudents.map((student, index) => {
                    const studentName = student['성명'] || student['이름'] || `학생${index + 1}`;
                    const studentNumber = student['번호'] || index + 1;
                    
                    return {
                        role: shuffledRoles[index],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: currentRelayRound
                    };
                });
                
                console.log(`${team.name} ${currentRelayRound}라운드 참여 학생:`, teamStudents.map(s => `${s['성명']}(${s['번호']}번)`));
                
            } else {
                // 2명 이하: 한 학생이 1개 혹은 2개 역할에 배정되도록
                const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
                
                // 3명이 되도록 중복 허용하여 배정
                team.members = [];
                for (let i = 0; i < 3; i++) {
                    const student = teamStudents[i % teamStudents.length];
                    const studentName = student['성명'] || student['이름'] || `학생${i + 1}`;
                    const studentNumber = student['번호'] || i + 1;
                    
                    team.members.push({
                        role: shuffledRoles[i],
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: currentRelayRound
                    });
                }
                
                console.log(`${team.name} ${currentRelayRound}라운드 참여 학생 (중복 허용):`, team.members.map(m => `${m.studentName}(${m.studentNumber}번)`));
            }
            
            // 현재 라운드 멤버 정보 저장
            if (!team.roundMembers) team.roundMembers = {};
            team.roundMembers[currentRelayRound] = [...team.members];
            
            console.log(`${team.name} ${currentRelayRound}라운드 최종 멤버:`, team.members.map(m => `${m.role}: ${m.name}`));
            console.log(`${team.name} ${currentRelayRound}라운드 멤버 수: ${team.members.length}명`);
            
            // 3명이 아닌 경우 경고 및 강제 수정
            if (team.members.length !== 3) {
                console.warn(`⚠️ ${team.name}에 ${team.members.length}명만 배정됨! 3명이어야 함.`);
                
                // 강제로 3명이 되도록 수정
                while (team.members.length < 3) {
                    const additionalIndex = team.members.length;
                    const role = roles[additionalIndex % 3];
                    const student = teamStudents[additionalIndex % teamStudents.length];
                    const studentName = student['성명'] || student['이름'] || `학생${additionalIndex + 1}`;
                    const studentNumber = student['번호'] || additionalIndex + 1;
                    
                    team.members.push({
                        role: role,
                        name: `${studentName} (${studentNumber}번)`,
                        studentNumber: studentNumber,
                        studentName: studentName,
                        score: 0,
                        status: 'waiting',
                        round: currentRelayRound
                    });
                    
                    console.log(`${team.name} 강제 추가 멤버: ${role} - ${studentName} (${studentNumber}번)`);
                }
                
                console.log(`${team.name} 강제 수정 후 멤버 수: ${team.members.length}명`);
            }
        }
        
        // 팀 상태 초기화
        team.currentMember = 0;
        team.members.forEach(member => {
            member.status = 'waiting';
        });
        team.members[0].status = 'current';
    });
    
    // 최종 검증: 모든 팀에 3명이 배정되었는지 확인
    console.log('=== 최종 팀 멤버 검증 ===');
    relayTeams.forEach(team => {
        if (team.members.length !== 3) {
            console.error(`❌ ${team.name}에 ${team.members.length}명만 배정됨!`);
        } else {
            console.log(`✅ ${team.name}에 ${team.members.length}명 정상 배정됨`);
        }
    });
    console.log('=== 검증 완료 ===');
    
    console.log(`=== ${currentRelayRound}라운드 팀 멤버 업데이트 완료 ===`);
}

// 시간 표시 업데이트
function updateTimeDisplay() {
    const minutes = Math.floor(relayTimeRemaining / 60);
    const seconds = relayTimeRemaining % 60;
    const timeDisplay = document.getElementById('relay-time-remaining');
    if (timeDisplay) {
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        console.log(`시간 표시 업데이트: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
}

// 릴레이 시나리오 소리 재생
function playRelayScenarioSound(soundFile) {
    const sfxAudio = document.getElementById('sfx-audio');
    if (sfxAudio) {
        sfxAudio.src = soundFile;
        sfxAudio.volume = 0.7;
        sfxAudio.play().catch(error => {
            console.log('소리 재생 실패:', error);
        });
    }
}

// 릴레이 모드에서 점수 입력 (CPR 점수 입력과 유사)
function inputRelayScore(teamId, memberIndex, score) {
    if (relayTeams[teamId - 1] && relayTeams[teamId - 1].members[memberIndex]) {
        relayTeams[teamId - 1].members[memberIndex].score = score;
        relayTeams[teamId - 1].members[memberIndex].status = 'completed';
        
        // 다음 멤버로 진행
        if (memberIndex < 2) {
            relayTeams[teamId - 1].members[memberIndex + 1].status = 'current';
        }
        
        renderRelayTeams();
    }
}