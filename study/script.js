// 전역 변수
let currentScreen = 'setup';
let timer = null;
let timeElapsed = 0;
let selectedScenario = null;
let selectedRole = null;

// 역할별 상세 가이드
const stepGuides = {
    '환자 의식 확인': {
        title: '의식 및 반응 확인',
        description: '1. 환자의 옆에 앉아 어깨를 가볍게 두드리며 "괜찮으세요?"라고 큰 소리로 물어보세요.\n2. 환자의 반응이 없다면 의식이 없는 상태로 판단합니다.\n3. 이 과정은 10초 이내에 이루어져야 합니다.'
    },
    '신고자1에게 신고 요청': {
        title: '119 신고 요청',
        description: '1. 주변에 있는 특정 사람을 지목하여 "거기 안경 쓴 남자분, 119에 신고해주세요!"와 같이 명확하게 요청합니다.\n2. 불특정 다수에게 요청하면 책임감이 분산되어 아무도 신고하지 않을 수 있기 때문입니다.'
    },
    '보조자1에게 AED요청': {
        title: '자동심장충격기(AED) 요청',
        description: '1. 주변에 신고자와 다른 특정 사람을 지목하여 "파란 옷 입으신 여성분, 자동심장충격기 좀 가져다주세요!"와 같이 명확하게 요청합니다.\n2. 공항, 철도역, 300세대 이상 공동주택, 대형 쇼핑몰, 1000명 이상 체육시설 등에는 의무적으로 AED가 설치되어 있습니다.\n3. 공동주택-관리사무소, 학교(필수 아님)-중앙현관 혹은 보건실 등.'
    },
    'CPR시작': {
        title: '가슴 압박 시작',
        description: '1. 환자의 가슴 중앙(양쪽 젖꼭지 사이의 선과 흉골의 아래쪽 절반 부위)에 깍지 낀 손을 위치시킵니다.\n2. 팔꿈치를 곧게 펴고, 어깨와 팔이 일직선이 되도록 체중을 실어 강하고 빠르게 압박합니다.\n3. 분당 100~120회, 깊이 약 5cm로 30회 압박 후 인공호흡 2회를 반복합니다.\n4. 압박 시 손바닥이 갈비뼈에 닿지 않도록 주의합니다.'
    },
    '119에 장소 설명': {
        title: '정확한 위치 전달',
        description: '1. 119에 전화하여 현재 위치를 정확하게 설명합니다.\n2. "여기는 신서중학교 정문 앞 경찰서 건너편 도로입니다"와 같이 주변의 큰 건물, 도로명, 번지, 건물명 등을 명확히 말합니다.\n3. 위치 설명이 정확해야 구급대가 신속하게 도착할 수 있습니다.'
    },
    '119에 환자 상태 설명': {
        title: '환자 상태 브리핑',
        description: '1. 환자가 의식이 없고, 호흡이 없음을 명확하게 전달합니다.\n2. "10대로 보이는 여자(남자) 환자가 쓰러져 있고, 의식과 호흡이 없습니다"라고 설명합니다.\n3. 쓰러진 환경, 상황황 등도 함께 설명하면 좋습니다.'
    },
    '초기발견자1에게 도착시간 알려주기': {
        title: '구급대 도착 예정 시간 공유',
        description: '1. 119로부터 전달받은 구급대 도착 예정 시간을 현장의 구조자들에게 큰 소리로 알립니다.\n2. "구급차 5분 뒤 도착 예정입니다!"와 같이 모두가 들을 수 있게 말합니다.\n3. 도착 시간 공유는 현장 협력과 역할 분담에 매우 중요합니다.'
    },
    '초기발견자2에게 신고 요청': {
        title: '119 신고 요청(초기발견자2)',
        description: '1. 초기발견자2 역시 주변의 특정인을 지목하여 119 신고를 요청합니다.\n2. "빨간 옷 입으신 분, 119에 신고 부탁드립니다!"와 같이 명확하게 요청합니다.'
    },
    '보조자2에게 AED요청': {
        title: 'AED 요청(보조자2)',
        description: '1. 신고인과 다른 특정인에도 AED를 신속하게 가져오도록 요청합니다.\n2. "파란 운동화 신으신분, AED를 빨리 가져와 주세요!"와 같이 분명하게 말합니다.'
    },
    '초기발견자2에게 도착시간 알려주기': {
        title: '구급대 도착 예정 시간 공유(초기발견자2)',
        description: '1. 119로부터 전달받은 구급대 도착 예정 시간을 초기발견자2에게도 반드시 알립니다.\n2. "구급차 3분 뒤 도착 예정입니다!"와 같이 명확하게 전달합니다.'
    },
    'CPR이어받기': {
        title: '가슴 압박 교대',
        description: '1. 가슴 압박은 2분마다 교대하는 것이 가장 효과적입니다.\n2. "제가 압박하겠습니다!"라고 말하며 자연스럽게 교대합니다.\n3. 교대 시 CPR이 중단되지 않도록 신속하게 움직입니다.'
    },
    'AED가져오기': {
        title: 'AED 확보 및 전달',
        description: '1. 요청받은 즉시 AED의 위치를 찾아 신속하게 가져옵니다.\n2. AED를 가져온 후에는 환자 머리맡에 두고 즉시 사용할 수 있도록 준비합니다.'
    },
    'AED열고 부착하기': {
        title: 'AED 패드 부착',
        description: '1. AED의 전원을 켜고, 패드에 그려진 그림의 위치에 맞게 하나는 오른쪽 쇄골 아래, 다른 하나는 왼쪽 겨드랑이 아래에 부착합니다.\n2. 환자의 상의를 벗기고 맨살에 정확히 부착해야 합니다.\n3. 패드 부착 후에는 AED의 음성 안내에 따라 행동합니다.'
    },
    '주변 사람들 물린 후 AED 작동하기': {
        title: '안전 확보 및 심장 충격 실시',
        description: '1. AED가 심장 리듬을 분석할 때와 충격을 가할 때, "모두 물러나세요!"라고 외쳐 주변 사람을 환자에게서 떨어지게 합니다.\n2. 안전이 확보되면 깜박이는 충격 버튼을 눌러 심장 충격을 가합니다.\n3. 충격 후 즉시 가슴 압박을 재개합니다.'
    },
    '신고자2에게 신고 요청': {
        title: '119 신고 요청(신고자2)',
        description: '1. 주변에 있는 특정 사람을 지목하여 "거기 파란 옷 입으신 분, 119에 신고해주세요!"와 같이 명확하게 요청합니다.\n2. 불특정 다수에게 요청하면 책임감이 분산되어 아무도 신고하지 않을 수 있기 때문입니다.'
    },
};


