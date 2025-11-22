// Enhanced teaching indicators with comments
const TEACHING_INDICATORS = [
    {
        id: "1.1",
        area: "LEARNING ENVIRONMENT",
        indicator: "Organized Teaching Area",
        explanation: "Teaching area is highly organized; materials, props, and technology are easily accessible. Students can see the teaching materials well",
        comments: {
            good: [
                "Excellent classroom organization with clear learning zones",
                "Materials are well-prepared and easily accessible to students",
                "Teaching space is optimized for student engagement and visibility"
            ],
            growth: [
                "Consider improving material organization for smoother transitions",
                "Work on creating more defined learning areas in the classroom",
                "Ensure all students have clear visibility of teaching materials"
            ]
        }
    },
    {
        id: "1.2", 
        area: "LEARNING ENVIRONMENT",
        indicator: "Safe teaching environment",
        explanation: "Teaching environment is completely safe for all activities. Classroom space is effectively organized for easy movement during AAs and Transitions.",
        comments: {
            good: [
                "Classroom environment is completely safe for all activities",
                "Space is effectively organized for easy movement during transitions",
                "Excellent attention to student safety protocols"
            ],
            growth: [
                "Consider establishing clearer safety protocols for specific activities",
                "Work on optimizing classroom layout for better traffic flow",
                "Ensure all safety equipment is properly maintained and accessible"
            ]
        }
    },
    {
        id: "1.3",
        area: "LEARNING ENVIRONMENT", 
        indicator: "Visually stimulating environment",
        explanation: "Classroom visuals fully reinforce lesson content and engage students.",
        comments: {
            good: [
                "Classroom visuals perfectly reinforce lesson content",
                "Engaging and age-appropriate displays throughout the classroom",
                "Visuals are well-maintained and strategically placed"
            ],
            growth: [
                "Consider updating visuals to better align with current unit",
                "Work on creating more interactive visual displays",
                "Ensure visuals are at appropriate student eye-level"
            ]
        }
    },
    // ... Continue with all 18 indicators with similar structure ...
    {
        id: "8.5",
        area: "INSTRUCTIONAL DELIVERY",
        indicator: "Modeling Actions", 
        explanation: "Accurately models actions and movements that align with lesson content, enhancing comprehension and engagement.",
        comments: {
            good: [
                "Actions and movements are perfectly aligned with lesson content",
                "Excellent modeling that enhances student comprehension",
                "Clear and precise demonstration of all required actions"
            ],
            growth: [
                "Consider practicing movements to ensure perfect synchronization",
                "Work on making actions more exaggerated for better visibility",
                "Ensure all students can clearly see the modeling"
            ]
        }
    }
];

