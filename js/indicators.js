// Enhanced teaching indicators with comments
const TEACHING_INDICATORS = [
    {
        id: "1.1",
        area: "LEARNING ENVIRONMENT",
        indicator: "Organized Teaching Area",
        explanation: "Teaching area is highly organized; materials, props, and technology are easily accessible. Students can see the teaching materials well",
        autoComment: "Classroom is exceptionally well-organized with clear learning zones"
    },
    {
        id: "1.2", 
        area: "LEARNING ENVIRONMENT",
        indicator: "Safe teaching environment",
        explanation: "Teaching environment is completely safe for all activities. Classroom space is effectively organized for easy movement during AAs and Transitions.",
        autoComment: "Classroom environment is completely safe for all activities"
    },
    {
        id: "1.3",
        area: "LEARNING ENVIRONMENT", 
        indicator: "Visually stimulating environment",
        explanation: "Classroom visuals fully reinforce lesson content and engage students.",
        autoComment: "Visual displays perfectly reinforce current learning objectives"
    },
    {
        id: "2.1",
        area: "CLASSROOM MANAGEMENT",
        indicator: "Established classroom routines",
        explanation: "Classroom routines are well-established and consistently followed.",
        autoComment: "Classroom routines are well-established and consistently followed"
    },
    {
        id: "2.2",
        area: "CLASSROOM MANAGEMENT",
        indicator: "Positive classroom management",
        explanation: "Maintains positive classroom environment with clear expectations.",
        autoComment: "Excellent classroom management creates positive learning environment"
    },
    {
        id: "2.3",
        area: "CLASSROOM MANAGEMENT",
        indicator: "Technical troubleshooting",
        explanation: "Proactively resolves technical issues without disrupting lesson flow.",
        autoComment: "Proactively resolves technical issues without disrupting lesson flow"
    },
    {
        id: "3.1",
        area: "LESSON DELIVERY",
        indicator: "Follows lesson plan",
        explanation: "Lesson plans are followed with precision and clear purpose.",
        autoComment: "Lesson plans are followed with precision and clear purpose"
    },
    {
        id: "3.2",
        area: "LESSON DELIVERY",
        indicator: "Memory Mode delivery",
        explanation: "Memory Mode is used effectively to enhance student engagement.",
        autoComment: "Memory Mode is used effectively to enhance student engagement"
    },
    {
        id: "3.3",
        area: "LESSON DELIVERY",
        indicator: "Material usage",
        explanation: "GrapeSEED materials are used effectively as outlined in manuals.",
        autoComment: "GrapeSEED materials are used effectively as outlined in manuals"
    },
    {
        id: "3.4",
        area: "LESSON DELIVERY",
        indicator: "Student progress monitoring",
        explanation: "Effectively monitors student progress and understanding.",
        autoComment: "Excellent monitoring of student progress and understanding"
    },
    {
        id: "3.5",
        area: "LESSON DELIVERY",
        indicator: "Teaching adjustments",
        explanation: "Teaching is effectively adjusted based on student responses.",
        autoComment: "Teaching is effectively adjusted based on student responses"
    },
    {
        id: "4.1",
        area: "QUESTIONING TECHNIQUES",
        indicator: "Purposeful questioning",
        explanation: "Questions are purposeful and aligned with learning objectives.",
        autoComment: "Questions are purposeful and aligned with learning objectives"
    },
    {
        id: "4.2",
        area: "QUESTIONING TECHNIQUES",
        indicator: "Student engagement",
        explanation: "Questions engage all students and promote critical thinking.",
        autoComment: "Questions engage all students and promote critical thinking"
    },
    {
        id: "5.1",
        area: "TRANSITION MANAGEMENT",
        indicator: "Smooth transitions",
        explanation: "Transitions are smooth and maintain lesson momentum.",
        autoComment: "Transitions are smooth and maintain lesson momentum"
    },
    {
        id: "6.1",
        area: "TEACHER PRESENCE",
        indicator: "Gestures and expressions",
        explanation: "Uses gestures and expressions effectively to engage students.",
        autoComment: "Excellent use of gestures and expressions to engage students"
    },
    {
        id: "6.2",
        area: "TEACHER PRESENCE",
        indicator: "Wait time",
        explanation: "Provides appropriate wait time for student responses.",
        autoComment: "Provides appropriate wait time for student responses"
    },
    {
        id: "7.1",
        area: "STUDENT INTERACTION",
        indicator: "Peer practice facilitation",
        explanation: "Effectively facilitates peer practice and collaboration.",
        autoComment: "Effectively facilitates peer practice and collaboration"
    },
    {
        id: "8.1",
        area: "INSTRUCTIONAL DELIVERY",
        indicator: "Modeling Actions", 
        explanation: "Accurately models actions and movements that align with lesson content, enhancing comprehension and engagement.",
        autoComment: "Actions and movements are perfectly aligned with lesson content"
    }
];