const baseRoleChecklists = {
    '초기발견자1': ['환자 의식 확인', '신고자1에게 신고 요청', '보조자1에게 AED요청', 'CPR시작'],
    '초기발견자2': ['환자 의식 확인', '신고자2에게 신고 요청', '보조자2에게 AED요청', 'CPR시작'],
    '신고자1': ['119에 장소 설명', '119에 환자 상태 설명', '초기발견자1에게 도착시간 알려주기', 'CPR이어받기'],
    '신고자2': ['119에 장소 설명', '119에 환자 상태 설명', '초기발견자2에게 도착시간 알려주기', 'CPR이어받기'],
    '보조자1': ['AED가져오기', 'AED열고 부착하기', '주변 사람들 물린 후 AED 작동하기', 'CPR이어받기'],
    '보조자2': ['AED가져오기', 'AED열고 부착하기', '주변 사람들 물린 후 AED 작동하기', 'CPR이어받기']
};

function getAllRoles() {
    return Object.keys(baseRoleChecklists).map(name => ({
        name,
        checklist: baseRoleChecklists[name]
    }));
}

const scenarioData = [
    {
        title: '심정지 환자 발견 - 거리에서',
        description: '도로에서 갑자기 쓰러진 중년 남성을 발견했습니다. 주변에는 많은 사람들이 지나다니고 있습니다.',
        patientCondition: '의식 없음, 호흡 없음, 맥박 없음',
        environment: '도로변, 사람들이 많은 곳',
        sound: 'sounds/street.mp3',
    },
    {
        title: '심정지 환자 발견 - 실내(교실)에서',
        description: '교실에서 갑자기 쓰러진 친구를 발견했습니다. 익숙한 환경에서 응급상황이 발생했습니다.',
        patientCondition: '의식 없음, 호흡 없음, 맥박 없음',
        environment: '교실 내부, 조용한 환경',
        sound: 'sounds/classroom.mp3',
    },
    {
        title: '심정지 환자 발견 - 체육관에서',
        description: '체육관에서 운동 중 갑자기 쓰러진 학생을 발견했습니다. 많은 학생들이 지켜보고 있습니다.',
        patientCondition: '의식 없음, 호흡 없음, 맥박 없음',
        environment: '체육관, 학생들이 많은 곳',
        sound: 'sounds/gym.mp3',
    },
];

