document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const newNoteBtn = document.getElementById('newNoteBtn');
  
  const pinnedSection = document.getElementById('pinnedSection');
  const allSection = document.getElementById('allSection');
  const pinnedNotesGrid = document.getElementById('pinnedNotesGrid');
  const allNotesGrid = document.getElementById('allNotesGrid');
  const emptyState = document.getElementById('emptyState');
  
  // Modal Elements
  const noteModal = document.getElementById('noteModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const deleteNoteBtn = document.getElementById('deleteNoteBtn');
  const pinNoteBtn = document.getElementById('pinNoteBtn');
  const validationError = document.getElementById('validationError');
  const saveStatus = document.getElementById('saveStatus');
  const loadingOverlay = document.getElementById('loadingOverlay');

  // State
  let notes = [];
  let currentEditingId = null;
  let currentIsPinned = false;

  // Initialize
  async function init() {
    try {
      notes = await api.getNotes();
      renderNotes();
      setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.classList.add('hidden'), 500);
      }, 500);
    } catch (error) {
      console.error(error);
      alert('Failed to load notes. Check the console for details.');
      loadingOverlay.classList.add('hidden');
    }
  }

  // Format date
  function formatDate(isoString) {
    const date = new Date(isoString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  // Render Notes
  function renderNotes(filterText = '') {
    pinnedNotesGrid.innerHTML = '';
    allNotesGrid.innerHTML = '';

    const lowerFilter = filterText.toLowerCase();
    
    // Sort logic (newest updated first)
    const sortedNotes = notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const visibleNotes = sortedNotes.filter(n => 
      n.title.toLowerCase().includes(lowerFilter) || 
      n.content.toLowerCase().includes(lowerFilter)
    );

    const pinnedNotes = visibleNotes.filter(n => n.isPinned);
    const unpinnedNotes = visibleNotes.filter(n => !n.isPinned);

    if (visibleNotes.length === 0) {
      emptyState.classList.remove('hidden');
      pinnedSection.classList.add('hidden');
      allSection.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    
    if (pinnedNotes.length > 0) {
      pinnedSection.classList.remove('hidden');
      pinnedNotes.forEach(note => pinnedNotesGrid.appendChild(createNoteCard(note)));
    } else {
      pinnedSection.classList.add('hidden');
    }

    if (unpinnedNotes.length > 0) {
      allSection.classList.remove('hidden');
      unpinnedNotes.forEach(note => allNotesGrid.appendChild(createNoteCard(note)));
    } else {
      allSection.classList.add('hidden');
    }
  }

  function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = `note-card ${note.isPinned ? 'pinned' : ''}`;
    card.onclick = () => openModal(note);

    card.innerHTML = `
      <h3 class="note-title">${escapeHTML(note.title)}</h3>
      <p class="note-preview">${escapeHTML(note.content)}</p>
      <div class="note-footer">
        <span>${formatDate(note.createdAt)}</span>
        ${note.isPinned ? '<i class="fa-solid fa-thumbtack pinned-icon"></i>' : ''}
      </div>
    `;

    return card;
  }

  // Modal Management
  function openModal(note = null) {
    validationError.classList.add('hidden');
    saveStatus.textContent = '';
    
    if (note) {
      currentEditingId = note.noteId;
      modalTitle.value = note.title;
      modalContent.value = note.content;
      currentIsPinned = note.isPinned;
      deleteNoteBtn.classList.remove('hidden');
    } else {
      currentEditingId = null;
      modalTitle.value = '';
      modalContent.value = '';
      currentIsPinned = false;
      deleteNoteBtn.classList.add('hidden');
    }

    updatePinButtonUi();
    noteModal.classList.remove('hidden');
    setTimeout(() => modalTitle.focus(), 100);
  }

  function closeModal() {
    noteModal.classList.add('hidden');
    currentEditingId = null;
  }

  function updatePinButtonUi() {
    if (currentIsPinned) {
      pinNoteBtn.classList.add('active');
    } else {
      pinNoteBtn.classList.remove('active');
    }
  }

  // Save functionality
  async function saveNote() {
    const title = modalTitle.value.trim();
    const content = modalContent.value.trim();

    if (!title || !content) {
      validationError.classList.remove('hidden');
      return;
    }
    
    validationError.classList.add('hidden');
    saveNoteBtn.disabled = true;
    saveNoteBtn.textContent = 'Saving...';

    try {
      if (currentEditingId) {
        const updated = await api.updateNote(currentEditingId, { title, content, isPinned: currentIsPinned });
        notes = notes.map(n => n.noteId === currentEditingId ? { ...n, title, content, isPinned: currentIsPinned, updatedAt: new Date().toISOString() } : n);
      } else {
        const created = await api.createNote(title, content, currentIsPinned);
        notes.unshift(created);
      }
      renderNotes(searchInput.value);
      closeModal();
    } catch (err) {
      console.error(err);
      saveStatus.textContent = 'Failed to save.';
      saveStatus.style.color = 'var(--danger-color)';
    } finally {
      saveNoteBtn.disabled = false;
      saveNoteBtn.textContent = 'Save';
    }
  }

  // Delete functionality
  async function deleteNote() {
    if(!currentEditingId) return;
    if(!confirm('Are you sure you want to delete this note?')) return;

    deleteNoteBtn.disabled = true;
    try {
      await api.deleteNote(currentEditingId);
      notes = notes.filter(n => n.noteId !== currentEditingId);
      renderNotes(searchInput.value);
      closeModal();
    } catch (err) {
      console.error(err);
      saveStatus.textContent = 'Failed to delete.';
    } finally {
      deleteNoteBtn.disabled = false;
    }
  }

  // Event Listeners
  newNoteBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  saveNoteBtn.addEventListener('click', saveNote);
  deleteNoteBtn.addEventListener('click', deleteNote);
  
  pinNoteBtn.addEventListener('click', () => {
    currentIsPinned = !currentIsPinned;
    updatePinButtonUi();
  });

  searchInput.addEventListener('input', (e) => {
    renderNotes(e.target.value);
  });

  // Close modal on escape or background click
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !noteModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) {
      closeModal();
    }
  });

  // Utility to prevent XSS
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }

  // Boot
  init();
});
