class GroupsManager {
   constructor() {
    this.groups = this.loadGroups();
    this.trash = this.loadTrash();
    this.selectedGroups = new Set();
    
    console.log('=== DEBUG: GroupsManager Constructor ===');
    console.log('Loaded groups:', this.groups.length);
    console.log('Loaded trash:', this.trash.length);
    
    // Pre-create schools if none exist
    if (this.groups.length === 0) {
        console.log('No groups found, pre-creating schools...');
        this.preCreateSchools();
        this.saveGroups(); // Ensure they're saved
        console.log('After pre-creation:', this.groups.length);
    } else {
        console.log('Using existing groups from storage');
    }
    
    console.log('Final groups count:', this.groups.length);
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
    console.log('GroupsManager: Updating group', groupId, 'with:', updates);
    
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex >= 0) {
        // FIXED: Preserve existing properties and only update provided ones
        this.groups[groupIndex] = {
            ...this.groups[groupIndex], // Keep existing data
            ...updates, // Apply updates
            updatedAt: new Date().toISOString()
        };
        
        console.log('Group updated successfully:', this.groups[groupIndex]);
        this.saveGroups();
        return this.groups[groupIndex];
    }
    
    console.error('Group not found for update:', groupId);
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
            
            // Remove from selected groups if it was selected
            this.selectedGroups.delete(groupId);
            this.updateGroupsBulkActionsUI();
            
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
        console.log(`Moved ${type} to trash:`, trashItem);
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
        console.log('GroupsManager: Permanently deleting trash item:', trashId);
        const trashIndex = this.trash.findIndex(t => t.trashId === trashId);
        if (trashIndex >= 0) {
            this.trash.splice(trashIndex, 1);
            this.saveTrash();
            console.log('GroupsManager: Item permanently deleted from trash');
            return true;
        }
        console.log('GroupsManager: Item not found in trash for permanent deletion');
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

    // FIXED: Groups list with checkboxes
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