// Pre-defined comments for all indicators
const INDICATOR_COMMENTS = {
    "1.1": [
        { category: "STRENGTH", text: "Classroom is exceptionally well-organized with clear learning zones" },
        { category: "STRENGTH", text: "All teaching materials are prepared and easily accessible" },
        { category: "GROWTH", text: "Consider creating more defined activity areas for different learning types" },
        { category: "GROWTH", text: "Ensure teaching materials are visible from all student positions" }
    ],
    "1.2": [
        { category: "STRENGTH", text: "Classroom environment is completely safe for all activities" },
        { category: "STRENGTH", text: "Space is effectively organized for easy movement during transitions" },
        { category: "GROWTH", text: "Consider establishing clearer safety protocols for specific activities" },
        { category: "GROWTH", text: "Work on optimizing classroom layout for better traffic flow" }
    ],
    "1.3": [
        { category: "STRENGTH", text: "Visual displays perfectly reinforce current learning objectives" },
        { category: "STRENGTH", text: "Classroom environment is engaging and stimulating for students" },
        { category: "GROWTH", text: "Consider rotating displays more frequently to maintain interest" },
        { category: "GROWTH", text: "Add more student-created content to classroom displays" }
    ],
    "2.1-2.2": [
        { category: "STRENGTH", text: "Classroom routines are well-established and consistently followed" },
        { category: "STRENGTH", text: "Excellent classroom management creates positive learning environment" },
        { category: "GROWTH", text: "Consider implementing more visual cues for routine transitions" },
        { category: "GROWTH", text: "Work on reinforcing routines through consistent practice" }
    ],
    "2.3": [
        { category: "STRENGTH", text: "Proactively resolves technical issues without disrupting lesson flow" },
        { category: "STRENGTH", text: "Excellent troubleshooting skills with classroom technology" },
        { category: "GROWTH", text: "Consider creating a tech troubleshooting checklist" },
        { category: "GROWTH", text: "Practice alternative activities for unexpected tech issues" }
    ],
    "3.1": [
        { category: "STRENGTH", text: "Lesson plans are followed with precision and clear purpose" },
        { category: "STRENGTH", text: "Excellent adaptation of lesson plans based on student needs" },
        { category: "GROWTH", text: "Consider adding more flexibility to lesson timing" },
        { category: "GROWTH", text: "Work on smoother transitions between lesson components" }
    ],
    "3.5": [
        { category: "STRENGTH", text: "Memory Mode is used effectively to enhance student engagement" },
        { category: "STRENGTH", text: "Excellent delivery that maintains student attention throughout" },
        { category: "GROWTH", text: "Consider varying pace to maintain student engagement" },
        { category: "GROWTH", text: "Practice smoother transitions into and out of Memory Mode" }
    ],
    "3.4-5.1": [
        { category: "STRENGTH", text: "GrapeSEED materials are used effectively as outlined in manuals" },
        { category: "STRENGTH", text: "Excellent integration of materials to support learning objectives" },
        { category: "GROWTH", text: "Consider creating additional supporting materials" },
        { category: "GROWTH", text: "Work on more creative uses of existing materials" }
    ],
    "3.3-6.1-7.2": [
        { category: "STRENGTH", text: "Excellent monitoring of student progress and understanding" },
        { category: "STRENGTH", text: "Teaching is effectively adjusted based on student responses" },
        { category: "GROWTH", text: "Consider implementing more formative assessment strategies" },
        { category: "GROWTH", text: "Work on documenting student progress more systematically" }
    ],
    "7.1": [
        { category: "STRENGTH", text: "Questions are purposeful and aligned with learning objectives" },
        { category: "STRENGTH", text: "Excellent questioning techniques that engage all students" },
        { category: "GROWTH", text: "Consider using more open-ended questions" },
        { category: "GROWTH", text: "Work on distributing questions more evenly among students" }
    ],
    "7.3": [
        { category: "STRENGTH", text: "Transitions are smooth and maintain lesson momentum" },
        { category: "STRENGTH", text: "Excellent use of transition time for reinforcement" },
        { category: "GROWTH", text: "Consider implementing transition songs or signals" },
        { category: "GROWTH", text: "Work on reducing transition time between activities" }
    ],
    "7.4-8.1": [
        { category: "STRENGTH", text: "Excellent use of gestures and expressions to engage students" },
        { category: "STRENGTH", text: "Maintains positive and engaging presence throughout lesson" },
        { category: "GROWTH", text: "Consider using more varied facial expressions" },
        { category: "GROWTH", text: "Work on maintaining energy throughout entire lesson" }
    ],
    "7.5": [
        { category: "STRENGTH", text: "Provides appropriate wait time for student responses" },
        { category: "STRENGTH", text: "Excellent patience that encourages student participation" },
        { category: "GROWTH", text: "Consider extending wait time for more complex questions" },
        { category: "GROWTH", text: "Work on recognizing when students need more thinking time" }
    ],
    "7.6": [
        { category: "STRENGTH", text: "Effectively facilitates peer practice and collaboration" },
        { category: "STRENGTH", text: "Excellent management of pair and small group activities" },
        { category: "GROWTH", text: "Consider providing clearer instructions for group work" },
        { category: "GROWTH", text: "Work on monitoring all groups equally during activities" }
    ],
    "8.2": [
        { category: "STRENGTH", text: "Gestures and props are used purposefully to enhance learning" },
        { category: "STRENGTH", text: "Excellent integration of visual and kinesthetic elements" },
        { category: "GROWTH", text: "Consider using more varied props to maintain interest" },
        { category: "GROWTH", text: "Work on ensuring all students can see gestures clearly" }
    ],
    "8.3": [
        { category: "STRENGTH", text: "Learning objectives are clearly emphasized throughout lesson" },
        { category: "STRENGTH", text: "Excellent use of visual cues to reinforce key concepts" },
        { category: "GROWTH", text: "Consider reviewing objectives more frequently" },
        { category: "GROWTH", text: "Work on connecting activities back to learning objectives" }
    ],
    "8.4": [
        { category: "STRENGTH", text: "Models proper speech with excellent pronunciation and intonation" },
        { category: "STRENGTH", text: "Serves as an excellent language role model for students" },
        { category: "GROWTH", text: "Consider slowing speech for more complex vocabulary" },
        { category: "GROWTH", text: "Work on consistent correction of student pronunciation" }
    ],
    "8.5": [
        { category: "STRENGTH", text: "Actions and movements are perfectly aligned with lesson content" },
        { category: "STRENGTH", text: "Excellent modeling that enhances student comprehension" },
        { category: "GROWTH", text: "Consider practicing movements to ensure perfect synchronization" },
        { category: "GROWTH", text: "Work on making actions more exaggerated for better visibility" }
    ]
};

