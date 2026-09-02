let currentState = 'IDLE';
let logs = [];

function addLog(level, message) {
  const time = new Date().toLocaleTimeString();
  logs.push({ time, level, message });
  
  const container = document.getElementById('log-container');
  const entry = document.createElement('div');
  entry.className = `log-entry ${level}`;
  entry.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-icon">${getIcon(level)}</span>
    <span class="log-msg">${message}</span>
  `;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
  
  const fullContainer = document.getElementById('full-log-container');
  if (fullContainer) {
    fullContainer.appendChild(entry.cloneNode(true));
    fullContainer.scrollTop = fullContainer.scrollHeight;
  }
}

function getIcon(level) {
  const icons = { info: '●', success: '✓', warning: '⚠', error: '✗' };
  return icons[level] || '●';
}

function updateState(state) {
  currentState = state;
  const badge = document.getElementById('current-state');
  const desc = document.getElementById('state-desc');
  
  badge.textContent = state;
  badge.className = 'state-badge';
  
  if (['IMPLEMENTING', 'BUILDING', 'TESTING'].includes(state)) {
    badge.classList.add('running');
  } else if (state === 'COMPLETED') {
    badge.classList.add('success');
  } else if (['FAILED', 'BLOCKED', 'BUG_FOUND'].includes(state)) {
    badge.classList.add('error');
  } else if (['FIXING', 'RETESTING'].includes(state)) {
    badge.classList.add('warning');
  }
  
  const descriptions = {
    'IDLE': 'Waiting to start...',
    'ANALYZING': 'Analyzing project requirements...',
    'PLANNING': 'Creating implementation plan...',
    'IMPLEMENTING': 'Implementing features...',
    'BUILDING': 'Building project...',
    'TESTING': 'Running tests...',
    'INSPECTING': 'Inspecting results...',
    'BUG_FOUND': 'Bug detected, diagnosing...',
    'FIXING': 'Applying fixes...',
    'RETESTING': 'Retesting after fixes...',
    'IMPROVEMENT_SCAN': 'Scanning for improvements...',
    'FINAL_VALIDATION': 'Running final validation...',
    'CODE_REVIEW': 'Performing code review...',
    'COMPLETED': 'Project completed successfully!',
    'BLOCKED': 'Project blocked, needs intervention',
    'FAILED': 'Project failed'
  };
  
  desc.textContent = descriptions[state] || '';
}

function updateStats(data) {
  document.getElementById('tasks-count').textContent = data.tasks || 0;
  document.getElementById('tests-passed').textContent = data.testsPassed || 0;
  document.getElementById('bugs-open').textContent = data.bugsOpen || 0;
  document.getElementById('iteration').textContent = data.iteration || 0;
}

function updateHealth(score, status) {
  document.getElementById('health-fill').style.width = `${score}%`;
  document.getElementById('health-score').textContent = `${score}/100`;
  
  const statusEl = document.getElementById('health-status');
  statusEl.textContent = status;
  statusEl.style.color = score >= 80 ? 'var(--success)' : 
                          score >= 50 ? 'var(--warning)' : 'var(--error)';
}

function updateTaskList(tasks) {
  const container = document.getElementById('task-list');
  container.innerHTML = tasks.map(task => `
    <div class="task-item">
      <div class="task-status ${task.status.toLowerCase()}"></div>
      <div class="task-info">
        <div class="task-title">${task.title}</div>
        <div class="task-id">${task.id}</div>
      </div>
    </div>
  `).join('');
}

function updateBugList(bugs) {
  const container = document.getElementById('bug-list');
  container.innerHTML = bugs.map(bug => `
    <div class="bug-item">
      <div class="bug-severity ${bug.severity}"></div>
      <div class="bug-info">
        <div class="bug-title">${bug.title}</div>
        <div class="bug-id">${bug.id} - ${bug.severity}</div>
      </div>
    </div>
  `).join('');
}

function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  document.getElementById(`${viewName}-view`).classList.add('active');
  document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchView(item.dataset.view));
});

function startOrchestrator() {
  addLog('info', 'Starting Rose Orchestrator...');
  updateState('ANALYZING');
  updateHealth(100, 'Healthy');
  
  setTimeout(() => updateStats({ tasks: 5, iteration: 1 }), 1000);
  setTimeout(() => updateState('PLANNING'), 2000);
  setTimeout(() => addLog('success', 'Requirements analyzed'), 3000);
  setTimeout(() => updateState('IMPLEMENTING'), 4000);
  setTimeout(() => {
    updateTaskList([
      { id: 'TASK-001', title: 'Implement authentication', status: 'done' },
      { id: 'TASK-002', title: 'Create dashboard UI', status: 'running' },
      { id: 'TASK-003', title: 'Add data persistence', status: 'pending' }
    ]);
  }, 5000);
}

function stopOrchestrator() {
  addLog('warning', 'Stopping orchestrator...');
  updateState('IDLE');
}

function clearLogs() {
  logs = [];
  document.getElementById('full-log-container').innerHTML = '';
}

updateState('IDLE');
addLog('info', 'Rose Orchestrator ready. Press Start to begin.');
