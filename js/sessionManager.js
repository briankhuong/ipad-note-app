class SessionManager {
  constructor() {
    this.currentSession = null;
    this.sessions = this.loadSessions();
    this.selectedSessions = new Set(); // Track selected sessions for bulk operations
  }

  createSession(school, campus, teacher, date, unit, lesson) {
    const sessionId = 'session_' + Date.now();
    this.currentSession = {
      id: sessionId,
      school: school || '',
      campus: campus || '',
      teacher: teacher || '',
      date: date || new Date().toISOString().split('T')[0],
      unit: parseInt(unit) || 1,
      lesson: parseInt(lesson) || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      indicators: {},
      status: 'draft'
    };
    console.log('Creating session:', this.currentSession);
    this.saveCurrentSession();
    return this.currentSession;
  }

  saveCurrentSession() {
    if (!this.currentSession) return;
    this.currentSession.updatedAt = new Date().toISOString();
    // Update sessions list
    const existingIndex = this.sessions.findIndex(s => s.id === this.currentSession.id);
    if (existingIndex >= 0) {
      this.sessions[existingIndex] = this.currentSession;
    } else {
      this.sessions.unshift(this.currentSession);
    }
    this.saveSessions();
    console.log('Session saved:', this.currentSession);
  }

  saveIndicatorNotes(indicatorId, drawingData, performanceType = null, autoComment = false) { // FIXED: explicit null default
    if (!this.currentSession) return;
    
    // FIXED: Explicit check for null/undefined, not falsy
    const hasDrawing = drawingData && drawingData.length > 0;
    const hasPerformance = performanceType !== null && performanceType !== undefined;
    const hasAutoComment = !!autoComment;
    
    console.log(`Saving notes for ${indicatorId}:`, {
        hasDrawing,
        hasPerformance,
        performanceType, // This should be null if not set
        hasAutoComment
    });
    
    if (!hasDrawing && !hasPerformance && !hasAutoComment) {
        // Remove entry if exists and now empty
        if (this.currentSession.indicators[indicatorId]) {
            delete this.currentSession.indicators[indicatorId];
        }
        this.saveCurrentSession();
        console.log(`No content - skipped/removed save for ${indicatorId}`);
        return;
    }
    
    this.currentSession.indicators[indicatorId] = {
        drawingData: drawingData,
        performanceType: performanceType, // FIXED: Can be null
        autoComment: autoComment,
        savedAt: new Date().toISOString()
    };
    this.saveCurrentSession();
    console.log(`Notes saved for ${indicatorId}:`, this.currentSession.indicators[indicatorId]);
}

  getIndicatorNotes(indicatorId) {
    if (!this.currentSession || !this.currentSession.indicators[indicatorId]) {
      return null;
    }
    return this.currentSession.indicators[indicatorId];
  }

  loadSession(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      this.currentSession = session;
      console.log('Session loaded:', session);
      return session;
    }
    return null;
  }

  deleteSession(sessionId, moveToTrash = true) {
    const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex >= 0) {
      const session = this.sessions[sessionIndex];
      if (moveToTrash && window.groupsManager) {
        window.groupsManager.moveToTrash('session', session);
      }
      this.sessions.splice(sessionIndex, 1);
      this.saveSessions();
      if (this.currentSession && this.currentSession.id === sessionId) {
        this.currentSession = null;
      }
      // Remove from selected sessions if it was selected
      this.selectedSessions.delete(sessionId);
      this.updateBulkActionsUI();
      return true;
    }
    return false;
  }

  updateSession(sessionId, updates) {
    const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex >= 0) {
      const updatedSession = {
        ...this.sessions[sessionIndex],
        school: updates.school || '',
        campus: updates.campus || '',
        teacher: updates.teacher || '',
        date: updates.date || new Date().toISOString().split('T')[0],
        unit: parseInt(updates.unit) || 1,
        lesson: parseInt(updates.lesson) || 1,
        updatedAt: new Date().toISOString()
      };
      this.sessions[sessionIndex] = updatedSession;
      if (this.currentSession && this.currentSession.id === sessionId) {
        this.currentSession = updatedSession;
      }
      this.saveSessions();
      console.log('Session updated:', updatedSession);
      return updatedSession;
    }
    return null;
  }

  getSessionForEdit(sessionId) {
    return this.sessions.find(s => s.id === sessionId);
  }

  restoreSession(sessionData) {
    // Check if session already exists
    const existingIndex = this.sessions.findIndex(s => s.id === sessionData.id);
    if (existingIndex >= 0) {
      // Update existing session
      this.sessions[existingIndex] = sessionData;
    } else {
      // Add as new session
      this.sessions.unshift(sessionData);
    }
    this.saveSessions();
    return sessionData;
  }

  // FIX 5: Observation filters - Fixed filtering logic. 
  // FIX 5: Observation filters - Fixed logic
  filterSessions(filters = {}) {
    console.log('Applying filters:', filters);
    let filteredSessions = [...this.sessions];

    // School filter
    if (filters.school && filters.school !== 'all') {
      filteredSessions = filteredSessions.filter(session => session.school === filters.school );
      console.log(`After school filter: ${filteredSessions.length} sessions`);
    }

    // Campus filter
    if (filters.campus && filters.campus !== 'all') {
      filteredSessions = filteredSessions.filter(session => session.campus === filters.campus );
      console.log(`After campus filter: ${filteredSessions.length} sessions`);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredSessions = filteredSessions.filter(session => session.status === filters.status );
      console.log(`After status filter: ${filteredSessions.length} sessions`);
    }

    // Progress filter - FIXED: Use actual progress
    if (filters.progress && filters.progress !== 'all') {
      filteredSessions = filteredSessions.filter(session => {
        const progress = this.getSessionProgress(session.id);
        if (filters.progress === 'complete') return progress === 100;
        if (filters.progress === 'in-progress') return progress > 0 && progress < 100;
        if (filters.progress === 'not-started') return progress === 0;
        return true;
      });
      console.log(`After progress filter: ${filteredSessions.length} sessions`);
    }

    // Date range filter - FIXED: Proper date handling
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate;
      });
      console.log(`After start date filter: ${filteredSessions.length} sessions`);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate <= endDate;
      });
      console.log(`After end date filter: ${filteredSessions.length} sessions`);
    }

    // Sort sessions
    if (filters.sortBy) {
      filteredSessions.sort((a, b) => {
        let aValue, bValue;
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'teacher':
            aValue = a.teacher.toLowerCase();
            bValue = b.teacher.toLowerCase();
            break;
          case 'school':
            aValue = a.school.toLowerCase();
            bValue = b.school.toLowerCase();
            break;
          case 'progress':
            aValue = this.getSessionProgress(a.id);
            bValue = this.getSessionProgress(b.id);
            break;
          default:
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
        }
        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    console.log(`Final filtered sessions: ${filteredSessions.length}`);
    return filteredSessions;
  }

  getFilterOptions() {
    const schools = [...new Set(this.sessions.map(s => s.school).filter(Boolean))];
    const campuses = [...new Set(this.sessions.map(s => s.campus).filter(Boolean))];
    const statuses = [...new Set(this.sessions.map(s => s.status))];
    return {
      schools: schools.sort(),
      campuses: campuses.sort(),
      statuses: statuses.sort()
    };
  }

  loadSessions() {
    try {
      const saved = localStorage.getItem('teacher_notes_sessions');
      if (saved) {
        const sessions = JSON.parse(saved);
        // FIXED: Clean up empty indicators on load for consistency
        return sessions.map(session => {
          const cleanedIndicators = {};
          for (const [id, note] of Object.entries(session.indicators || {})) {
            const hasContent = (note.drawingData && note.drawingData.length > 0) || !!note.performanceType || !!note.autoComment;
            if (hasContent) {
              cleanedIndicators[id] = note;
            }
          }
          return {
            ...session,
            unit: parseInt(session.unit) || 1,
            lesson: parseInt(session.lesson) || 1,
            date: session.date || new Date().toISOString().split('T')[0],
            school: session.school || '',
            campus: session.campus || '',
            teacher: session.teacher || '',
            indicators: cleanedIndicators
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  saveSessions() {
    try {
      localStorage.setItem('teacher_notes_sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  renderSessionsList(container, onSessionSelect, onSessionEdit, onSessionDelete, filters = {}, sortOptions = {}) {
    console.log('Rendering sessions list with filters:', filters, 'and sort options:', sortOptions);
    container.innerHTML = '';
    
    let sessionsToRender = filters && Object.keys(filters).length > 0 ? 
      this.filterSessions(filters) : 
      [...this.sessions];

    // Apply sorting
    sessionsToRender = this.sortSessions(sessionsToRender, sortOptions);

    // Apply grouping
    const groupedSessions = this.groupSessions(sessionsToRender, sortOptions.groupBy);

    if (sessionsToRender.length === 0) {
      const emptyState = document.getElementById('emptySessionsState');
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      container.style.display = 'none';
      return;
    }

    const emptyState = document.getElementById('emptySessionsState');
    if (emptyState) {
      emptyState.style.display = 'none';
    }
    container.style.display = 'block';

    // Render grouped or ungrouped sessions
    if (sortOptions.groupBy && sortOptions.groupBy !== 'none') {
      this.renderGroupedSessions(container, groupedSessions, onSessionSelect, onSessionEdit, onSessionDelete);
    } else {
      sessionsToRender.forEach(session => {
        const sessionElement = this.createSessionElement(session, onSessionSelect, onSessionEdit, onSessionDelete);
        container.appendChild(sessionElement);
      });
    }
  }

  renderGroupedSessions(container, groupedSessions, onSessionSelect, onSessionEdit, onSessionDelete) {
    Object.entries(groupedSessions).forEach(([groupName, sessions]) => {
      // Create group header
      const groupHeader = document.createElement('div');
      groupHeader.className = 'session-group-header';
      groupHeader.innerHTML = `
        <span>${groupName}</span>
        <span class="session-group-count">${sessions.length} session${sessions.length !== 1 ? 's' : ''}</span>
      `;
      container.appendChild(groupHeader);

      // Render sessions in this group
      sessions.forEach(session => {
        const sessionElement = this.createSessionElement(session, onSessionSelect, onSessionEdit, onSessionDelete);
        container.appendChild(sessionElement);
      });
    });
  }

  groupSessions(sessions, groupBy) {
    if (!groupBy || groupBy === 'none') {
      return sessions;
    }

    const grouped = {};

    sessions.forEach(session => {
      let groupKey;

      switch (groupBy) {
        case 'school':
          groupKey = session.school || 'Unknown School';
          break;
        case 'date':
          groupKey = new Date(session.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          break;
        case 'unit':
          groupKey = `Unit ${session.unit}`;
          break;
        default:
          groupKey = 'Other';
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(session);
    });

    return grouped;
  }

  sortSessions(sessions, sortOptions) {
    const sortedSessions = [...sessions];

    sortedSessions.sort((a, b) => {
      let aValue, bValue;

      switch (sortOptions.sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'teacher':
          aValue = a.teacher.toLowerCase();
          bValue = b.teacher.toLowerCase();
          break;
        case 'school':
          aValue = a.school.toLowerCase();
          bValue = b.school.toLowerCase();
          break;
        case 'unit':
          aValue = parseInt(a.unit) || 0;
          bValue = parseInt(b.unit) || 0;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOptions.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sortedSessions;
  }

  createSessionElement(session, onSessionSelect, onSessionEdit, onSessionDelete) {
    const sessionElement = document.createElement('div');
    sessionElement.className = 'session-card';
    sessionElement.dataset.id = session.id;

    // Count only indicators with actual notes
    const notesCount = Object.entries(session.indicators || {}).filter(([_, notes]) => {
      return notes && ((notes.drawingData && notes.drawingData.length > 0) || notes.performanceType || notes.autoComment);
    }).length;

    const progress = Math.round((notesCount / 18) * 100);

    sessionElement.innerHTML = `
      <div class="session-card-checkbox">
        <input type="checkbox" class="session-checkbox" data-session-id="${session.id}">
      </div>
      <div class="session-card-content">
        <h3><strong>${session.teacher}</strong></h3>
        <p class="session-meta">
          ${session.school}${session.campus ? ` · ${session.campus}` : ''}<br>
          Unit ${session.unit} · Lesson ${session.lesson}<br>
          ${new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <div class="session-stats">
          <div class="progress-info">
            <span>${notesCount} of 18 indicators</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
          <span class="session-status">${session.status.toUpperCase()}</span>
        </div>
      </div>
    `;

    // Checkbox event
    const checkbox = sessionElement.querySelector('.session-checkbox');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      this.toggleSessionSelection(session.id, checkbox.checked);
      sessionElement.classList.toggle('selected', checkbox.checked);
    });

    // Click to select session (only if not interacting with checkbox)
    sessionElement.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox' && !e.target.closest('.session-card-checkbox')) {
        onSessionSelect(session.id);
      }
    });

    return sessionElement;
  }

  // Selection management for bulk operations
  toggleSessionSelection(sessionId, isSelected) {
    if (isSelected) {
      this.selectedSessions.add(sessionId);
    } else {
      this.selectedSessions.delete(sessionId);
    }
    this.updateBulkActionsUI();
  }

  selectAllSessions() {
    this.sessions.forEach(session => {
      this.selectedSessions.add(session.id);
    });
    this.updateSessionCheckboxes();
    this.updateBulkActionsUI();
  }

  deselectAllSessions() {
    this.selectedSessions.clear();
    this.updateSessionCheckboxes();
    this.updateBulkActionsUI();
  }

  updateSessionCheckboxes() {
    document.querySelectorAll('.session-checkbox').forEach(checkbox => {
      const sessionId = checkbox.dataset.sessionId;
      checkbox.checked = this.selectedSessions.has(sessionId);
      checkbox.closest('.session-card')?.classList.toggle('selected', checkbox.checked);
    });
  }

  updateBulkActionsUI() {
    const selectedCount = this.selectedSessions.size;
    const bulkActionsToolbar = document.getElementById('bulkActionsToolbar');
    const selectedCountElement = document.getElementById('selectedCount');
    const bulkEditBtn = document.getElementById('bulkEditBtn');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');

    if (bulkActionsToolbar && selectedCountElement) {
      if (selectedCount > 0) {
        bulkActionsToolbar.style.display = 'flex';
        selectedCountElement.textContent = `${selectedCount} selected`;
        
        // Enable/disable edit button based on selection count
        if (bulkEditBtn) {
          bulkEditBtn.disabled = selectedCount !== 1;
        }
      } else {
        bulkActionsToolbar.style.display = 'none';
      }
    }
  }

  getSelectedSessions() {
    return Array.from(this.selectedSessions).map(sessionId => 
      this.sessions.find(s => s.id === sessionId)
    ).filter(Boolean);
  }

  deleteSelectedSessions() {
    const selectedSessions = this.getSelectedSessions();
    selectedSessions.forEach(session => {
      this.deleteSession(session.id, true);
    });
    this.selectedSessions.clear();
    return selectedSessions.length;
  }

  getSessionProgress(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return 0;
    
    // FIXED: Count indicators that have actual content (drawing OR auto-comment)
    // NOT just performance type
    const notesCount = Object.entries(session.indicators || {}).filter(([_, notes]) => {
        const hasDrawing = notes.drawingData && notes.drawingData.length > 0;
        const hasAutoComment = notes.autoComment;
        return hasDrawing || hasAutoComment;
    }).length;
    
    return Math.round((notesCount / 18) * 100);
}

  getAllSessions() {
    return this.sessions;
  }

  getSessionsByGroup(groupId) {
    return this.sessions.filter(session => session.groupId === groupId);
  }

  getSessionById(sessionId) {
    return this.sessions.find(s => s.id === sessionId);
  }

  getAllSchools() {
    return [...new Set(this.sessions.map(s => s.school).filter(Boolean))];
  }

  getCampusesForSchool(school) {
    return [...new Set(this.sessions.filter(s => s.school === school).map(s => s.campus).filter(Boolean))];
  }

  addSessionToGroup(sessionId, groupId) {
    const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex >= 0) {
      this.sessions[sessionIndex].groupId = groupId;
      this.saveSessions();
      return true;
    }
    return false;
  }

  removeSessionFromGroup(sessionId) {
    const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex >= 0) {
      delete this.sessions[sessionIndex].groupId;
      this.saveSessions();
      return true;
    }
    return false;
  }

  // Search sessions
  searchSessions(query) {
    const lowerQuery = query.toLowerCase();
    return this.sessions.filter(session => {
      return (
        session.teacher.toLowerCase().includes(lowerQuery) ||
        session.school.toLowerCase().includes(lowerQuery) ||
        session.campus.toLowerCase().includes(lowerQuery) ||
        session.date.includes(lowerQuery) ||
        session.unit.toString().includes(lowerQuery) ||
        session.lesson.toString().includes(lowerQuery)
      );
    });
  }

  getSessionsCount() {
    return this.sessions.length;
  }
}