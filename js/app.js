class App {
    constructor() {
        this.sessionManager = new SessionManager();
        this.groupsManager = new GroupsManager();
        this.indicatorsManager = new IndicatorsManager();
        this.drawingCanvas = new DrawingCanvas('noteCanvas');
        
        // Make groupsManager globally available for sessionManager
        window.groupsManager = this.groupsManager;
        
        // New state variables
        this.isSidebarCollapsed = false;
        this.performanceViewMode = 'good'; // 'good' or 'growth'
        this.isCommentsOpen = false;
        this.currentFilters = {};
        this.confirmedAction = null;
        this.confirmedActionData = null;
        
        this.setupEventListeners();
        this.showDashboard();
        this.updateCounts();
        
        // Set up drawing save callback
        this.drawingCanvas.setOnSaveCallback((indicatorId, drawingData, performanceType) => {
            this.sessionManager.saveIndicatorNotes(indicatorId, drawingData, performanceType);
            this.indicatorsManager.markIndicatorAsHavingNotes(indicatorId, performanceType);
            this.updateProgress();
            this.updateIndicatorPerformanceDisplay();
        });

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

        // Group view events
        const backToGroups = document.getElementById('backToGroups');
        if (backToGroups) {
            backToGroups.addEventListener('click', () => {
                this.showGroupsTab();
            });
        }
        
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

        // New event listeners for enhanced features
        const collapseBtn = document.getElementById('collapseBtn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        const performanceToggle = document.getElementById('performanceToggle');
        if (performanceToggle) {
            performanceToggle.addEventListener('click', () => {
                this.togglePerformanceView();
            });
        }

        const toggleComments = document.getElementById('toggleComments');
        if (toggleComments) {
            toggleComments.addEventListener('click', () => {
                this.toggleCommentsPalette();
            });
        }

        const closeComments = document.getElementById('closeComments');
        if (closeComments) {
            closeComments.addEventListener('click', () => {
                this.hideCommentsPalette();
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
        this.switchTab('groups');
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
    }

    hideNewSessionModal() {
        document.getElementById('newSessionModal').style.display = 'none';
    }

    createNewSession() {
        const form = document.getElementById('newSessionForm');
        const formData = new FormData(form);
        
        const session = this.sessionManager.createSession(
            formData.get('school'),
            formData.get('campus'),
            formData.get('teacher'),
            formData.get('date'),
            formData.get('unit'),
            formData.get('lesson')
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
            
            // Populate form
            document.getElementById('editSchoolSelect').value = session.school;
            document.getElementById('editCampus').value = session.campus || '';
            document.getElementById('editTeacher').value = session.teacher;
            document.getElementById('editDate').value = session.date;
            document.getElementById('editUnit').value = session.unit;
            document.getElementById('editLesson').value = session.lesson;
            
            // Update campus options based on school
            this.handleSchoolSelection('editSchoolSelect', session.school);
            
            document.getElementById('editSessionModal').style.display = 'flex';
        }
    }

    updateSession(sessionId) {
        const form = document.getElementById('editSessionForm');
        const formData = new FormData(form);
        
        const updates = {
            school: formData.get('school'),
            campus: formData.get('campus'),
            teacher: formData.get('teacher'),
            date: formData.get('date'),
            unit: parseInt(formData.get('unit')),
            lesson: parseInt(formData.get('lesson'))
        };
        
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

    // School Selection Handler
    handleSchoolSelection(selectId, schoolName) {
        // This would typically fetch campuses from a database
        // For now, we'll use a simple mapping
        const campusMappings = {
            'School A': ['Main Campus', 'North Campus'],
            'School B': ['Central Campus', 'West Campus'],
            'School C': ['Primary Campus']
        };
        
        const campusSelect = selectId === 'schoolSelect' ? 
            document.getElementById('campus') : 
            document.getElementById('editCampus');
            
        if (campusSelect) {
            const currentValue = campusSelect.value;
            campusSelect.innerHTML = '<option value="">Select Campus</option>';
            
            const campuses = campusMappings[schoolName] || [];
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

    // Enhanced Features
    toggleSidebar() {
        const sidebar = document.querySelector('.indicators-sidebar');
        const collapseBtn = document.getElementById('collapseBtn');
        const collapseIcon = collapseBtn?.querySelector('.collapse-icon');
        
        if (!sidebar || !collapseBtn) return;
        
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        
        if (this.isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
            if (collapseIcon) {
                collapseIcon.textContent = '▶';
            }
            collapseBtn.setAttribute('title', 'Expand sidebar');
        } else {
            sidebar.classList.remove('collapsed');
            if (collapseIcon) {
                collapseIcon.textContent = '◀';
            }
            collapseBtn.setAttribute('title', 'Collapse sidebar');
        }
        
        // Redraw canvas to adjust to new layout
        setTimeout(() => {
            this.drawingCanvas.resizeCanvas();
        }, 300);
    }

    togglePerformanceView() {
        const toggle = document.getElementById('performanceToggle');
        if (!toggle) return;
        
        this.performanceViewMode = this.performanceViewMode === 'good' ? 'growth' : 'good';
        
        toggle.classList.toggle('active', this.performanceViewMode === 'growth');
        
        // Update all indicator displays
        this.updateIndicatorPerformanceDisplay();
        
        this.showNotification(`Now viewing: ${this.performanceViewMode === 'good' ? 'Good Points' : 'Growth Areas'}`);
    }

    updateIndicatorPerformanceDisplay() {
        const indicators = document.querySelectorAll('.indicator-item');
        indicators.forEach(indicator => {
            const indicatorId = indicator.dataset.id;
            const notes = this.sessionManager.getIndicatorNotes(indicatorId);
            
            // Remove existing performance classes
            indicator.classList.remove('good-point', 'growth-area', 'has-notes');
            
            if (notes) {
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
    }

    updatePerformanceBadge(indicatorElement, indicatorId) {
        let badge = indicatorElement.querySelector('.performance-badge');
        const notes = this.sessionManager.getIndicatorNotes(indicatorId);
        
        if (notes) {
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

    toggleCommentsPalette() {
        const palette = document.getElementById('commentsPalette');
        if (!palette) return;
        
        this.isCommentsOpen = !this.isCommentsOpen;
        
        if (this.isCommentsOpen) {
            palette.classList.add('open');
            this.loadCommentsForCurrentIndicator();
        } else {
            palette.classList.remove('open');
        }
    }

    hideCommentsPalette() {
        const palette = document.getElementById('commentsPalette');
        if (palette) {
            palette.classList.remove('open');
            this.isCommentsOpen = false;
        }
    }

    loadCommentsForCurrentIndicator() {
        const commentsList = document.getElementById('commentsList');
        const currentIndicatorId = this.drawingCanvas.currentIndicatorId;
        
        if (!commentsList) return;
        
        if (!currentIndicatorId) {
            commentsList.innerHTML = '<div class="comment-item">Select an indicator first</div>';
            return;
        }
        
        const comments = this.indicatorsManager.getCommentsForIndicator(currentIndicatorId);
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<div class="comment-item">No comments available for this indicator</div>';
            return;
        }
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = `
                <div class="comment-category">${comment.category}</div>
                <div class="comment-text">${comment.text}</div>
            `;
            
            commentElement.addEventListener('click', () => {
                this.addCommentToCanvas(comment.text);
            });
            
            commentsList.appendChild(commentElement);
        });
    }

    addCommentToCanvas(commentText) {
        // This would integrate with the drawing canvas to add text
        // For now, we'll show a notification
        this.showNotification(`Comment added: "${commentText}"`);
        console.log('Adding comment to canvas:', commentText);
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
        const filterOptions = this.sessionManager.getFilterOptions();
        
        // Populate school filter
        const schoolSelect = document.getElementById('filterSchool');
        if (schoolSelect) {
            schoolSelect.innerHTML = '<option value="all">All Schools</option>';
            filterOptions.schools.forEach(school => {
                const option = document.createElement('option');
                option.value = school;
                option.textContent = school;
                schoolSelect.appendChild(option);
            });
        }

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

    showGroupView(groupId) {
        const group = this.groupsManager.getGroup(groupId);
        if (group) {
            this.currentGroupId = groupId;
            
            // Update group view header
            document.getElementById('groupViewTitle').textContent = group.schoolName;
            document.getElementById('groupViewSubtitle').textContent = 
                `${group.schoolName}${group.campus ? ` • ${group.campus}` : ''}`;
            
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

    // Enhanced indicator selection
    selectIndicator(indicator) {
        console.log('Selecting indicator:', indicator.id);
        
        this.indicatorsManager.setActiveIndicator(indicator.id);
        
        // Load existing drawing with performance type
        const existingNotes = this.sessionManager.getIndicatorNotes(indicator.id);
        
        // Set current indicator with performance type
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
        
        // Load the drawing data
        if (existingNotes) {
            setTimeout(() => {
                this.drawingCanvas.loadDrawing(existingNotes.drawingData);
                this.hideCanvasOverlay();
            }, 10);
        } else {
            this.drawingCanvas.clearCanvas();
            this.hideCanvasOverlay();
        }
        
        // Close comments palette when switching indicators
        this.hideCommentsPalette();
        
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