class IndicatorsManager {
    constructor() {
        this.indicators = TEACHING_INDICATORS;
        this.comments = INDICATOR_COMMENTS;
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
        if (sessionManager) {
            const notes = sessionManager.getIndicatorNotes(indicator.id);
            if (notes) {
                performanceType = notes.performanceType;
                indicatorElement.classList.add('has-notes', performanceType + '-point');
            }
        }
        
        indicatorElement.innerHTML = `
            <div class="indicator-id">
                ${indicator.id}
                ${performanceType ? `<div class="performance-badge ${performanceType}"></div>` : ''}
            </div>
            <div class="indicator-text">${indicator.indicator}</div>
        `;
        
        indicatorElement.addEventListener('click', () => {
            onIndicatorSelect(indicator);
        });
        
        return indicatorElement;
    }

    markIndicatorAsHavingNotes(indicatorId, performanceType = 'good') {
        const indicatorElement = document.querySelector(`[data-id="${indicatorId}"]`);
        if (indicatorElement) {
            indicatorElement.classList.add('has-notes', performanceType + '-point');
            
            // Update or create performance badge
            let badge = indicatorElement.querySelector('.performance-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = `performance-badge ${performanceType}`;
                indicatorElement.querySelector('.indicator-id').appendChild(badge);
            } else {
                badge.className = `performance-badge ${performanceType}`;
            }
        }
    }

    setActiveIndicator(indicatorId) {
        // Remove active class from all indicators
        document.querySelectorAll('.indicator-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected indicator
        const activeIndicator = document.querySelector(`[data-id="${indicatorId}"]`);
        if (activeIndicator) {
            activeIndicator.classList.add('active');
            
            // Scroll the active indicator into view
            activeIndicator.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    getCommentsForIndicator(indicatorId) {
        return this.comments[indicatorId] || [];
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

    // New method to get performance statistics
    getPerformanceStats(sessionManager) {
        if (!sessionManager || !sessionManager.currentSession) {
            return { good: 0, growth: 0, total: 0 };
        }
        
        const indicators = sessionManager.currentSession.indicators;
        let goodCount = 0;
        let growthCount = 0;
        
        Object.values(indicators).forEach(note => {
            if (note.performanceType === 'good') goodCount++;
            if (note.performanceType === 'growth') growthCount++;
        });
        
        return {
            good: goodCount,
            growth: growthCount,
            total: Object.keys(indicators).length
        };
    }
}