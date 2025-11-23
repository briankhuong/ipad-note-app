class App {
    constructor() {
        this.sessionManager = new SessionManager();
        this.groupsManager = new GroupsManager();
        this.indicatorsManager = new IndicatorsManager();
        this.drawingCanvas = new DrawingCanvas('noteCanvas');
    
        
        // Make groupsManager globally available for sessionManager
        window.groupsManager = this.groupsManager;
        window.app = this; // Global reference for indicators
        
        // New state variables
        this.isSidebarCollapsed = false;
        this.globalFilterMode = 'all'; // 'all', 'good', 'growth'
        this.currentFilters = {};
        this.confirmedAction = null;
        this.confirmedActionData = null;
        
        this.setupEventListeners();
        this.showDashboard();
        this.updateCounts();
        
        // Set up drawing save callback
        this.drawingCanvas.setOnSaveCallback((indicatorId, drawingData, performanceType) => {
            this.sessionManager.saveIndicatorNotes(indicatorId, drawingData, performanceType);
            this.updateProgress();
            this.updateIndicatorPerformanceDisplay();
        });

        this.editingSessionId = null;
        this.editingGroupId = null;
        this.currentGroupId = null;
        
        
     /*       
    this.initializeSidebarToggle(); // ADD THIS LINE
    this.setupCollapseButton();     // ADD THIS LINE
    */
    }

    setupEventListeners() {
        // Dashboard tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Dashboard events
        document.getElementById('newSessionBtn').addEventListener('click', () => {
            this.showNewSessionModal();
        });
        
        document.getElementById('newGroupBtn').addEventListener('click', () => {
            this.showNewGroupModal();
        });
        
        document.getElementById('backToDashboard').addEventListener('click', () => {
            this.showDashboard();
        });
        
        // New session modal events
        document.getElementById('newSessionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewSession();
        });
        
        document.getElementById('cancelSessionBtn').addEventListener('click', () => {
            this.hideNewSessionModal();
        });
        
        document.getElementById('cancelSessionBtn2').addEventListener('click', () => {
            this.hideNewSessionModal();
        });

        // New group modal events
        document.getElementById('newGroupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.editingGroupId) {
                this.updateGroup(this.editingGroupId);
            } else {
                this.createNewGroup();
            }
        });
        
        document.querySelectorAll('.close-group-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideNewGroupModal();
            });
        });

        // Edit session modal events
        document.getElementById('editSessionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateSession(this.editingSessionId);
        });
        
        document.querySelectorAll('.close-edit-session-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideEditSessionModal();
            });
        });

        // Confirmation modal events
        document.querySelectorAll('.close-confirmation-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideConfirmationModal();
            });
        });

        document.getElementById('confirmActionBtn').addEventListener('click', () => {
            this.executeConfirmedAction();
        });

        // Trash events
        document.getElementById('emptyTrashBtn').addEventListener('click', () => {
            this.showConfirmation(
                'Empty Trash Bin',
                'Are you sure you want to permanently delete all items in the trash? This action cannot be undone.',
                'emptyTrash'
            );
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.drawingCanvas.saveDrawing();
            this.showNotification('Progress saved successfully');
        });
        
        // Tool events
        document.getElementById('penBtn').addEventListener('click', () => {
            this.setActiveTool('pen');
            this.drawingCanvas.setTool('pen');
            this.updateStatus('Pen tool selected');
        });

        document.getElementById('eraserBtn').addEventListener('click', () => {
            this.setActiveTool('eraser');
            this.drawingCanvas.setTool('eraser');
            this.updateStatus('Eraser tool selected');
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.drawingCanvas.clearCanvas();
            this.updateStatus('Canvas cleared');
        });

        document.getElementById('colorPicker').addEventListener('input', (e) => {
            this.drawingCanvas.setColor(e.target.value);
        });

        const brushSize = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        
        if (brushSize && brushSizeValue) {
            brushSize.addEventListener('input', (e) => {
                const size = e.target.value;
                brushSizeValue.textContent = `${size}px`;
                this.drawingCanvas.setBrushSize(parseInt(size));
            });
        }

        // School dropdown change events
        const schoolSelect = document.getElementById('schoolSelect');
        if (schoolSelect) {
            schoolSelect.addEventListener('change', (e) => {
                this.handleSchoolSelection('schoolSelect', e.target.value);
            });
        }
        
        const editSchoolSelect = document.getElementById('editSchoolSelect');
        if (editSchoolSelect) {
            editSchoolSelect.addEventListener('change', (e) => {
                this.handleSchoolSelection('editSchoolSelect', e.target.value);
            });
        }

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-backdrop') || 
                    e.target.id === 'newSessionModal' || 
                    e.target.id === 'newGroupModal' || 
                    e.target.id === 'editSessionModal' || 
                    e.target.id === 'confirmationModal') {
                    this.hideNewSessionModal();
                    this.hideNewGroupModal();
                    this.hideEditSessionModal();
                    this.hideConfirmationModal();
                }
            });
        });

        // Apple Pencil detection
        const canvas = document.getElementById('noteCanvas');
        if (canvas) {
            canvas.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'pen') {
                    this.updateStatus('Apple Pencil detected - Drawing...');
                    this.hideCanvasOverlay();
                }
            });

            canvas.addEventListener('pointerup', (e) => {
                if (e.pointerType === 'pen') {
                    this.updateStatus('Drawing saved');
                }
            });
        }

        // Group view events - FIX: Setup back button properly
        this.setupGroupViewBackButton();
        
        const newSessionForGroup = document.getElementById('newSessionForGroup');
        if (newSessionForGroup) {
            newSessionForGroup.addEventListener('click', () => {
                this.createNewSessionForCurrentGroup();
            });
        }
        
        const editCurrentGroup = document.getElementById('editCurrentGroup');
        if (editCurrentGroup) {
            editCurrentGroup.addEventListener('click', () => {
                this.editCurrentGroup();
            });
        }

        // Setup sidebar toggle buttons
        this.setupSidebarToggle();

        // Global filter toggle
        const globalFilter = document.getElementById('globalFilter');
        if (globalFilter) {
            globalFilter.addEventListener('change', (e) => {
                this.globalFilterMode = e.target.value;
                this.applyGlobalFilter();
            });
        }

        // Filter events
        const applyFilters = document.getElementById('applyFilters');
        if (applyFilters) {
            applyFilters.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Window resize handler for responsive design
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Search functionality
        this.setupSearchFunctionality();
    }

    // FIX 1: Back button in group view
    setupGroupViewBackButton() {
        // Group view events - FIX: Back button
        const backToGroups = document.getElementById('backToGroups');
        if (backToGroups) {
            // Remove and re-add to ensure clean event listener
            const newBackBtn = backToGroups.cloneNode(true);
            backToGroups.parentNode.replaceChild(newBackBtn, backToGroups);
            
            document.getElementById('backToGroups').addEventListener('click', () => {
                console.log('Back button clicked - working!');
                this.showGroupsTab();
            });
        }
    }

    setupSearchFunctionality() {
        // Create search input for sessions tab
        const sessionsHeader = document.querySelector('#sessionsTab .section-header');
        
        if (!sessionsHeader) {
            console.error('Sessions header not found');
            return;
        }

        // Create filter toggle button
        const filterToggle = document.createElement('button');
        filterToggle.id = 'toggleFilters';
        filterToggle.className = 'btn btn-ghost btn-with-icon';
        filterToggle.innerHTML = `
            <span class="btn-icon">🔍</span>
            Filter
        `;
        
        filterToggle.addEventListener('click', () => {
            this.toggleFiltersPanel();
        });
        
        // Create search input
        const sessionsSearchInput = document.createElement('input');
        sessionsSearchInput.type = 'text';
        sessionsSearchInput.placeholder = 'Search observations...';
        sessionsSearchInput.className = 'search-input';
        sessionsSearchInput.style.cssText = `
            padding: var(--space-3) var(--space-4);
            background: var(--bg-surface);
            border: 1px solid var(--border-primary);
            border-radius: var(--radius-md);
            color: var(--text-primary);
            font-size: 14px;
            width: 200px;
        `;
        
        sessionsSearchInput.addEventListener('input', (e) => {
            this.searchSessions(e.target.value);
        });
        
        sessionsHeader.appendChild(filterToggle);
        sessionsHeader.appendChild(sessionsSearchInput);

        // Create search input for groups tab
        const groupsHeader = document.querySelector('#groupsTab .section-header');
        if (groupsHeader) {
            const groupsSearchInput = document.createElement('input');
            groupsSearchInput.type = 'text';
            groupsSearchInput.placeholder = 'Search school groups...';
            groupsSearchInput.className = 'search-input';
            groupsSearchInput.style.cssText = `
                padding: var(--space-3) var(--space-4);
                background: var(--bg-surface);
                border: 1px solid var(--border-primary);
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-size: 14px;
                width: 200px;
            `;
            
            groupsSearchInput.addEventListener('input', (e) => {
                this.searchGroups(e.target.value);
            });
            
            groupsHeader.appendChild(groupsSearchInput);
        }

        // Setup filters panel
        this.setupFiltersPanel();
    }

    setupFiltersPanel() {
        const sessionsTab = document.getElementById('sessionsTab');
        
        if (!sessionsTab) {
            console.error('Sessions tab not found');
            return;
        }

        // Create filters panel
        const filtersPanel = document.createElement('div');
        filtersPanel.id = 'filtersPanel';
        filtersPanel.className = 'filters-panel';
        filtersPanel.style.cssText = `
            background: var(--bg-surface);
            border: 1px solid var(--border-primary);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
            margin-bottom: var(--space-4);
            display: none;
        `;

        filtersPanel.innerHTML = `
            <div class="filters-header">
                <h4>Filter Observations</h4>
            </div>
            <div class="filters-grid">
                <div class="filter-group">
                    <label class="filter-label">School</label>
                    <select id="filterSchool" class="filter-input">
                        <option value="all">All Schools</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Campus</label>
                    <select id="filterCampus" class="filter-input">
                        <option value="all">All Campuses</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Status</label>
                    <select id="filterStatus" class="filter-input">
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Progress</label>
                    <select id="filterProgress" class="filter-input">
                        <option value="all">All Progress</option>
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="complete">Complete</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Start Date</label>
                    <input type="date" id="filterStartDate" class="filter-input">
                </div>
                <div class="filter-group">
                    <label class="filter-label">End Date</label>
                    <input type="date" id="filterEndDate" class="filter-input">
                </div>
                <div class="filter-group">
                    <label class="filter-label">Sort By</label>
                    <select id="filterSortBy" class="filter-input">
                        <option value="date">Date Created</option>
                        <option value="teacher">Teacher Name</option>
                        <option value="school">School</option>
                        <option value="progress">Progress</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Order</label>
                    <select id="filterSortOrder" class="filter-input">
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>
            <div class="filters-actions">
                <button id="applyFilters" class="btn btn-primary">Apply Filters</button>
                <button id="clearFilters" class="btn btn-ghost">Clear All</button>
            </div>
        `;

        // Insert filters panel before sessions container
        const sessionsContainer = document.getElementById('sessionsContainer');
        if (sessionsContainer) {
            sessionsTab.insertBefore(filtersPanel, sessionsContainer);
        } else {
            sessionsTab.appendChild(filtersPanel);
        }
    }

    // Dashboard and Tab Management
    showDashboard() {
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('groupView').style.display = 'none';
        document.getElementById('noteApp').style.display = 'none';
        
        // Load initial data
        this.loadSessionsList();
        this.loadGroupsList();
        this.updateCounts();
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab and activate button
        const tabElement = document.getElementById(tabName + 'Tab');
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (tabElement) tabElement.style.display = 'block';
        if (tabButton) tabButton.classList.add('active');
        
        // Load data for the tab
        if (tabName === 'sessions') {
            this.loadSessionsList();
        } else if (tabName === 'groups') {
            this.loadGroupsList();
        } else if (tabName === 'trash') {
            this.loadTrashItems();
        }
    }

    showGroupsTab() {
        console.log('showGroupsTab called');
        
        // 1. Hide the group view
        const groupView = document.getElementById('groupView');
        if (groupView) {
            groupView.style.display = 'none';
            console.log('Group view hidden');
        }
        
        // 2. Show the dashboard (the container that holds the tabs)
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.style.display = 'block';
            console.log('Dashboard shown');
        }
        
        // 3. Now switch to the groups tab
        this.switchTab('groups');
        
        console.log('Successfully returned to groups view');
    }

    showNoteApp() {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('groupView').style.display = 'none';
        document.getElementById('noteApp').style.display = 'block';
    }

    // Session Management
    showNewSessionModal() {
        document.getElementById('newSessionModal').style.display = 'flex';
        // Reset form
        document.getElementById('newSessionForm').reset();
        this.editingSessionId = null;
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
        
        // Populate school dropdown
        this.populateSchoolDropdowns();
    }

    hideNewSessionModal() {
        document.getElementById('newSessionModal').style.display = 'none';
    }

    createNewSession() {
        const form = document.getElementById('newSessionForm');
        
        const formData = {
            school: document.getElementById('schoolSelect').value,
            campus: document.getElementById('campus').value,
            teacher: document.getElementById('teacher').value.trim(),
            date: document.getElementById('date').value,
            unit: parseInt(document.getElementById('unit').value) || 1,
            lesson: parseInt(document.getElementById('lesson').value) || 1
        };
        
        // Validate required fields
        if (!formData.school || !formData.teacher || !formData.date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        console.log('Creating session with data:', formData);
        
        const session = this.sessionManager.createSession(
            formData.school,
            formData.campus,
            formData.teacher,
            formData.date,
            formData.unit,
            formData.lesson
        );
        
        if (session) {
            this.hideNewSessionModal();
            this.loadSession(session.id);
            this.showNotification('New observation session created');
        }
    }

    // FIX 4: Campus dropdown in edit observation
    editSession(sessionId) {
    const session = this.sessionManager.getSessionForEdit(sessionId);
    if (session) {
        this.editingSessionId = sessionId;
        
        // Populate school dropdowns first
        this.populateSchoolDropdowns();
        
        // Set form values
        document.getElementById('editSchoolSelect').value = session.school || '';
        document.getElementById('editTeacher').value = session.teacher || '';
        document.getElementById('editDate').value = session.date || '';
        document.getElementById('editUnit').value = session.unit || '';
        document.getElementById('editLesson').value = session.lesson || '';
        
        // FIX: Wait for DOM to update, then populate campuses
        setTimeout(() => {
            if (session.school) {
                this.handleSchoolSelection('editSchoolSelect', session.school);
                
                // Set campus after campuses are loaded
                setTimeout(() => {
                    const campusSelect = document.getElementById('editCampus');
                    if (campusSelect) {
                        campusSelect.value = session.campus || '';
                    }
                }, 150);
            }
        }, 100);
        
        document.getElementById('editSessionModal').style.display = 'flex';
    }
}

    updateSession(sessionId) {
        const form = document.getElementById('editSessionForm');
        
        const updates = {
            school: document.getElementById('editSchoolSelect').value,
            campus: document.getElementById('editCampus').value,
            teacher: document.getElementById('editTeacher').value.trim(),
            date: document.getElementById('editDate').value,
            unit: parseInt(document.getElementById('editUnit').value) || 1,
            lesson: parseInt(document.getElementById('editLesson').value) || 1
        };
        
        // Validate required fields
        if (!updates.school || !updates.teacher || !updates.date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        console.log('Updating session with data:', updates);
        
        const updatedSession = this.sessionManager.updateSession(sessionId, updates);
        if (updatedSession) {
            this.hideEditSessionModal();
            this.loadSessionsList();
            this.showNotification('Observation session updated');
        }
    }

    hideEditSessionModal() {
        document.getElementById('editSessionModal').style.display = 'none';
        this.editingSessionId = null;
    }

    deleteSession(sessionId) {
        this.showConfirmation(
            'Delete Observation',
            'Are you sure you want to delete this observation? It will be moved to trash.',
            'deleteSession',
            sessionId
        );
    }

    // Group Management
    showNewGroupModal() {
        document.getElementById('newGroupModal').style.display = 'flex';
        document.getElementById('newGroupForm').reset();
        this.editingGroupId = null;
    }

    hideNewGroupModal() {
        document.getElementById('newGroupModal').style.display = 'none';
    }

    createNewGroup() {
        const form = document.getElementById('newGroupForm');
        const formData = new FormData(form);
        
        const group = this.groupsManager.createGroup(
            formData.get('groupName'),
            formData.get('adminName'),
            formData.get('adminPhone'),
            formData.get('schoolAddress'),
            formData.get('campusGroup')
        );
        
        if (group) {
            this.hideNewGroupModal();
            this.loadGroupsList();
            this.showNotification('New school group created');
        }
    }

    updateGroup(groupId) {
        const form = document.getElementById('newGroupForm');
        const formData = new FormData(form);
        
        const updates = {
            schoolName: formData.get('groupName'),
            adminName: formData.get('adminName'),
            adminPhone: formData.get('adminPhone'),
            schoolAddress: formData.get('schoolAddress'),
            campus: formData.get('campusGroup')
        };
        
        const updatedGroup = this.groupsManager.updateGroup(groupId, updates);
        if (updatedGroup) {
            this.hideNewGroupModal();
            this.loadGroupsList();
            this.showNotification('School group updated');
        }
    }

    editGroup(groupId) {
        const group = this.groupsManager.getGroup(groupId);
        if (group) {
            this.editingGroupId = groupId;
            
            // Populate form
            document.getElementById('groupName').value = group.schoolName;
            document.getElementById('adminName').value = group.adminName;
            document.getElementById('adminPhone').value = group.adminPhone || '';
            document.getElementById('schoolAddress').value = group.schoolAddress || '';
            document.getElementById('campusGroup').value = group.campus || '';
            
            document.getElementById('newGroupModal').style.display = 'flex';
        }
    }

    editCurrentGroup() {
        if (this.currentGroupId) {
            this.editGroup(this.currentGroupId);
        }
    }

    deleteGroup(groupId) {
        this.showConfirmation(
            'Delete School Group',
            'Are you sure you want to delete this school group? It will be moved to trash.',
            'deleteGroup',
            groupId
        );
    }

    createNewSessionForCurrentGroup() {
        if (this.currentGroupId) {
            const group = this.groupsManager.getGroup(this.currentGroupId);
            if (group) {
                // Pre-populate school and campus in new session form
                document.getElementById('schoolSelect').value = group.schoolName;
                document.getElementById('campus').value = group.campus || '';
                
                // Trigger campus options update
                this.handleSchoolSelection('schoolSelect', group.schoolName);
                
                this.showNewSessionModal();
            }
        }
    }

    showGroupView(groupId) {
        const group = this.groupsManager.getGroup(groupId);
        if (group) {
            this.currentGroupId = groupId;
            
            // Update group view header
            document.getElementById('groupViewTitle').textContent = group.schoolName;
            document.getElementById('groupViewSubtitle').textContent = 
                `${group.schoolName}${group.campus ? ` • ${group.campus}` : ''}`;
            
            // FIX: Setup back button
            this.setupGroupViewBackButton();
            
            // Load group sessions
            this.groupsManager.renderGroupSessions(
                document.getElementById('groupSessionsContainer'),
                groupId,
                (sessionId) => this.loadSession(sessionId),
                (sessionId) => this.editSession(sessionId),
                (sessionId) => this.deleteSession(sessionId)
            );
            
            // Show group view
            document.getElementById('dashboard').style.display = 'none';
            document.getElementById('groupView').style.display = 'block';
            document.getElementById('noteApp').style.display = 'none';
        }
    }

    // School Selection Handler
    handleSchoolSelection(selectId, schoolName) {
        const campusSelect = selectId === 'schoolSelect' ? 
            document.getElementById('campus') : 
            document.getElementById('editCampus');
            
        if (campusSelect && schoolName) {
            const currentValue = campusSelect.value;
            campusSelect.innerHTML = '<option value="">Select Campus</option>';
            
            // Get campuses from groupsManager
            const campuses = this.groupsManager.getCampusesForSchool(schoolName);
            campuses.forEach(campus => {
                const option = document.createElement('option');
                option.value = campus;
                option.textContent = campus;
                campusSelect.appendChild(option);
            });
            
            // Restore previous value if it exists in new options
            if (campuses.includes(currentValue)) {
                campusSelect.value = currentValue;
            }
        }
    }

    // Populate school dropdowns
    populateSchoolDropdowns() {
        const schools = this.groupsManager.getSchoolsForDropdown();
        const schoolSelects = [
            document.getElementById('schoolSelect'),
            document.getElementById('editSchoolSelect'),
            document.getElementById('filterSchool')
        ];
        
        schoolSelects.forEach(select => {
            if (select) {
                // Clear existing options except the first one
                const firstOption = select.options[0];
                select.innerHTML = '';
                if (firstOption) select.appendChild(firstOption);
                
                // Add schools from groupsManager
                Object.keys(schools).sort().forEach(school => {
                    const option = document.createElement('option');
                    option.value = school;
                    option.textContent = school;
                    select.appendChild(option);
                });
            }
        });
    }

    // Global Filter System
    applyGlobalFilter() {
        const indicators = document.querySelectorAll('.indicator-item');
        let visibleCount = 0;
        
        indicators.forEach(indicator => {
            const indicatorId = indicator.dataset.id;
            const notes = this.sessionManager.getIndicatorNotes(indicatorId);
            
            switch (this.globalFilterMode) {
                case 'all':
                    indicator.style.display = 'block';
                    visibleCount++;
                    break;
                case 'good':
                    const showGood = notes && notes.performanceType === 'good';
                    indicator.style.display = showGood ? 'block' : 'none';
                    if (showGood) visibleCount++;
                    break;
                case 'growth':
                    const showGrowth = notes && notes.performanceType === 'growth';
                    indicator.style.display = showGrowth ? 'block' : 'none';
                    if (showGrowth) visibleCount++;
                    break;
            }
        });
    }

    // Confirmation Modal
    showConfirmation(title, message, action, data = null) {
        this.confirmedAction = action;
        this.confirmedActionData = data;
        
        document.getElementById('confirmationTitle').textContent = title;
        document.getElementById('confirmationMessage').textContent = message;
        document.getElementById('confirmationModal').style.display = 'flex';
    }

    hideConfirmationModal() {
        document.getElementById('confirmationModal').style.display = 'none';
        this.confirmedAction = null;
        this.confirmedActionData = null;
    }

    executeConfirmedAction() {
        if (!this.confirmedAction) return;
        
        switch (this.confirmedAction) {
            case 'deleteSession':
                if (this.confirmedActionData) {
                    this.sessionManager.deleteSession(this.confirmedActionData);
                    this.loadSessionsList();
                    this.showNotification('Observation moved to trash');
                }
                break;
                
            case 'deleteGroup':
                if (this.confirmedActionData) {
                    this.groupsManager.deleteGroup(this.confirmedActionData);
                    this.loadGroupsList();
                    this.showNotification('School group moved to trash');
                }
                break;
                
            case 'emptyTrash':
                this.groupsManager.emptyTrash();
                this.loadTrashItems();
                this.showNotification('Trash emptied');
                break;
        }
        
        this.hideConfirmationModal();
    }
/*
    // ADD THIS METHOD - Setup collapse button
    setupCollapseButton() {
        const collapseBtn = document.getElementById('collapseBtn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }
*/

    // Enhanced Features
    toggleSidebar() {       
    console.log('toggleSidebar called');
    console.log('Collapse button:', document.getElementById('collapseBtn'));
    console.log('Expand button:', document.getElementById('sidebar-toggle-btn'));
    const sidebar = document.querySelector('.indicators-sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const collapseIcon = collapseBtn?.querySelector('.collapse-icon');
    const toggleIcon = sidebarToggleBtn?.querySelector('.toggle-icon');


    console.log('Before - Sidebar collapsed:', sidebar.classList.contains('collapsed'));
    console.log('Before - Collapse btn display:', collapseBtn?.style.display);
    console.log('Before - Expand btn display:', sidebarToggleBtn?.style.display);
    
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    
    if (this.isSidebarCollapsed) {
        sidebar.classList.add('collapsed');
        if (collapseIcon) collapseIcon.textContent = '▶';
        if (toggleIcon) toggleIcon.textContent = '◀';
        collapseBtn.setAttribute('title', 'Expand sidebar');
        if (sidebarToggleBtn) {
            sidebarToggleBtn.style.display = 'flex'; // SHOW expand button
            sidebarToggleBtn.setAttribute('title', 'Expand sidebar');
        }
    } else {
        sidebar.classList.remove('collapsed');
        if (collapseIcon) collapseIcon.textContent = '◀';
        if (toggleIcon) toggleIcon.textContent = '▶';
        collapseBtn.setAttribute('title', 'Collapse sidebar');
        if (sidebarToggleBtn) {
            sidebarToggleBtn.style.display = 'none'; // HIDE expand button
            sidebarToggleBtn.setAttribute('title', 'Collapse sidebar');
        }
    }
    
    setTimeout(() => {
        this.drawingCanvas.resizeCanvas();
    }, 300);
}

// Make sure to initialize the button as hidden
/*initializeSidebarToggle() {
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.style.display = 'none'; // Start hidden
        sidebarToggleBtn.addEventListener('click', () => {
            this.toggleSidebar();
        });
    }
}*/

    updateIndicatorPerformanceDisplay() {
        const indicators = document.querySelectorAll('.indicator-item');
        indicators.forEach(indicator => {
            const indicatorId = indicator.dataset.id;
            const notes = this.sessionManager.getIndicatorNotes(indicatorId);
            
            // Remove existing performance classes
            indicator.classList.remove('good-point', 'growth-area', 'has-notes', 'active');
            
            if (notes && notes.performanceType) {
                indicator.classList.add('has-notes');
                if (notes.performanceType === 'good') {
                    indicator.classList.add('good-point');
                } else if (notes.performanceType === 'growth') {
                    indicator.classList.add('growth-area');
                }
            }
            
            // Update performance badge
            this.updatePerformanceBadge(indicator, indicatorId);
        });
        
        // Apply global filter after update
        this.applyGlobalFilter();
    }

    updatePerformanceBadge(indicatorElement, indicatorId) {
        let badge = indicatorElement.querySelector('.performance-badge');
        const notes = this.sessionManager.getIndicatorNotes(indicatorId);
        
        if (notes && notes.performanceType) {
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'performance-badge';
                const indicatorIdElement = indicatorElement.querySelector('.indicator-id');
                if (indicatorIdElement) {
                    indicatorIdElement.appendChild(badge);
                }
            }
            badge.className = `performance-badge ${notes.performanceType}`;
            badge.style.display = 'block';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }

    // Filter System
    toggleFiltersPanel() {
        const filtersPanel = document.getElementById('filtersPanel');
        if (!filtersPanel) return;
        
        const isVisible = filtersPanel.style.display === 'block';
        
        if (isVisible) {
            filtersPanel.style.display = 'none';
        } else {
            filtersPanel.style.display = 'block';
            this.populateFilterOptions();
        }
    }

    populateFilterOptions() {
        // Populate school dropdowns
        this.populateSchoolDropdowns();
        
        const filterOptions = this.sessionManager.getFilterOptions();
        
        // Populate campus filter
        const campusSelect = document.getElementById('filterCampus');
        if (campusSelect) {
            campusSelect.innerHTML = '<option value="all">All Campuses</option>';
            filterOptions.campuses.forEach(campus => {
                const option = document.createElement('option');
                option.value = campus;
                option.textContent = campus;
                campusSelect.appendChild(option);
            });
        }
    }

    applyFilters() {
        const filters = {
            school: document.getElementById('filterSchool')?.value || 'all',
            campus: document.getElementById('filterCampus')?.value || 'all',
            status: document.getElementById('filterStatus')?.value || 'all',
            progress: document.getElementById('filterProgress')?.value || 'all',
            startDate: document.getElementById('filterStartDate')?.value || '',
            endDate: document.getElementById('filterEndDate')?.value || '',
            sortBy: document.getElementById('filterSortBy')?.value || 'date',
            sortOrder: document.getElementById('filterSortOrder')?.value || 'desc'
        };

        // Remove empty filters
        Object.keys(filters).forEach(key => {
            if (!filters[key] || filters[key] === 'all') {
                delete filters[key];
            }
        });

        this.currentFilters = filters;
        this.loadSessionsList();

        // Show filter count badge
        const filterCount = Object.keys(filters).length;
        const toggleBtn = document.getElementById('toggleFilters');
        if (toggleBtn) {
            let badge = toggleBtn.querySelector('.filter-badge');
            
            if (filterCount > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'filter-badge';
                    badge.style.cssText = `
                        background: var(--accent-primary);
                        color: white;
                        border-radius: 50%;
                        width: 16px;
                        height: 16px;
                        font-size: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute;
                        top: -4px;
                        right: -4px;
                    `;
                    toggleBtn.style.position = 'relative';
                    toggleBtn.appendChild(badge);
                }
                badge.textContent = filterCount;
            } else if (badge) {
                badge.remove();
            }
        }

        this.showNotification(`Applied ${filterCount} filter${filterCount !== 1 ? 's' : ''}`);
    }

    clearFilters() {
        // Reset all filter inputs
        const filterIds = ['filterSchool', 'filterCampus', 'filterStatus', 'filterProgress', 'filterStartDate', 'filterEndDate', 'filterSortBy', 'filterSortOrder'];
        filterIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'select-one') {
                    element.value = element.id === 'filterSortBy' ? 'date' : 
                                  element.id === 'filterSortOrder' ? 'desc' : 'all';
                } else if (element.type === 'date') {
                    element.value = '';
                }
            }
        });

        this.currentFilters = {};
        this.loadSessionsList();

        // Remove filter badge
        const toggleBtn = document.getElementById('toggleFilters');
        if (toggleBtn) {
            const badge = toggleBtn.querySelector('.filter-badge');
            if (badge) {
                badge.remove();
            }
        }

        this.showNotification('Filters cleared');
    }

    // Data Loading Methods
    loadSessionsList() {
        const container = document.getElementById('sessionsContainer');
        const emptyState = document.getElementById('emptySessionsState');
        
        if (!container || !emptyState) return;
        
        this.sessionManager.renderSessionsList(
            container,
            (sessionId) => this.loadSession(sessionId),
            (sessionId) => this.editSession(sessionId),
            (sessionId) => this.deleteSession(sessionId),
            this.currentFilters
        );
        this.updateCounts();
    }

    loadGroupsList() {
        const container = document.getElementById('groupsContainer');
        const emptyState = document.getElementById('emptyGroupsState');
        
        if (!container || !emptyState) return;
        
        this.groupsManager.renderGroupsList(
            container,
            (groupId) => this.showGroupView(groupId),
            (groupId) => this.editGroup(groupId),
            (groupId) => this.deleteGroup(groupId)
        );
        this.updateCounts();
    }

    loadTrashItems() {
        const container = document.getElementById('trashContainer');
        const emptyState = document.getElementById('emptyTrashState');
        
        if (!container || !emptyState) return;
        
        // Create sessions and groups containers for trash
        let sessionsContainer = container.querySelector('.trash-sessions');
        let groupsContainer = container.querySelector('.trash-groups');
        
        if (!sessionsContainer) {
            sessionsContainer = document.createElement('div');
            sessionsContainer.className = 'trash-sessions';
            container.appendChild(sessionsContainer);
        }
        
        if (!groupsContainer) {
            groupsContainer = document.createElement('div');
            groupsContainer.className = 'trash-groups';
            container.appendChild(groupsContainer);
        }
        
        this.groupsManager.renderTrashList(
            sessionsContainer,
            groupsContainer,
            (itemId, itemType) => this.restoreItem(itemId, itemType),
            (itemId, itemType) => this.permanentlyDeleteItem(itemId, itemType)
        );
        this.updateCounts();
    }

    // Search Functionality
    searchSessions(query) {
        const container = document.getElementById('sessionsContainer');
        const emptyState = document.getElementById('emptySessionsState');
        
        if (!container || !emptyState) return;
        
        if (!query.trim()) {
            this.loadSessionsList();
            return;
        }
        
        const filteredSessions = this.sessionManager.searchSessions(query);
        this.renderFilteredSessions(filteredSessions, container, emptyState);
    }

    searchGroups(query) {
        const container = document.getElementById('groupsContainer');
        const emptyState = document.getElementById('emptyGroupsState');
        
        if (!container || !emptyState) return;
        
        if (!query.trim()) {
            this.loadGroupsList();
            return;
        }
        
        const filteredGroups = this.groupsManager.searchGroups(query);
        this.renderFilteredGroups(filteredGroups, container, emptyState);
    }

    renderFilteredSessions(sessions, container, emptyState) {
        container.innerHTML = '';
        
        if (sessions.length === 0) {
            emptyState.style.display = 'block';
            container.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        container.style.display = 'grid';

        sessions.forEach(session => {
            const sessionElement = this.sessionManager.createSessionElement(
                session,
                (sessionId) => {
                    this.loadSession(sessionId);
                },
                (sessionId) => this.editSession(sessionId),
                (sessionId) => this.deleteSession(sessionId)
            );
            container.appendChild(sessionElement);
        });
    }

    renderFilteredGroups(groups, container, emptyState) {
        container.innerHTML = '';
        
        if (groups.length === 0) {
            emptyState.style.display = 'block';
            container.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        container.style.display = 'grid';

        groups.forEach(group => {
            const groupElement = this.groupsManager.createGroupElement(
                group,
                (groupId) => this.showGroupView(groupId),
                (groupId) => this.editGroup(groupId),
                (groupId) => this.deleteGroup(groupId)
            );
            container.appendChild(groupElement);
        });
    }

    // Enhanced session loading with performance data
    loadSession(sessionId) {
        const session = this.sessionManager.loadSession(sessionId);
        if (session) {
            this.showNoteApp();
            
            // Update session info
            const sessionInfo = document.getElementById('sessionInfo');
            if (sessionInfo) {
                sessionInfo.textContent = 
                    `${session.school}${session.campus ? ` • ${session.campus}` : ''} • ${session.teacher} • Unit ${session.unit}`;
            }
            
            // Render indicators list with performance data
            const indicatorsList = document.getElementById('indicatorsList');
            if (indicatorsList) {
                this.indicatorsManager.renderIndicatorsList(
                    indicatorsList,
                    (indicator) => {
                        this.selectIndicator(indicator);
                    },
                    this.sessionManager
                );
            }
            
            // Update performance display
            this.updateIndicatorPerformanceDisplay();
            
            this.updateProgress();
            this.showCanvasOverlay();
            
            this.updateStatus(`Session loaded for ${session.teacher}`);
        }
    }

    // FIX 2: Indicator selection - No automatic performance marking or coloring
    // FIX 2: Indicator selection - No automatic coloring
    selectIndicator(indicator) {
        console.log('Selecting indicator:', indicator.id);
        
        // Just set active indicator, no coloring
        this.indicatorsManager.setActiveIndicator(indicator.id);
        
        // Load existing drawing
        const existingNotes = this.sessionManager.getIndicatorNotes(indicator.id);
        
        // Set current indicator
        this.drawingCanvas.setCurrentIndicator(indicator.id, indicator, existingNotes?.performanceType);
        
        // Update UI
        const currentIndicatorTitle = document.getElementById('currentIndicatorTitle');
        const currentIndicatorDesc = document.getElementById('currentIndicatorDesc');
        
        if (currentIndicatorTitle) {
            currentIndicatorTitle.textContent = `${indicator.id}: ${indicator.indicator}`;
        }
        if (currentIndicatorDesc) {
            currentIndicatorDesc.textContent = indicator.explanation;
        }
        
        // Load drawing data if exists
        if (existingNotes && existingNotes.drawingData) {
            setTimeout(() => {
                this.drawingCanvas.loadDrawing(existingNotes.drawingData);
                this.hideCanvasOverlay();
            }, 10);
        } else {
            this.drawingCanvas.clearCanvas();
            this.hideCanvasOverlay();
        }
        
        this.updateStatus(`Selected: ${indicator.indicator}`);
    }

    // Tool Management
    setActiveTool(tool) {
        // Update tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tool="${tool}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // UI State Management
    updateProgress() {
        const stats = this.sessionManager.getSessionStats();
        const progressCount = document.getElementById('progressCount');
        const progressFill = document.getElementById('progressFill');
        
        if (progressCount) {
            progressCount.textContent = `${stats.withNotes}/${stats.total}`;
        }
        if (progressFill) {
            const percentage = (stats.withNotes / stats.total) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    }

    updateCounts() {
        const sessionsCount = document.getElementById('sessionsCount');
        const groupsCount = document.getElementById('groupsCount');
        const trashCount = document.getElementById('trashCount');
        
        if (sessionsCount) {
            sessionsCount.textContent = `${this.sessionManager.getSessionsCount()} sessions`;
        }
        if (groupsCount) {
            groupsCount.textContent = `${this.groupsManager.getGroupsCount()} groups`;
        }
        if (trashCount) {
            trashCount.textContent = `${this.groupsManager.getTrashCount()} items`;
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('appStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    showCanvasOverlay() {
        const overlay = document.getElementById('canvasOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideCanvasOverlay() {
        const overlay = document.getElementById('canvasOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Responsive Design
    handleResize() {
        // Redraw canvas on resize for responsive behavior
        this.drawingCanvas.resizeCanvas();
        
        // Adjust layout for mobile/tablet
        this.adjustLayoutForScreenSize();
    }

    adjustLayoutForScreenSize() {
        const width = window.innerWidth;
        const sidebar = document.querySelector('.indicators-sidebar');
        
        if (width < 768 && !this.isSidebarCollapsed) {
            // Auto-collapse sidebar on small screens
            this.toggleSidebar();
        }
    }

    setupSidebarToggle() {
    const collapseBtn = document.getElementById('collapseBtn');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn'); // Note: changed ID
    
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            this.toggleSidebar();
        });
    }
    
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            this.toggleSidebar();
        });
    }
}


    // Notification System
    showNotification(message, type = 'success') {
        // Enhanced notification that works with safe areas
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : '⚠️'}</span>
            <span class="notification-text">${message}</span>
        `;
        
        // Safe area aware positioning
        notification.style.cssText = `
            position: fixed;
            top: max(20px, env(safe-area-inset-top));
            right: max(20px, env(safe-area-inset-right));
            background: var(--bg-surface);
            border: 1px solid var(--border-primary);
            border-left: 4px solid ${type === 'success' ? 'var(--success)' : 'var(--warning)'};
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Stub methods for future implementation
    restoreItem(itemId, itemType) {
        const result = this.groupsManager.restoreFromTrash(itemId);
        if (result) {
            if (result.type === 'session') {
                this.sessionManager.restoreSession(result.data);
                this.loadSessionsList();
            } else if (result.type === 'group') {
                this.loadGroupsList();
            }
            this.loadTrashItems();
            this.showNotification('Item restored from trash');
        }
    }

    permanentlyDeleteItem(itemId, itemType) {
        this.showConfirmation(
            'Permanently Delete',
            'Are you sure you want to permanently delete this item? This action cannot be undone.',
            'permanentDelete',
            { itemId, itemType }
        );
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
    console.log('🚀 Teacher Notes App Started with Enhanced Features!');
});