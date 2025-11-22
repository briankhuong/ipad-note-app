class GroupsManager {
    constructor() {
        this.groups = this.loadGroups();
        this.trash = this.loadTrash();
        
        // Pre-create schools if none exist
        if (this.groups.length === 0) {
            this.preCreateSchools();
        }
    }

    preCreateSchools() {
        const schools = [
            { schoolName: "Tứ Hiệp", campus: "Tứ Hiệp", adminName: "Chị Hạnh" },
            { schoolName: "Ánh Trăng", campus: "Yên Xá", adminName: "Chị Hà" },
            { schoolName: "Brik English Academy", campus: "Đông Hương", adminName: "Chị Alice" },
            { schoolName: "Em bé hạnh phúc", campus: "Tây Nam Linh Đàm", adminName: "Chị Ngân" },
            { schoolName: "Green Tree House", campus: "Cơ sở 1", adminName: "Chị Xiêm" },
            { schoolName: "Hoa Mặt Trời", campus: "Dịch Vọng", adminName: "Chị Hồng" },
            { schoolName: "IQ Linh Dam", campus: "Tay Nam Linh Dam", adminName: "Apple" },
            { schoolName: "Kids House", campus: "Tây Mỗ", adminName: "Chị Yến" },
            { schoolName: "Mầm Non Hạnh Phúc", campus: "Mầm Non Hạnh Phúc", adminName: "Chị Thảo" },
            { schoolName: "Mastermind", campus: "Hồ Tùng Mậu", adminName: "Chị Điệp" },
            { schoolName: "Mặt trời bé thơ", campus: "Minh Khai", adminName: "Chị Hồng" },
            { schoolName: "Mat Troi Xanh Bac Ninh", campus: "Bac Ninh 1", adminName: "Ngọc" },
            { schoolName: "Mi Mi", campus: "Resco Phạm Văn Đồng", adminName: "Chị Dung" },
            { schoolName: "MN AMG", campus: "AMG Vinhomes Gardenia", adminName: "Chị Phương" },
            { schoolName: "MN Bông Mai", campus: "25 Tân Mai", adminName: "Anh Nam" },
            { schoolName: "MN Bông Mai", campus: "BM GrapeSEED", adminName: "Anh Nam" },
            { schoolName: "MN Bông Mai", campus: "STEAMe GARTEN 360 Giải Phóng", adminName: "Anh Nam" },
            { schoolName: "MN Emilia Elite", campus: "BT Ngoại Giao Đoàn", adminName: "Closed" },
            { schoolName: "MN Hà Nội", campus: "Nam Thăng Long", adminName: "Chị Sâm" },
            { schoolName: "MN Hoa Hồng", campus: "Mễ Trì Thượng", adminName: "Chị Hồng" },
            { schoolName: "MN Làng Hạnh Phúc", campus: "Nam Từ Liêm", adminName: "Chị Jodie" },
            { schoolName: "MN Những cánh diều bay", campus: "FK Minh Khai", adminName: "Nhung Nguyễn" },
            { schoolName: "MN Nụ cười bé thơ 1", campus: "Ngoại Giao Đoàn", adminName: "Chị Thủy" },
            { schoolName: "MN Nụ cười trẻ thơ", campus: "kidssmile Hoàng Quốc Việt", adminName: "Chị Nhung" },
            { schoolName: "MN Quốc Tế Việt Ý", campus: "Việt Ý An Hưng", adminName: "Chị Hoa" },
            { schoolName: "MN Tài Năng Nhí", campus: "TT1B Tây Nam Linh Đàm", adminName: "Chị Hiền" },
            { schoolName: "MN Vườn Trí Tuệ", campus: "30 Lý Nam Đế", adminName: "Chị Dương" },
            { schoolName: "Nắng Xuân", campus: "Đại Mỗ", adminName: "Chị Nga" },
            { schoolName: "Ngôi nhà cây xanh", campus: "Đại Mỗ", adminName: "Chị Xiêm" },
            { schoolName: "Nguồn Sáng", campus: "Mộ Lao", adminName: "Chị Lucy" },
            { schoolName: "Nhà Hát Nhỏ Hà Nội", campus: "NewDay Mon", adminName: "Chị Hoàn" },
            { schoolName: "Nụ cười trẻ thơ 2", campus: "Ngoại Giao Đoàn", adminName: "Chị Thanh" },
            { schoolName: "Peakland", campus: "Anh Nhật", adminName: "Ms. Nga" },
            { schoolName: "Peakland", campus: "Peakland Preschool", adminName: "Ms. Giang" },
            { schoolName: "Peakland", campus: "Song Nhue", adminName: "Chị Dung" },
            { schoolName: "Peakland", campus: "Star Montessori Preschool", adminName: "Chị Dung" },
            { schoolName: "Peakland", campus: "Vinsmart GrapeSEED", adminName: "Julie" },
            { schoolName: "Phuong Hong", campus: "HH2E Duong Noi", adminName: "Chị Mai" },
            { schoolName: "Sắc màu", campus: "Ngụy Như Kon Tum", adminName: "Daisy" },
            { schoolName: "Sao Hà Nội", campus: "CASA_60 Nguyễn Đức Cảnh", adminName: "Chị Tâm" },
            { schoolName: "Sao Hà Nội", campus: "HN little star Minh Khai", adminName: "Chị Huệ" },
            { schoolName: "Sao Hã Nội", campus: "KIDS GARDEN_151 Nguyễn Đức Cảnh", adminName: "Chị Tâm" },
            { schoolName: "Sao Hà Nội", campus: "Ngoại Giao Đoàn Offline", adminName: "Chị Linh" },
            { schoolName: "Sao Hà Nội", campus: "Ngoại Giao Đoàn_Online", adminName: "Chị Linh" },
            { schoolName: "Trăng Đỏ", campus: "Cầu Giấy", adminName: "Chị Tuyết" },
            { schoolName: "Trung tâm Ngoại ngữ Ishine", campus: "TT Ngoại ngữ Ishine", adminName: "Chị Hương" },
            { schoolName: "TTNN Oscar", campus: "Green Park", adminName: "Chị Nguyệt" },
            { schoolName: "Tuổi Thần Tiên", campus: "KDT Đại Thanh", adminName: "Chị Nancy" },
            { schoolName: "Tuổi Thần Tiên", campus: "Văn Điển", adminName: "Chị Nancy" },
            { schoolName: "Tuổi Thơ Tài Năng", campus: "Tôn Đức Thắng", adminName: "Chị Phương" },
            { schoolName: "Tuổi Thơ Tài Năng", campus: "Việt Hưng - CS 3", adminName: "Chị Phương" },
            { schoolName: "Viet Han", campus: "KĐT Kim Văn", adminName: "Chị Hoài" },
            { schoolName: "Việt Hàn (Kim Giang)", campus: "Hoàng Đạo Thành", adminName: "Chị Hằng" },
            { schoolName: "Việt Hàn (Kim Giang)", campus: "Online", adminName: "Chị Hằng" },
            { schoolName: "VSK", campus: "158 Võ Chí Công", adminName: "Chị Tuyết" },
            { schoolName: "VSK Sunshine", campus: "Cổ Nhuế", adminName: "Chị Hương" }
        ];

        schools.forEach(school => {
            this.createGroup(
                school.schoolName,
                school.adminName,
                '', // phone
                '', // address
                school.campus
            );
        });

        this.saveGroups();
        console.log(`Pre-created ${schools.length} schools`);
    }

    createGroup(schoolName, adminName, adminPhone, schoolAddress, campus = '') {
        const groupId = 'group_' + Date.now();
        
        const group = {
            id: groupId,
            schoolName: schoolName,
            campus: campus,
            adminName: adminName,
            adminPhone: adminPhone || '',
            schoolAddress: schoolAddress || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sessionCount: 0,
            isActive: true
        };
        
        this.groups.unshift(group);
        this.saveGroups();
        return group;
    }

    updateGroup(groupId, updates) {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex >= 0) {
            this.groups[groupIndex] = {
                ...this.groups[groupIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveGroups();
            return this.groups[groupIndex];
        }
        return null;
    }

    deleteGroup(groupId, moveToTrash = true) {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex >= 0) {
            const group = this.groups[groupIndex];
            
            if (moveToTrash) {
                this.moveToTrash('group', group);
            }
            
            this.groups.splice(groupIndex, 1);
            this.saveGroups();
            return true;
        }
        return false;
    }

    getGroup(groupId) {
        return this.groups.find(g => g.id === groupId);
    }

    moveToTrash(type, item) {
        const trashItem = {
            ...item,
            originalType: type,
            deletedAt: new Date().toISOString(),
            trashId: 'trash_' + Date.now()
        };
        
        this.trash.unshift(trashItem);
        this.saveTrash();
    }

    restoreFromTrash(trashId) {
        console.log('GroupsManager: Attempting to restore from trash:', trashId);
        const trashIndex = this.trash.findIndex(t => t.trashId === trashId);
        
        if (trashIndex >= 0) {
            const item = this.trash[trashIndex];
            console.log('GroupsManager: Found item to restore:', item);
            
            // Remove the trash-specific properties
            const { originalType, deletedAt, trashId: trashIdProp, ...restoredItem } = item;
            
            let result = null;
            
            if (originalType === 'group') {
                console.log('GroupsManager: Restoring group:', restoredItem.schoolName);
                this.groups.unshift(restoredItem);
                this.saveGroups();
                result = { type: 'group', data: restoredItem };
            } else if (originalType === 'session') {
                console.log('GroupsManager: Restoring session:', restoredItem.teacher);
                result = { type: 'session', data: restoredItem };
            }
            
            // Remove from trash
            this.trash.splice(trashIndex, 1);
            this.saveTrash();
            
            console.log('GroupsManager: Item restored successfully. Trash count now:', this.trash.length);
            console.log('GroupsManager: Groups count now:', this.groups.length);
            
            return result;
        }
        
        console.log('GroupsManager: Item not found in trash:', trashId);
        return null;
    }

    permanentlyDelete(trashId) {
        const trashIndex = this.trash.findIndex(t => t.trashId === trashId);
        if (trashIndex >= 0) {
            this.trash.splice(trashIndex, 1);
            this.saveTrash();
            return true;
        }
        return false;
    }

    emptyTrash() {
        this.trash = [];
        this.saveTrash();
    }

    updateSessionCount(groupId, sessionManager) {
        const group = this.getGroup(groupId);
        if (group) {
            const sessions = sessionManager.getSessionsBySchool(group.schoolName);
            group.sessionCount = sessions.length;
            group.updatedAt = new Date().toISOString();
            this.saveGroups();
            return group.sessionCount;
        }
        return 0;
    }

    // Method to search groups
    searchGroups(query) {
        if (!query || query.trim() === '') {
            return this.groups;
        }
        
        const lowerQuery = query.toLowerCase().trim();
        return this.groups.filter(group => 
            group.schoolName.toLowerCase().includes(lowerQuery) ||
            (group.campus && group.campus.toLowerCase().includes(lowerQuery)) ||
            group.adminName.toLowerCase().includes(lowerQuery) ||
            (group.adminPhone && group.adminPhone.includes(lowerQuery)) ||
            (group.schoolAddress && group.schoolAddress.toLowerCase().includes(lowerQuery))
        );
    }

    // FIXED: Ensure groups list renders properly
    renderGroupsList(container, onGroupView, onGroupEdit, onGroupDelete) {
        console.log('Rendering groups list:', this.groups.length, 'groups');
        
        container.innerHTML = '';
        
        if (this.groups.length === 0) {
            const emptyState = document.getElementById('emptyGroupsState');
            if (emptyState) emptyState.style.display = 'block';
            container.style.display = 'none';
            return;
        }
        
        const emptyState = document.getElementById('emptyGroupsState');
        if (emptyState) emptyState.style.display = 'none';
        container.style.display = 'grid';

        // Sort groups alphabetically by school name, then by campus
        const sortedGroups = this.groups.sort((a, b) => {
            const schoolCompare = a.schoolName.localeCompare(b.schoolName);
            if (schoolCompare !== 0) return schoolCompare;
            
            // If same school, sort by campus
            return (a.campus || '').localeCompare(b.campus || '');
        });

        sortedGroups.forEach(group => {
            const groupElement = this.createGroupElement(group, onGroupView, onGroupEdit, onGroupDelete);
            container.appendChild(groupElement);
        });
    }

    createGroupElement(group, onGroupView, onGroupEdit, onGroupDelete) {
        const swipeContainer = document.createElement('div');
        swipeContainer.className = 'swipe-container';
        swipeContainer.dataset.id = group.id;

        const swipeContent = document.createElement('div');
        swipeContent.className = 'swipe-content group-item';
        
        swipeContent.innerHTML = `
            <div class="group-header">
                <div>
                    <div class="group-title">${group.schoolName}</div>
                    ${group.campus ? `<div class="group-campus">${group.campus}</div>` : ''}
                    <div class="group-admin">Admin: ${group.adminName}</div>
                </div>
                <div class="group-stats">
                    <span>${group.sessionCount} sessions</span>
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
        `;

        const swipeActions = document.createElement('div');
        swipeActions.className = 'swipe-actions';
        swipeActions.innerHTML = `
            <button class="swipe-action edit" data-id="${group.id}">
                <span class="btn-icon">✏️</span>
                Edit
            </button>
            <button class="swipe-action delete" data-id="${group.id}">
                <span class="btn-icon">🗑️</span>
                Delete
            </button>
        `;

        swipeContainer.appendChild(swipeContent);
        swipeContainer.appendChild(swipeActions);

        // Improved swipe functionality
        this.setupSwipe(swipeContainer, swipeContent, swipeActions);
        
        // Click to view group (only if not swiping)
        if (onGroupView) {
            swipeContent.addEventListener('click', (e) => {
                if (!swipeContainer.classList.contains('swiped')) {
                    console.log('Group view clicked:', group.id);
                    onGroupView(group.id);
                }
            });
        }
        
        // Edit button event
        swipeActions.querySelector('.swipe-action.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Edit group clicked:', group.id);
            onGroupEdit(group.id);
        });

        // Delete button event
        swipeActions.querySelector('.swipe-action.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Delete group clicked:', group.id);
            onGroupDelete(group.id);
        });

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
            content.style.transition = 'none';
            actions.style.transition = 'none';
        };

        const handleTouchMove = (e) => {
            if (!isSwiping) return;
            
            currentX = e.touches[0].clientX;
            swipeDistance = startX - currentX;
            
            if (swipeDistance > 0) { // Swiping left
                e.preventDefault();
                const translateX = Math.min(swipeDistance, 160);
                content.style.transform = `translateX(-${translateX}px)`;
                actions.style.transform = `translateX(${translateX - 160}px)`;
            } else if (swipeDistance < -10) { // Swiping right - close actions
                container.classList.remove('swiped');
                content.style.transform = 'translateX(0)';
                actions.style.transform = 'translateX(100%)';
            }
        };

        const handleTouchEnd = () => {
            if (!isSwiping) return;
            
            content.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
            actions.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
            
            if (swipeDistance > 60) { // Swipe threshold
                container.classList.add('swiped');
                content.style.transform = 'translateX(-160px)';
                actions.style.transform = 'translateX(0)';
            } else {
                container.classList.remove('swiped');
                content.style.transform = 'translateX(0)';
                actions.style.transform = 'translateX(100%)';
            }
            
            isSwiping = false;
            swipeDistance = 0;
        };

        content.addEventListener('touchstart', handleTouchStart);
        content.addEventListener('touchmove', handleTouchMove);
        content.addEventListener('touchend', handleTouchEnd);

        // Close swipe when clicking outside
        document.addEventListener('touchstart', (e) => {
            if (!container.contains(e.target)) {
                container.classList.remove('swiped');
                content.style.transform = 'translateX(0)';
                actions.style.transform = 'translateX(100%)';
            }
        });
    }

    renderTrashList(sessionsContainer, groupsContainer, onRestore, onPermanentDelete) {
        const trashSessions = this.trash.filter(item => item.originalType === 'session');
        const trashGroups = this.trash.filter(item => item.originalType === 'group');

        console.log('Rendering trash list - sessions:', trashSessions.length, 'groups:', trashGroups.length);

        // Render deleted sessions
        sessionsContainer.innerHTML = '';
        if (trashSessions.length > 0) {
            const sessionsHeader = document.createElement('h4');
            sessionsHeader.textContent = 'Deleted Observations';
            sessionsHeader.style.marginBottom = 'var(--space-3)';
            sessionsHeader.style.color = 'var(--text-secondary)';
            sessionsContainer.appendChild(sessionsHeader);
            
            trashSessions.forEach(item => {
                const trashElement = this.createTrashElement(item, onRestore, onPermanentDelete);
                sessionsContainer.appendChild(trashElement);
            });
        }

        // Render deleted groups
        groupsContainer.innerHTML = '';
        if (trashGroups.length > 0) {
            const groupsHeader = document.createElement('h4');
            groupsHeader.textContent = 'Deleted School Groups';
            groupsHeader.style.marginBottom = 'var(--space-3)';
            groupsHeader.style.color = 'var(--text-secondary)';
            groupsContainer.appendChild(groupsHeader);
            
            trashGroups.forEach(item => {
                const trashElement = this.createTrashElement(item, onRestore, onPermanentDelete);
                groupsContainer.appendChild(trashElement);
            });
        }

        // Show/hide empty state
        const emptyState = document.getElementById('emptyTrashState');
        if (this.trash.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
        }
    }

    createTrashElement(item, onRestore, onPermanentDelete) {
        const element = document.createElement('div');
        element.className = 'trash-item';
        element.dataset.trashId = item.trashId;

        const title = item.originalType === 'session' 
            ? `${item.teacher} - ${item.school}` 
            : item.schoolName;

        const meta = item.originalType === 'session'
            ? `Unit ${item.unit} • Lesson ${item.lesson} • ${new Date(item.deletedAt).toLocaleDateString()}`
            : `Admin: ${item.adminName} • ${new Date(item.deletedAt).toLocaleDateString()}`;

        element.innerHTML = `
            <div class="trash-item-info">
                <div class="trash-item-title">${title}</div>
                <div class="trash-item-meta">${meta}</div>
            </div>
            <div class="trash-item-actions">
                <button class="btn btn-ghost btn-small restore-btn" data-trash-id="${item.trashId}">
                    <span class="btn-icon">↶</span>
                    Restore
                </button>
                <button class="btn btn-danger btn-small delete-permanent-btn" data-trash-id="${item.trashId}">
                    <span class="btn-icon">×</span>
                    Delete
                </button>
            </div>
        `;

        // Add event listeners with better error handling
        const restoreBtn = element.querySelector('.restore-btn');
        const deleteBtn = element.querySelector('.delete-permanent-btn');
        
        if (restoreBtn) {
            restoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Restore button clicked for trashId:', item.trashId);
                onRestore(item.trashId, item.originalType);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Delete button clicked for trashId:', item.trashId);
                onPermanentDelete(item.trashId, item.originalType);
            });
        }

        return element;
    }

    renderGroupSessions(container, groupId, onSessionSelect, onSessionEdit, onSessionDelete) {
        if (!container) return;
        
        container.innerHTML = '';
        
        const group = this.getGroup(groupId);
        if (!group) return;
        
        // For now, we'll show a message. In a real app, you'd filter sessions by group
        container.innerHTML = `
            <div class="empty-state">
                <h3>No observations for this group yet</h3>
                <p>Create the first observation for ${group.schoolName}</p>
            </div>
        `;
    }

    // Improved method to get schools for dropdown
    getSchoolsForDropdown() {
        const schools = {};
        this.groups.forEach(group => {
            if (group.schoolName && group.schoolName.trim() !== '') {
                if (!schools[group.schoolName]) {
                    schools[group.schoolName] = new Set();
                }
                if (group.campus && group.campus.trim() !== '') {
                    schools[group.schoolName].add(group.campus);
                }
            }
        });
        
        // Convert Sets to Arrays
        const result = {};
        Object.keys(schools).forEach(school => {
            result[school] = Array.from(schools[school]);
        });
        
        return result;
    }

    // Improved method to get campuses for a school
    getCampusesForSchool(schoolName) {
        const campuses = new Set();
        this.groups.forEach(group => {
            if (group.schoolName === schoolName && group.campus && group.campus.trim() !== '') {
                campuses.add(group.campus);
            }
        });
        return Array.from(campuses);
    }

    // New method to get group by school and campus
    getGroupBySchoolAndCampus(schoolName, campus) {
        return this.groups.find(group => 
            group.schoolName === schoolName && group.campus === campus
        );
    }

    loadGroups() {
        try {
            const saved = localStorage.getItem('teacher_notes_groups');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading groups:', error);
            return [];
        }
    }

    saveGroups() {
        try {
            localStorage.setItem('teacher_notes_groups', JSON.stringify(this.groups));
        } catch (error) {
            console.error('Error saving groups:', error);
        }
    }

    loadTrash() {
        try {
            const saved = localStorage.getItem('teacher_notes_trash');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading trash:', error);
            return [];
        }
    }

    saveTrash() {
        try {
            localStorage.setItem('teacher_notes_trash', JSON.stringify(this.trash));
        } catch (error) {
            console.error('Error saving trash:', error);
        }
    }

    getGroupsCount() {
        return this.groups.length;
    }

    getTrashCount() {
        return this.trash.length;
    }
}