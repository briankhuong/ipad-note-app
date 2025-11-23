class SessionManager {
  constructor() {
    this.currentSession = null;
    this.sessions = this.loadSessions();
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

  saveIndicatorNotes(indicatorId, drawingData, performanceType = null, autoComment = false) {
    if (!this.currentSession) return;
    
    // FIXED: Don't save if all fields are empty/null/false
    const hasDrawing = drawingData && drawingData.length > 0;
    const hasPerformance = !!performanceType;
    const hasAutoComment = !!autoComment;
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
      performanceType: performanceType,
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

  renderSessionsList(container, onSessionSelect, onSessionEdit, onSessionDelete, filters = {}) {
    console.log('Rendering sessions list with filters:', filters);
    container.innerHTML = '';
    const sessionsToRender = filters && Object.keys(filters).length > 0 ? this.filterSessions(filters) : this.sessions;

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
    container.style.display = 'grid';

    sessionsToRender.forEach(session => {
      const sessionElement = this.createSessionElement(session, onSessionSelect, onSessionEdit, onSessionDelete);
      container.appendChild(sessionElement);
    });
  }

  createSessionElement(session, onSessionSelect, onSessionEdit, onSessionDelete) {
    const swipeContainer = document.createElement('div');
    swipeContainer.className = 'swipe-container';
    swipeContainer.dataset.id = session.id;

    const swipeContent = document.createElement('div');
    swipeContent.className = 'swipe-content session-card';

    // Count only indicators with actual notes (drawing data or performance type)
    const notesCount = Object.keys(session.indicators).filter(indicatorId => {
      const notes = session.indicators[indicatorId];
      return notes && (notes.drawingData || notes.performanceType);
    }).length;

    const progress = this.getSessionProgress(session.id);

    swipeContent.innerHTML = `
      <div class="session-header">
        <div class="session-teacher">${session.teacher}</div>
      </div>
      <div class="session-meta">
        ${session.school}${session.campus ? ` • ${session.campus}` : ''}
      </div>
      <div class="session-details">
        Unit ${session.unit} • Lesson ${session.lesson}
      </div>
      <div class="session-date">
        ${new Date(session.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
      <div class="session-progress">
        ${notesCount} of 18 indicators ${session.status.toUpperCase()}
      </div>
    `;

    const swipeActions = document.createElement('div');
    swipeActions.className = 'swipe-actions';
    swipeActions.innerHTML = `
      <div class="swipe-action edit">Edit</div>
      <div class="swipe-action delete">Delete</div>
    `;

    swipeContainer.appendChild(swipeContent);
    swipeContainer.appendChild(swipeActions);

    // Click to select session
    swipeContent.addEventListener('click', (e) => {
      // Only select if not swiped
      if (!swipeContainer.classList.contains('swiped')) {
        console.log('Session selected:', session.id);
        onSessionSelect(session.id);
      }
    });

    // Edit button event
    swipeActions.querySelector('.swipe-action.edit').addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Edit session clicked:', session.id);
      swipeContainer.classList.remove('swiped');
      swipeContent.style.transform = 'translateX(0)';
      swipeActions.style.transform = 'translateX(100%)';
      onSessionEdit(session.id);
    });

    // Delete button event
    swipeActions.querySelector('.swipe-action.delete').addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Delete session clicked:', session.id);
      swipeContainer.classList.remove('swiped');
      swipeContent.style.transform = 'translateX(0)';
      swipeActions.style.transform = 'translateX(100%)';
      onSessionDelete(session.id);
    });

    // Setup swipe functionality
    this.setupSwipe(swipeContainer, swipeContent, swipeActions);
    return swipeContainer;
  }

  setupSwipe(container, content, actions) {
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    let swipeDistance = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      swipeDistance = 0;
      content.style.transition = 'none';
      actions.style.transition = 'none';
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
      swipeDistance = startX - currentX;

      if (swipeDistance > 0) {
        // Swiping left
        e.preventDefault();
        const translateX = Math.min(swipeDistance, 160);
        content.style.transform = `translateX(-${translateX}px)`;
        actions.style.transform = `translateX(-${translateX}px)`;
      }
    };

    const handleTouchEnd = () => {
      isSwiping = false;
      content.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
      actions.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
      if (swipeDistance > 80) {
        content.style.transform = 'translateX(-160px)';
        actions.style.transform = 'translateX(-160px)';
        container.classList.add('swiped');
      } else {
        content.style.transform = 'translateX(0)';
        actions.style.transform = 'translateX(100%)';
        container.classList.remove('swiped');
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);
  }

  getSessionProgress(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return 0;
    const notesCount = Object.keys(session.indicators).filter(indicatorId => {
      const notes = session.indicators[indicatorId];
      return notes && (notes.drawingData || notes.performanceType);
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
}