// DOM 요소들
const screens = {
    setup: document.getElementById('learning-setup-screen'),
    learning: document.getElementById('learning-screen'),
};

const bgAudio = document.getElementById('bg-audio');
const sfxAudio = document.getElementById('sfx-audio');

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    populateSelectors();
    document.getElementById('start-learning').addEventListener('click', startLearning);
    document.getElementById('back-to-setup').addEventListener('click', backToSetup);
});

// 화면 전환 함수
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenName].classList.add('active');
    currentScreen = screenName;
}

// 설정 화면의 선택지 채우기
function populateSelectors() {
    const scenarioSelect = document.getElementById('scenario-select');
    scenarioData.forEach((scenario, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = scenario.title;
        scenarioSelect.appendChild(option);
    });

    const roleSelect = document.getElementById('role-select');
    getAllRoles().forEach((role, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = role.name;
        roleSelect.appendChild(option);
    });
}

// 학습 시작
function startLearning() {
    const scenarioIndex = document.getElementById('scenario-select').value;
    const roleIndex = document.getElementById('role-select').value;
    
    selectedScenario = scenarioData[scenarioIndex];
    selectedRole = getAllRoles()[roleIndex];

    loadLearningScenario();
    showScreen('learning');
    startTimer();
}

// 학습 시나리오 로드
function loadLearningScenario() {
    // 헤더 정보 업데이트
    document.getElementById('learning-role-title').textContent = selectedRole.name;
    document.getElementById('learning-scenario-title').textContent = selectedScenario.title;
    document.getElementById('patient-condition-pres').textContent = selectedScenario.patientCondition;
    document.getElementById('environment-pres').textContent = selectedScenario.environment;
    document.getElementById('scenario-description-pres').textContent = selectedScenario.description;

    // 체크리스트 렌더링
    renderChecklist();

    // 배경 소리 재생
    if (selectedScenario.sound) {
        bgAudio.src = selectedScenario.sound;
        bgAudio.play().catch(e => console.error("배경음 재생 실패", e));
    }
}

// 학습용 체크리스트 렌더링
function renderChecklist() {
    const checklistContainer = document.getElementById('role-checklist-container');
    checklistContainer.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = `${selectedRole.name}의 역할`;
    checklistContainer.appendChild(title);

    const ul = document.createElement('ul');
    ul.className = 'role-checklist';
    
    selectedRole.checklist.forEach((item, index) => {
        const li = document.createElement('li');
        li.dataset.step = index;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(' ' + item));

        li.addEventListener('click', () => {
            showStepGuide(item);
            // 모든 active 클래스 제거 후 현재 항목에 추가
            ul.querySelectorAll('li').forEach(el => el.classList.remove('active-step'));
            li.classList.add('active-step');
        });
        
        ul.appendChild(li);
    });
    checklistContainer.appendChild(ul);

    // 첫 번째 가이드 바로 표시
    if (selectedRole.checklist.length > 0) {
        showStepGuide(selectedRole.checklist[0]);
        ul.querySelector('li').classList.add('active-step');
    }
}

// 단계별 가이드 표시
function showStepGuide(stepItem) {
    const guideContent = document.getElementById('step-guide-content');
    const guide = stepGuides[stepItem];

    if (guide) {
        // 번호(1. 2. 3. 등)로 시작하는 항목을 각각 <p>로 분리
        // 1. ... 2. ... 3. ... 형식의 description을 정규식으로 분리
        const lines = guide.description
            .replace(/\n/g, ' ') // 줄바꿈을 공백으로 통일
            .split(/(?=\d+\.)/) // 번호로 시작하는 부분마다 분리
            .map(line => line.trim())
            .filter(line => line.length > 0);
        guideContent.innerHTML = `
            <h4>${guide.title}</h4>
            ${lines.map(line => `<p>${line}</p>`).join('')}
        `;
    } else {
        guideContent.innerHTML = '<p>해당 단계에 대한 상세 정보가 없습니다.</p>';
    }
}

// 설정으로 돌아가기
function backToSetup() {
    stopTimer();
    bgAudio.pause();
    sfxAudio.pause();
    showScreen('setup');
}

// 타이머 (경과 시간) 시작
function startTimer() {
    timeElapsed = 0;
    updateTimerDisplay();
    timer = setInterval(() => {
        timeElapsed++;
        updateTimerDisplay();
    }, 1000);
}

// 타이머 중지
function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

// 타이머 표시 업데이트
function updateTimerDisplay() {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('time-elapsed-pres').textContent = timeString;
}