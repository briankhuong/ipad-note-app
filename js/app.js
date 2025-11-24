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
    
    // FIXED: Check if elements exist before setting up
    this.setupEventListeners();
    
    // FIXED: Only call these if we're on dashboard
    if (document.getElementById('dashboard')) {
        this.showDashboard();
        this.updateCounts();
    }
    
    // Set up drawing save callback - FIXED: Check if drawingCanvas exists
    if (this.drawingCanvas && this.drawingCanvas.setOnSaveCallback) {
    this.drawingCanvas.setOnSaveCallback((indicatorId, drawingData, performanceType) => {
        // FIXED: Pass the current performance type (could be null)
        const currentNotes = this.sessionManager.getIndicatorNotes(indicatorId);
        const currentPerformanceType = currentNotes ? currentNotes.performanceType : null;
        
        this.sessionManager.saveIndicatorNotes(indicatorId, drawingData, currentPerformanceType);
        this.updateProgress();
        this.updateIndicatorPerformanceDisplay();
    });
}

    this.editingSessionId = null;
    this.editingGroupId = null;
    this.currentGroupId = null;
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

        // FIXED: Create First Session button
        document.getElementById('createFirstSession').addEventListener('click', () => {
            this.showNewSessionModal();
        });

        // New group modal events
        document.getElementById('newGroupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('=== DEBUG: Form Submit Triggered ===');
    console.log('Editing Group ID:', this.editingGroupId);
    
    // Debug form values before processing
    const schoolNameInput = document.getElementById('groupName');
    const adminNameInput = document.getElementById('adminName');
    console.log('Form values at submit - School:', schoolNameInput?.value, 'Admin:', adminNameInput?.value);
    
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

        // Group view events
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

        // Window resize handler for responsive design
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Bulk operations for sessions
        this.setupBulkOperations();

        // Bulk operations for groups
        this.setupGroupsBulkOperations();

        // Sorting controls
        this.setupSortingControls();
    }

    setupGroupViewBackButton() {
        const backToGroups = document.getElementById('backToGroups');
        if (backToGroups) {
            const newBackBtn = backToGroups.cloneNode(true);
            backToGroups.parentNode.replaceChild(newBackBtn, backToGroups);
            
            document.getElementById('backToGroups').addEventListener('click', () => {
                console.log('Back button clicked - working!');
                this.showGroupsTab();
            });
        }
    }

    setupBulkOperations() {
        // Bulk edit button
        const bulkEditBtn = document.getElementById('bulkEditBtn');
        if (bulkEditBtn) {
            bulkEditBtn.addEventListener('click', () => {
                this.handleBulkEdit();
            });
        }

        // Bulk delete button
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => {
                this.handleBulkDelete();
            });
        }

        // Cancel selection button
        const cancelSelection = document.getElementById('cancelSelection');
        if (cancelSelection) {
            cancelSelection.addEventListener('click', () => {
                this.deselectAllSessions();
            });
        }
    }

    setupGroupsBulkOperations() {
        // Groups bulk edit button
        const groupsBulkEditBtn = document.getElementById('groupsBulkEditBtn');
        if (groupsBulkEditBtn) {
            groupsBulkEditBtn.addEventListener('click', () => {
                this.handleGroupsBulkEdit();
            });
        }

        // Groups bulk delete button
        const groupsBulkDeleteBtn = document.getElementById('groupsBulkDeleteBtn');
        if (groupsBulkDeleteBtn) {
            groupsBulkDeleteBtn.addEventListener('click', () => {
                this.handleGroupsBulkDelete();
            });
        }

        // Groups cancel selection button
        const groupsCancelSelection = document.getElementById('groupsCancelSelection');
        if (groupsCancelSelection) {
            groupsCancelSelection.addEventListener('click', () => {
                this.deselectAllGroups();
            });
        }
    }

    setupSortingControls() {
        const groupBySelect = document.getElementById('groupBySelect');
        const sortBySelect = document.getElementById('sortBySelect');

        if (groupBySelect) {
            groupBySelect.addEventListener('change', (e) => {
                this.applySorting();
            });
        }

        if (sortBySelect) {
            sortBySelect.addEventListener('change', (e) => {
                this.applySorting();
            });
        }
    }

    applySorting() {
        const groupBySelect = document.getElementById('groupBySelect');
        const sortBySelect = document.getElementById('sortBySelect');

        const sortOptions = {
            groupBy: groupBySelect ? groupBySelect.value : 'none',
            sortBy: 'date', // default
            sortOrder: 'desc' // default
        };

        if (sortBySelect) {
            const [sortBy, sortOrder] = sortBySelect.value.split('-');
            sortOptions.sortBy = sortBy;
            sortOptions.sortOrder = sortOrder;
        }

        this.loadSessionsList(sortOptions);
    }

    handleBulkEdit() {
        const selectedSessions = this.sessionManager.getSelectedSessions();
        if (selectedSessions.length === 1) {
            // Edit single session
            this.editSession(selectedSessions[0].id);
        }
    }

    handleBulkDelete() {
        const selectedSessions = this.sessionManager.getSelectedSessions();
        if (selectedSessions.length > 0) {
            const sessionText = selectedSessions.length === 1 ? 
                `"${selectedSessions[0].teacher}"` : 
                `${selectedSessions.length} observations`;

            this.showConfirmation(
                'Delete Observations',
                `Are you sure you want to delete ${sessionText}? They will be moved to trash.`,
                'bulkDeleteSessions'
            );
        }
    }

    handleGroupsBulkEdit() {
        const selectedGroups = this.groupsManager.getSelectedGroups();
        if (selectedGroups.length === 1) {
            // Edit single group
            this.editGroup(selectedGroups[0].id);
        }
    }

    handleGroupsBulkDelete() {
        const selectedGroups = this.groupsManager.getSelectedGroups();
        if (selectedGroups.length > 0) {
            const groupText = selectedGroups.length === 1 ? 
                `"${selectedGroups[0].schoolName}"` : 
                `${selectedGroups.length} school groups`;

            this.showConfirmation(
                'Delete School Groups',
                `Are you sure you want to delete ${groupText}? They will be moved to trash.`,
                'bulkDeleteGroups'
            );
        }
    }

    deselectAllSessions() {
        this.sessionManager.deselectAllSessions();
    }

    deselectAllGroups() {
        this.groupsManager.deselectAllGroups();
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
            
            // Wait for DOM to update, then populate campuses
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
            
            // FIXED: Clear selection after edit
            this.deselectAllSessions();
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
    this.editingGroupId = null;
    
    // Reset modal title
    const modalTitle = document.querySelector('#newGroupModal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Create School Group';
    }
    
    // FIXED: Reset submit button text
    const submitButton = document.querySelector('#newGroupModal .btn-primary');
    if (submitButton) {
        submitButton.textContent = 'Create Group';
    }
}

    createNewGroup() {
    const form = document.getElementById('newGroupForm');
    
    // FIXED: Get values directly from form elements
    const schoolNameInput = document.getElementById('groupName');
    const adminNameInput = document.getElementById('adminName');
    const adminPhoneInput = document.getElementById('adminPhone');
    const schoolAddressInput = document.getElementById('schoolAddress');
    const campusInput = document.getElementById('campusGroup');
    
    const schoolName = schoolNameInput ? schoolNameInput.value.trim() : '';
    const adminName = adminNameInput ? adminNameInput.value.trim() : '';
    const adminPhone = adminPhoneInput ? adminPhoneInput.value.trim() : '';
    const schoolAddress = schoolAddressInput ? schoolAddressInput.value.trim() : '';
    const campus = campusInput ? campusInput.value.trim() : '';
    
    console.log('=== DEBUG: Create Group Form Data ===');
    console.log('School Name:', schoolName, 'Length:', schoolName.length);
    console.log('Admin Name:', adminName, 'Length:', adminName.length);
    
    // FIXED: Same validation as update
    if (!schoolName) {
        this.showNotification('School name is required', 'error');
        schoolNameInput?.focus();
        return;
    }
    
    if (!adminName) {
        this.showNotification('Admin name is required', 'error');
        adminNameInput?.focus();
        return;
    }
    
    const group = this.groupsManager.createGroup(
        schoolName,
        adminName,
        adminPhone,
        schoolAddress,
        campus
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
    
    // FIXED: Get values directly from form elements for debugging
    const schoolNameInput = document.getElementById('groupName');
    const adminNameInput = document.getElementById('adminName');
    const adminPhoneInput = document.getElementById('adminPhone');
    const schoolAddressInput = document.getElementById('schoolAddress');
    const campusInput = document.getElementById('campusGroup');
    
    const updates = {
        schoolName: schoolNameInput ? schoolNameInput.value.trim() : '',
        adminName: adminNameInput ? adminNameInput.value.trim() : '',
        adminPhone: adminPhoneInput ? adminPhoneInput.value.trim() : '',
        schoolAddress: schoolAddressInput ? schoolAddressInput.value.trim() : '',
        campus: campusInput ? campusInput.value.trim() : ''
    };
    
    console.log('=== DEBUG: Update Group Form Data ===');
    console.log('School Name:', updates.schoolName, 'Length:', updates.schoolName.length);
    console.log('Admin Name:', updates.adminName, 'Length:', updates.adminName.length);
    console.log('Form element values - School:', schoolNameInput?.value, 'Admin:', adminNameInput?.value);
    console.log('Full updates object:', updates);
    
    // FIXED: More specific validation
    if (!updates.schoolName) {
        this.showNotification('School name is required', 'error');
        schoolNameInput?.focus();
        return;
    }
    
    if (!updates.adminName) {
        this.showNotification('Admin name is required', 'error');
        adminNameInput?.focus();
        return;
    }
    
    const updatedGroup = this.groupsManager.updateGroup(groupId, updates);
    if (updatedGroup) {
        this.hideNewGroupModal();
        this.loadGroupsList();
        this.showNotification('School group updated');
        this.deselectAllGroups();
    } else {
        this.showNotification('Failed to update school group', 'error');
    }
}

    editGroup(groupId) {
    const group = this.groupsManager.getGroup(groupId);
    if (group) {
        this.editingGroupId = groupId;
        
        // Update modal title
        const modalTitle = document.querySelector('#newGroupModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Edit School Group';
        }
        
        // FIXED: Update submit button text
        const submitButton = document.querySelector('#newGroupModal .btn-primary');
        if (submitButton) {
            submitButton.textContent = 'Update Group';
        }
        
        // Populate form
        document.getElementById('groupName').value = group.schoolName || '';
        document.getElementById('adminName').value = group.adminName || '';
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
            
            // Setup back button
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
            document.getElementById('editSchoolSelect')
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
                
            case 'bulkDeleteSessions':
                const deletedCount = this.sessionManager.deleteSelectedSessions();
                this.loadSessionsList();
                this.showNotification(`${deletedCount} observation${deletedCount !== 1 ? 's' : ''} moved to trash`);
                break;
                
            case 'deleteGroup':
                if (this.confirmedActionData) {
                    this.groupsManager.deleteGroup(this.confirmedActionData);
                    this.loadGroupsList();
                    this.showNotification('School group moved to trash');
                }
                break;
                
            case 'bulkDeleteGroups':
                const deletedGroupsCount = this.groupsManager.deleteSelectedGroups();
                this.loadGroupsList();
                this.showNotification(`${deletedGroupsCount} school group${deletedGroupsCount !== 1 ? 's' : ''} moved to trash`);
                break;
                
            case 'emptyTrash':
                this.groupsManager.emptyTrash();
                this.loadTrashItems();
                this.showNotification('Trash emptied');
                break;

            // FIXED: Add permanent delete case
            case 'permanentDelete':
                if (this.confirmedActionData) {
                    const { itemId, itemType } = this.confirmedActionData;
                    const success = this.groupsManager.permanentlyDelete(itemId);
                    if (success) {
                        this.loadTrashItems();
                        this.showNotification('Item permanently deleted');
                    }
                }
                break;
        }
        
        this.hideConfirmationModal();
    }

    setupSidebarToggle() {
    const collapseBtn = document.getElementById('collapseBtn');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    
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

    toggleSidebar() {       
    console.log('toggleSidebar called');
    const sidebar = document.querySelector('.indicators-sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const collapseIcon = collapseBtn?.querySelector('.collapse-icon');
    const toggleIcon = sidebarToggleBtn?.querySelector('.toggle-icon');

    if (!sidebar) {
        console.error('Sidebar not found!');
        return;
    }
    if (!sidebarToggleBtn) {
        console.error('Sidebar toggle button not found! Check HTML ID.');
        return;
    }

    console.log('Before - Sidebar collapsed:', sidebar.classList.contains('collapsed'));
    console.log('Before - Collapse btn display:', collapseBtn?.style.display);
    console.log('Before - Expand btn display:', sidebarToggleBtn?.style.display);
    
    // Use class to determine current state (more reliable than flag if page reloads or state drifts)
    this.isSidebarCollapsed = !sidebar.classList.contains('collapsed');  // Flip based on actual class
    
    if (this.isSidebarCollapsed) {
        sidebar.classList.add('collapsed');
        if (collapseIcon) collapseIcon.textContent = '▶';
        if (toggleIcon) toggleIcon.textContent = '◀';
        if (collapseBtn) collapseBtn.setAttribute('title', 'Expand sidebar');
        sidebarToggleBtn.style.display = 'flex';  // SHOW expand button
        sidebarToggleBtn.setAttribute('title', 'Expand sidebar');
    } else {
        sidebar.classList.remove('collapsed');
        if (collapseIcon) collapseIcon.textContent = '◀';
        if (toggleIcon) toggleIcon.textContent = '▶';
        if (collapseBtn) collapseBtn.setAttribute('title', 'Collapse sidebar');
        sidebarToggleBtn.style.display = 'none';  // HIDE expand button
        sidebarToggleBtn.setAttribute('title', 'Collapse sidebar');
    }

    console.log('After - Sidebar collapsed:', sidebar.classList.contains('collapsed'));
    console.log('After - Expand btn display:', sidebarToggleBtn.style.display);
    
    setTimeout(() => {
        this.drawingCanvas.resizeCanvas();
    }, 300);
}

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

    // Data Loading Methods
    loadSessionsList(sortOptions = {}) {
    const container = document.getElementById('sessionsContainer');
    const emptyState = document.getElementById('emptySessionsState');
    
    if (!container || !emptyState) return;
    
    console.log('Loading sessions list with sort options:', sortOptions);
    
    // Clear container first
    container.innerHTML = '';
    
    let sessionsToRender = this.currentFilters && Object.keys(this.currentFilters).length > 0 ? 
        this.sessionManager.filterSessions(this.currentFilters) : 
        [...this.sessionManager.sessions];

    // Apply sorting
    sessionsToRender = this.sessionManager.sortSessions(sessionsToRender, sortOptions);

    // Apply grouping
    const groupedSessions = this.sessionManager.groupSessions(sessionsToRender, sortOptions.groupBy);

    if (sessionsToRender.length === 0) {
        console.log('No sessions to display');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        container.style.display = 'none';
        this.updateCounts();
        return;
    }

    console.log(`Rendering ${sessionsToRender.length} sessions`);
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    container.style.display = 'block';

    // Render grouped or ungrouped sessions
    if (sortOptions.groupBy && sortOptions.groupBy !== 'none') {
        this.sessionManager.renderGroupedSessions(
            container, 
            groupedSessions, 
            (sessionId) => this.loadSession(sessionId),
            (sessionId) => this.editSession(sessionId),
            (sessionId) => this.deleteSession(sessionId)
        );
    } else {
        sessionsToRender.forEach(session => {
            const sessionElement = this.sessionManager.createSessionElement(
                session,
                (sessionId) => this.loadSession(sessionId),
                (sessionId) => this.editSession(sessionId),
                (sessionId) => this.deleteSession(sessionId)
            );
            container.appendChild(sessionElement);
        });
    }
    
    this.updateCounts();
}


loadGroupsList() {
    const container = document.getElementById('groupsContainer');
    const emptyState = document.getElementById('emptyGroupsState');
    
    console.log('=== DEBUG: Loading Groups List ===');
    console.log('Container exists:', !!container);
    console.log('Empty state exists:', !!emptyState);
    console.log('Groups count:', this.groupsManager.groups.length);
    console.log('Groups data:', this.groupsManager.groups);
    
    if (!container) {
        console.error('Groups container not found!');
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (this.groupsManager.groups.length === 0) {
        console.log('No groups found, showing empty state');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        container.style.display = 'none';
        
        // Try to force create schools
        console.log('Attempting to create schools...');
        this.groupsManager.preCreateSchools();
        this.groupsManager.saveGroups();
        
        // Reload after creation
        if (this.groupsManager.groups.length > 0) {
            console.log('Schools created, reloading list...');
            this.loadGroupsList();
        }
        return;
    }
    
    console.log(`Rendering ${this.groupsManager.groups.length} groups`);
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    container.style.display = 'grid';
    
    // FIXED: Manually render groups if the method isn't working
    this.renderGroupsManually(container);
    
    this.updateCounts();
}

// Add this method to manually render groups
renderGroupsManually(container) {
    console.log('Manually rendering groups...');
    
    // FIXED: Handle null/undefined values in sort
    const sortedGroups = this.groupsManager.groups.sort((a, b) => {
        const schoolA = a.schoolName || '';
        const schoolB = b.schoolName || '';
        const campusA = a.campus || '';
        const campusB = b.campus || '';
        
        const schoolCompare = schoolA.localeCompare(schoolB);
        if (schoolCompare !== 0) return schoolCompare;
        return campusA.localeCompare(campusB);
    });

    sortedGroups.forEach(group => {
        const groupElement = this.createGroupElement(group);
        container.appendChild(groupElement);
    });
    
    console.log(`Successfully rendered ${sortedGroups.length} groups`);
}

// Add this method to create group elements
createGroupElement(group) {
    const groupElement = document.createElement('div');
    groupElement.className = 'group-item';
    groupElement.dataset.id = group.id;

    groupElement.innerHTML = `
        <div class="group-item-checkbox">
            <input type="checkbox" class="group-checkbox" data-group-id="${group.id}">
        </div>
        <div class="group-item-content">
            <div class="group-header">
                <div>
                    <div class="group-title">${group.schoolName}</div>
                    ${group.campus ? `<div class="group-campus">${group.campus}</div>` : ''}
                    <div class="group-admin">Admin: ${group.adminName}</div>
                </div>
                <div class="group-stats">
                    <span>${group.sessionCount || 0} sessions</span>
                </div>
            </div>
            <div class="group-details">
                ${group.adminPhone ? `
                    <div class="group-phone">
                        <span class="icon">📞</span>
                        ${group.adminPhone}
                    </div>
                ` : ''}
                ${group.schoolAddress ? `
                    <div class="group-address">
                        <span class="icon">📍</span>
                        ${group.schoolAddress}
                    </div>
                ` : ''}
            </div>
            <div class="group-actions">
                <button class="btn btn-ghost btn-small group-view-btn" data-id="${group.id}">
                    <span class="btn-icon">👁️</span>
                    View
                </button>
                <button class="btn btn-ghost btn-small group-edit-btn" data-id="${group.id}">
                    <span class="btn-icon">✏️</span>
                    Edit
                </button>
                <button class="btn btn-danger btn-small group-delete-btn" data-id="${group.id}">
                    <span class="btn-icon">🗑️</span>
                    Delete
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const viewBtn = groupElement.querySelector('.group-view-btn');
    const editBtn = groupElement.querySelector('.group-edit-btn');
    const deleteBtn = groupElement.querySelector('.group-delete-btn');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showGroupView(group.id);
        });
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editGroup(group.id);
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteGroup(group.id);
        });
    }

    // Checkbox event
    const checkbox = groupElement.querySelector('.group-checkbox');
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        this.groupsManager.toggleGroupSelection(group.id, checkbox.checked);
        groupElement.classList.toggle('selected', checkbox.checked);
    });

    return groupElement;
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
        
        // FIXED: Properly render trash items
        this.groupsManager.renderTrashList(
            sessionsContainer,
            groupsContainer,
            (itemId, itemType) => this.restoreItem(itemId, itemType),
            (itemId, itemType) => this.permanentlyDeleteItem(itemId, itemType)
        );
        this.updateCounts();
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
                this.sessionManager // Pass sessionManager to indicators
            );
        }
        
        // Debug: Check initial state of all indicators in this session
        console.log('=== DEBUG: Session Indicator States ===');
        console.log('Session ID:', sessionId);
        console.log('Total indicators in session:', Object.keys(session.indicators || {}).length);
        
        Object.keys(session.indicators || {}).forEach(indicatorId => {
            this.debugIndicatorState(indicatorId);
        });
        
        // Update performance display
        this.updateIndicatorPerformanceDisplay();
        
        this.updateProgress();
        this.showCanvasOverlay();
        
        this.updateStatus(`Session loaded for ${session.teacher}`);
    } else {
        console.error('Failed to load session:', sessionId);
    }
}

// Add this debug method to your App class
debugIndicatorState(indicatorId) {
    const notes = this.sessionManager.getIndicatorNotes(indicatorId);
    console.log(`Indicator ${indicatorId}:`, {
        performanceType: notes ? notes.performanceType : 'null',
        hasDrawing: notes && notes.drawingData ? notes.drawingData.length > 0 : false,
        hasAutoComment: notes ? notes.autoComment : false,
        drawingDataLength: notes && notes.drawingData ? notes.drawingData.length : 0
    });
}

    // FIXED: Indicator selection - No automatic performance marking
    selectIndicator(indicator) {
        console.log('Selecting indicator:', indicator.id);
        
        // Just set active indicator, no automatic marking
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
    const progressCount = document.getElementById('progressCount');
    const progressFill = document.getElementById('progressFill');
    
    const stats = this.indicatorsManager.getPerformanceStats(this.sessionManager);
    const completed = stats.total; // Now counts actual content, not performance types
    
    progressCount.textContent = `${completed}/18`;
    progressFill.style.width = `${(completed / 18) * 100}%`;
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

    // FIXED: Restore item functionality
    restoreItem(itemId, itemType) {
        const result = this.groupsManager.restoreFromTrash(itemId);
        if (result) {
            if (result.type === 'session') {
                this.sessionManager.restoreSession(result.data);
                this.loadSessionsList();
                this.showNotification('Observation restored from trash');
            } else if (result.type === 'group') {
                this.loadGroupsList();
                this.showNotification('School group restored from trash');
            }
            this.loadTrashItems();
        }
    }

    // FIXED: Permanent delete functionality
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