        // FIXED: Update bulk actions UI after rendering
        this.updateGroupsBulkActionsUI();
    }

    createGroupElement(group, onGroupView, onGroupEdit, onGroupDelete) {
        const groupElement = document.createElement('div');
        groupElement.className = 'group-item';
        groupElement.dataset.id = group.id;

        // Check if this group is selected
        const isSelected = this.selectedGroups.has(group.id);
        if (isSelected) {
            groupElement.classList.add('selected');
        }

        groupElement.innerHTML = `
            <div class="group-item-checkbox">
                <input type="checkbox" class="group-checkbox" data-group-id="${group.id}" ${isSelected ? 'checked' : ''}>
            </div>
            <div class="group-item-content">
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

        // Checkbox event
        const checkbox = groupElement.querySelector('.group-checkbox');
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            this.toggleGroupSelection(group.id, checkbox.checked);
            groupElement.classList.toggle('selected', checkbox.checked);
        });

        // Add event listeners for action buttons
        const viewBtn = groupElement.querySelector('.group-view-btn');
        const editBtn = groupElement.querySelector('.group-edit-btn');
        const deleteBtn = groupElement.querySelector('.group-delete-btn');
        
        if (viewBtn && onGroupView) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onGroupView(group.id);
            });
        }
        
        if (editBtn && onGroupEdit) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onGroupEdit(group.id);
            });
        }

        if (deleteBtn && onGroupDelete) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onGroupDelete(group.id);
            });
        }

        return groupElement;
    }

    // Selection management for bulk operations
    toggleGroupSelection(groupId, isSelected) {
        console.log('Toggle group selection:', groupId, isSelected);
        if (isSelected) {
            this.selectedGroups.add(groupId);
        } else {
            this.selectedGroups.delete(groupId);
        }
        this.updateGroupsBulkActionsUI();
    }

    selectAllGroups() {
        console.log('Selecting all groups');
        this.groups.forEach(group => {
            this.selectedGroups.add(group.id);
        });
        this.updateGroupCheckboxes();
        this.updateGroupsBulkActionsUI();
    }

    deselectAllGroups() {
        console.log('Deselecting all groups');
        this.selectedGroups.clear();
        this.updateGroupCheckboxes();
        this.updateGroupsBulkActionsUI();
    }

    updateGroupCheckboxes() {
        document.querySelectorAll('.group-checkbox').forEach(checkbox => {
            const groupId = checkbox.dataset.groupId;
            checkbox.checked = this.selectedGroups.has(groupId);
            checkbox.closest('.group-item')?.classList.toggle('selected', checkbox.checked);
        });
    }

    updateGroupsBulkActionsUI() {
        const selectedCount = this.selectedGroups.size;
        const bulkActionsToolbar = document.getElementById('groupsBulkActionsToolbar');
        const selectedCountElement = document.getElementById('groupsSelectedCount');
        const bulkEditBtn = document.getElementById('groupsBulkEditBtn');
        const bulkDeleteBtn = document.getElementById('groupsBulkDeleteBtn');

        console.log('Updating groups bulk actions UI. Selected count:', selectedCount);

        if (bulkActionsToolbar && selectedCountElement) {
            if (selectedCount > 0) {
                bulkActionsToolbar.style.display = 'flex';
                selectedCountElement.textContent = `${selectedCount} selected`;
                
                // Enable/disable edit button based on selection count
                if (bulkEditBtn) {
                    bulkEditBtn.disabled = selectedCount !== 1;
                }

                // Enable delete button
                if (bulkDeleteBtn) {
                    bulkDeleteBtn.disabled = false;
                }
            } else {
                bulkActionsToolbar.style.display = 'none';
            }
        }
    }

    getSelectedGroups() {
        return Array.from(this.selectedGroups).map(groupId => 
            this.groups.find(g => g.id === groupId)
        ).filter(Boolean);
    }

    deleteSelectedGroups() {
        console.log('Deleting selected groups. Count:', this.selectedGroups.size);
        const selectedGroups = this.getSelectedGroups();
        console.log('Selected groups to delete:', selectedGroups);
        
        selectedGroups.forEach(group => {
            console.log('Deleting group:', group.schoolName);
            this.deleteGroup(group.id, true);
        });
        
        const deletedCount = selectedGroups.length;
        this.selectedGroups.clear();
        this.updateGroupsBulkActionsUI();
        
        console.log('Deleted groups count:', deletedCount);
        return deletedCount;
    }

    // FIXED: Trash list rendering
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
            <div class="trash-item-checkbox">
                <input type="checkbox" class="trash-checkbox" data-trash-id="${item.trashId}">
            </div>
            <div class="trash-item-content">
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
            </div>
        `;

        // Add event listeners with better error handling
        const restoreBtn = element.querySelector('.restore-btn');
        const deleteBtn = element.querySelector('.delete-permanent-btn');
        
        if (restoreBtn) {
            restoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Restore button clicked for trashId:', item.trashId);
                if (onRestore) {
                    onRestore(item.trashId, item.originalType);
                }
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Delete button clicked for trashId:', item.trashId);
                if (onPermanentDelete) {
                    onPermanentDelete(item.trashId, item.originalType);
                }
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

    saveGroups() {
    try {
        console.log('=== DEBUG: Saving Groups ===');
        console.log('Groups to save:', this.groups.length);
        console.log('Groups data:', this.groups);
        
        localStorage.setItem('teacher_notes_groups', JSON.stringify(this.groups));
        console.log('Groups saved successfully');
    } catch (error) {
        console.error('Error saving groups:', error);
    }
}

loadGroups() {
    try {
        const saved = localStorage.getItem('teacher_notes_groups');
        console.log('=== DEBUG: Loading Groups ===');
        console.log('Raw saved data:', saved);
        
        const groups = saved ? JSON.parse(saved) : [];
        console.log('Parsed groups:', groups.length);
        
        return groups;
    } catch (error) {
        console.error('Error loading groups:', error);
        return [];
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