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
        
        brushSize.addEventListener('input', (e) => {
            const size = e.target.value;
            brushSizeValue.textContent = `${size}px`;
            this.drawingCanvas.setBrushSize(parseInt(size));
        });

        // School dropdown change events
        document.getElementById('schoolSelect').addEventListener('change', (e) => {
            this.handleSchoolSelection('schoolSelect', e.target.value);
        });
        
        document.getElementById('editSchoolSelect').addEventListener('change', (e) => {
            this.handleSchoolSelection('editSchoolSelect', e.target.value);
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-backdrop') || e.target.id === 'newSessionModal' || e.target.id === 'newGroupModal' || e.target.id === 'editSessionModal' || e.target.id === 'confirmationModal') {
                    this.hideNewSessionModal();
                    this.hideNewGroupModal();
                    this.hideEditSessionModal();
                    this.hideConfirmationModal();
                }
            });
        });

        // Apple Pencil detection
        const canvas = document.getElementById('noteCanvas');
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

        // Group view events
        document.getElementById('backToGroups').addEventListener('click', () => {
            this.showGroupsTab();
        });
        
        document.getElementById('newSessionForGroup').addEventListener('click', () => {
            this.createNewSessionForCurrentGroup();
        });
        
        document.getElementById('editCurrentGroup').addEventListener('click', () => {
            this.editCurrentGroup();
        });

        // New event listeners for enhanced features
        document.getElementById('collapseBtn').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('performanceToggle').addEventListener('click', () => {
            this.togglePerformanceView();
        });

        document.getElementById('toggleComments').addEventListener('click', () => {
            this.toggleCommentsPalette();
        });

        document.getElementById('closeComments').addEventListener('click', () => {
            this.hideCommentsPalette();
        });

        // Filter events
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        document.getElementById('toggleFilters').addEventListener('click', () => {
            this.toggleFiltersPanel();
        });

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
        
        // Create filter toggle button
        const filterToggle = document.createElement('button');
        filterToggle.id = 'toggleFilters';
        filterToggle.className = 'btn btn-ghost btn-with-icon';
        filterToggle.innerHTML = `
            <span class="btn-icon">🔍</span>
            Filter
        `;
        
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

        // Setup filters panel
        this.setupFiltersPanel();
    }

    setupFiltersPanel() {
        const sessionsTab = document.getElementById('sessionsTab');
        
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
        sessionsTab.insertBefore(filtersPanel, sessionsContainer);

        // Add CSS for filters
        const filterStyles = document.createElement('style');
        filterStyles.textContent = `
            .filters-panel {
                background: var(--bg-surface);
                border: 1px solid var(--border-primary);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
                margin-bottom: var(--space-4);
            }
            .filters-header {
                margin-bottom: var(--space-4);
            }
            .filters-header h4 {
                color: var(--text-primary);
                font-size: 16px;
                font-weight: 600;
            }
            .filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--space-4);
                margin-bottom: var(--space-4);
            }
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: var(--space-2);
            }
            .filter-label {
                font-size: 12px;
                font-weight: 500;
                color: var(--text-secondary);
            }
            .filter-input {
                padding: var(--space-2) var(--space-3);
                background: var(--bg-secondary);
                border: 1px solid var(--border-primary);
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-size: 14px;
            }
            .filters-actions {
                display: flex;
                gap: var(--space-3);
                justify-content: flex-end;
            }
            @media (max-width: 768px) {
                .filters-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(filterStyles);
    }

    toggleFiltersPanel() {
        const filtersPanel = document.getElementById('filtersPanel');
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
        schoolSelect.innerHTML = '<option value="all">All Schools</option>';
        filterOptions.schools.forEach(school => {
            const option = document.createElement('option');
            option.value = school;
            option.textContent = school;
            schoolSelect.appendChild(option);
        });

        // Populate campus filter
        const campusSelect = document.getElementById('filterCampus');
        campusSelect.innerHTML = '<option value="all">All Campuses</option>';
        filterOptions.campuses.forEach(campus => {
            const option = document.createElement('option');
            option.value = campus;
            option.textContent = campus;
            campusSelect.appendChild(option);
        });
    }

    applyFilters() {
        const filters = {
            school: document.getElementById('filterSchool').value,
            campus: document.getElementById('filterCampus').value,
            status: document.getElementById('filterStatus').value,
            progress: document.getElementById('filterProgress').value,
            startDate: document.getElementById('filterStartDate').value,
            endDate: document.getElementById('filterEndDate').value,
            sortBy: document.getElementById('filterSortBy').value,
            sortOrder: document.getElementById('filterSortOrder').value
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

        this.showNotification(`Applied ${filterCount} filter${filterCount !== 1 ? 's' : ''}`);
    }

    clearFilters() {
        // Reset all filter inputs
        document.getElementById('filterSchool').value = 'all';
        document.getElementById('filterCampus').value = 'all';
        document.getElementById('filterStatus').value = 'all';
        document.getElementById('filterProgress').value = 'all';
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        document.getElementById('filterSortBy').value = 'date';
        document.getElementById('filterSortOrder').value = 'desc';

        this.currentFilters = {};
        this.loadSessionsList();

        // Remove filter badge
        const toggleBtn = document.getElementById('toggleFilters');
        const badge = toggleBtn.querySelector('.filter-badge');
        if (badge) {
            badge.remove();
        }

        this.showNotification('Filters cleared');
    }

    // ... rest of the existing methods remain the same, but updated to use filters ...

    loadSessionsList() {
        this.sessionManager.renderSessionsList(
            document.getElementById('sessionsContainer'),
            (sessionId) => this.loadSession(sessionId),
            (sessionId) => this.editSession(sessionId),
            (sessionId) => this.deleteSession(sessionId),
            this.currentFilters
        );
        this.updateCounts();
    }

    searchSessions(query) {
        const container = document.getElementById('sessionsContainer');
        const emptyState = document.getElementById('emptySessionsState');
        
        if (!query.trim()) {
            this.loadSessionsList();
            return;
        }
        
        const filteredSessions = this.sessionManager.searchSessions(query);
        this.renderFilteredSessions(filteredSessions, container, emptyState);
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
            // Ensure session ID is properly passed to click handler
            const sessionElement = this.sessionManager.createSessionElement(
                session,
                (sessionId) => {
                    console.log('Loading session from search:', sessionId);
                    this.loadSession(sessionId);
                },
                (sessionId) => this.editSession(sessionId),
                (sessionId) => this.deleteSession(sessionId)
            );
            container.appendChild(sessionElement);
        });
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
            // Ensure session ID is properly passed to click handler
            const sessionElement = this.sessionManager.createSessionElement(
                session,
                (sessionId) => {
                    console.log('Loading session from search:', sessionId);
                    this.loadSession(sessionId);
                },
                (sessionId) => this.editSession(sessionId),
                (sessionId) => this.deleteSession(sessionId)
            );
            container.appendChild(sessionElement);
        });
    }

    // ... rest of existing methods with minor enhancements ...

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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
    console.log('🚀 Teacher Notes App Started with Enhanced Features!');
});