class IndicatorsManager {
    constructor() {
        this.indicators = TEACHING_INDICATORS;
        this.activeIndicatorId = null;
    }

    renderIndicatorsList(container, onIndicatorSelect, sessionManager = null) {
        container.innerHTML = '';
        
        this.indicators.forEach(indicator => {
            const indicatorElement = this.createIndicatorElement(indicator, onIndicatorSelect, sessionManager);
            container.appendChild(indicatorElement);
        });
    }

    createIndicatorElement(indicator, onIndicatorSelect, sessionManager = null) {
        const indicatorElement = document.createElement('div');
        indicatorElement.className = 'indicator-item';
        indicatorElement.dataset.id = indicator.id;
        
        // Check for existing notes and performance type
        let performanceType = null;
        let autoComment = false;
        if (sessionManager) {
            const notes = sessionManager.getIndicatorNotes(indicator.id);
            if (notes) {
                performanceType = notes.performanceType;
                autoComment = notes.autoComment || false;
                // Only apply if performance type exists
                if (performanceType) {
                    const classSuffix = performanceType === 'good' ? 'good-point' : 'growth-area'; // FIXED: Match CSS for growth
                    indicatorElement.classList.add('has-notes', classSuffix);
                }
            }
        }
        
        indicatorElement.innerHTML = `
            <div class="indicator-header">
                <div class="indicator-id">
                    ${indicator.id}
                    ${performanceType ? `<div class="performance-badge ${performanceType}"></div>` : ''}
                </div>
                <div class="indicator-controls">
                    <button class="performance-toggle-btn good ${performanceType === 'good' ? 'active' : ''}" data-type="good" title="Mark as Good Point">
                        ✓
                    </button>
                    <button class="performance-toggle-btn growth ${performanceType === 'growth' ? 'active' : ''}" data-type="growth" title="Mark as Growth Area">
                        ✗
                    </button>
                    <button class="auto-comment-toggle ${autoComment ? 'active' : ''}" title="Auto-add comment">
                        💬
                    </button>
                </div>
            </div>
            <div class="indicator-text">${indicator.indicator}</div>
        `;
        
        // Indicator click handler - Only select, don't auto-mark
        indicatorElement.addEventListener('click', (e) => {
            if (!e.target.closest('.indicator-controls')) {
                onIndicatorSelect(indicator);
            }
        });
        
        // Performance toggle handlers
        const goodBtn = indicatorElement.querySelector('.performance-toggle-btn.good');
        const growthBtn = indicatorElement.querySelector('.performance-toggle-btn.growth');
        const autoCommentBtn = indicatorElement.querySelector('.auto-comment-toggle');
        
        if (goodBtn) {
            goodBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handlePerformanceToggle(indicator.id, 'good');
                this.updatePerformanceUI(indicatorElement, 'good');
                if (window.app) {
                    window.app.updateIndicatorPerformanceDisplay();
                    window.app.updateProgress();
                }
            });
        }
        
        if (growthBtn) {
            growthBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handlePerformanceToggle(indicator.id, 'growth');
                this.updatePerformanceUI(indicatorElement, 'growth');
                if (window.app) {
                    window.app.updateIndicatorPerformanceDisplay();
                    window.app.updateProgress();
                }
            });
        }
        
        if (autoCommentBtn) {
            autoCommentBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAutoCommentToggle(indicator);
                autoCommentBtn.classList.toggle('active');
                if (window.app) {
                    window.app.updateProgress();
                }
            });
        }
        
        return indicatorElement;
    }

    handlePerformanceToggle(indicatorId, performanceType) {
        if (!window.app || !window.app.sessionManager) {
            console.error('App or sessionManager not available');
            return;
        }
        
        const sessionManager = window.app.sessionManager;
        const notes = sessionManager.getIndicatorNotes(indicatorId) || {};
        const currentDrawingData = notes.drawingData || null;
        const currentAutoComment = notes.autoComment || false;
        
        if (notes.performanceType === performanceType) {
            // Toggle off
            sessionManager.saveIndicatorNotes(indicatorId, currentDrawingData, null, currentAutoComment);
            console.log(`Removed ${performanceType} from indicator ${indicatorId}`);
        } else {
            // Toggle on
            sessionManager.saveIndicatorNotes(indicatorId, currentDrawingData, performanceType, currentAutoComment);
            console.log(`Set ${performanceType} for indicator ${indicatorId}`);
        }
    }

    handleAutoCommentToggle(indicator) {
        if (!window.app || !window.app.sessionManager) {
            console.error('App or sessionManager not available');
            return;
        }
        
        const sessionManager = window.app.sessionManager;
        const notes = sessionManager.getIndicatorNotes(indicator.id) || {};
        const currentDrawingData = notes.drawingData || null;
        const currentPerformanceType = notes.performanceType || null;
        const currentAutoComment = notes.autoComment || false;
        
        if (currentAutoComment) {
            // Remove
            sessionManager.saveIndicatorNotes(indicator.id, currentDrawingData, currentPerformanceType, false);
            console.log(`Removed auto-comment from ${indicator.id}`);
        } else {
            // Add
            sessionManager.saveIndicatorNotes(indicator.id, currentDrawingData, currentPerformanceType, true);
            console.log(`Added auto-comment to ${indicator.id}: ${indicator.autoComment}`);
            
            // Add to canvas if active
            if (window.app.drawingCanvas && window.app.drawingCanvas.currentIndicatorId === indicator.id) {
                window.app.drawingCanvas.addCommentToCanvas(indicator.autoComment);
            }
        }
    }

    updatePerformanceUI(indicatorElement, performanceType) {
        const goodBtn = indicatorElement.querySelector('.performance-toggle-btn.good');
        const growthBtn = indicatorElement.querySelector('.performance-toggle-btn.growth');
        const performanceBadge = indicatorElement.querySelector('.performance-badge');
        
        // Remove classes
        goodBtn.classList.remove('active');
        growthBtn.classList.remove('active');
        indicatorElement.classList.remove('has-notes', 'good-point', 'growth-area');
        
        const indicatorId = indicatorElement.dataset.id;
        
        if (!window.app || !window.app.sessionManager) return;
        
        const notes = window.app.sessionManager.getIndicatorNotes(indicatorId);
        
        if (notes && notes.performanceType) {
            const classSuffix = notes.performanceType === 'good' ? 'good-point' : 'growth-area'; // FIXED: Match CSS
            indicatorElement.classList.add('has-notes', classSuffix);
            
            if (notes.performanceType === 'good') {
                goodBtn.classList.add('active');
            } else {
                growthBtn.classList.add('active');
            }
            
            if (!performanceBadge) {
                const newBadge = document.createElement('div');
                newBadge.className = `performance-badge ${notes.performanceType}`;
                indicatorElement.querySelector('.indicator-id').appendChild(newBadge);
            } else {
                performanceBadge.className = `performance-badge ${notes.performanceType}`;
                performanceBadge.style.display = 'block';
            }
        } else {
            if (performanceBadge) {
                performanceBadge.style.display = 'none';
            }
        }
    }

    setActiveIndicator(indicatorId) {
        document.querySelectorAll('.indicator-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeIndicator = document.querySelector(`[data-id="${indicatorId}"]`);
        if (activeIndicator) {
            activeIndicator.classList.add('active');
            this.activeIndicatorId = indicatorId;
            
            activeIndicator.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    getIndicatorById(id) {
        return this.indicators.find(ind => ind.id === id);
    }

    getIndicatorsByArea(area) {
        return this.indicators.filter(ind => ind.area === area);
    }

    getAreas() {
        return [...new Set(this.indicators.map(ind => ind.area))];
    }

    getPerformanceStats(sessionManager) {
        if (!sessionManager || !sessionManager.currentSession) {
            return { good: 0, growth: 0, total: 0 };
        }
        
        const indicators = sessionManager.currentSession.indicators;
        let goodCount = 0;
        let growthCount = 0;
        let total = 0;
        
        Object.values(indicators).forEach(note => {
            // FIXED: Only count if has actual content
            const hasContent = (note.drawingData && note.drawingData.length > 0) || note.performanceType || note.autoComment;
            if (hasContent) {
                total++;
                if (note.performanceType === 'good') goodCount++;
                if (note.performanceType === 'growth') growthCount++;
            }
        });
        
        return {
            good: goodCount,
            growth: growthCount,
            total: total
        };
    }
}