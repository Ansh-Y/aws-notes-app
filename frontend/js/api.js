// Replace this with your generated API Gateway URL after deploying
const API_BASE_URL = 'YOUR_API_GATEWAY_URL_HERE'; // e.g. https://xxxxxx.execute-api.us-east-1.amazonaws.com/Prod

class NotesApi {
  constructor() {
    this.baseUrl = API_BASE_URL;
    
    // Simulate latency/backend if API is not yet configured for smooth development
    this.isMockMod = API_BASE_URL === 'YOUR_API_GATEWAY_URL_HERE';
    if(this.isMockMod) {
      console.warn('API Base URL not configured. Using mock local data mode.');
      this.mockNotes = JSON.parse(localStorage.getItem('mockNotes')) || [];
    }
  }

  async getNotes() {
    if(this.isMockMod) {
      return new Promise(resolve => setTimeout(() => resolve([...this.mockNotes]), 500));
    }
    const res = await fetch(`${this.baseUrl}/notes`);
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  }

  async createNote(title, content, isPinned = false) {
    if(this.isMockMod) {
      return new Promise(resolve => {
        const newNote = {
          noteId: Date.now().toString(),
          title, content, isPinned,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.mockNotes.unshift(newNote);
        localStorage.setItem('mockNotes', JSON.stringify(this.mockNotes));
        setTimeout(() => resolve(newNote), 300);
      });
    }

    const res = await fetch(`${this.baseUrl}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, isPinned })
    });
    if (!res.ok) throw new Error('Failed to create note');
    return res.json();
  }

  async updateNote(id, data) {
    if(this.isMockMod) {
      return new Promise(resolve => {
        const idx = this.mockNotes.findIndex(n => n.noteId === id);
        if(idx >= 0) {
          this.mockNotes[idx] = { ...this.mockNotes[idx], ...data, updatedAt: new Date().toISOString() };
          localStorage.setItem('mockNotes', JSON.stringify(this.mockNotes));
          setTimeout(() => resolve(this.mockNotes[idx]), 300);
        } else {
          throw new Error('Not found');
        }
      });
    }

    const res = await fetch(`${this.baseUrl}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update note');
    return res.json();
  }

  async deleteNote(id) {
    if(this.isMockMod) {
      return new Promise(resolve => {
        this.mockNotes = this.mockNotes.filter(n => n.noteId !== id);
        localStorage.setItem('mockNotes', JSON.stringify(this.mockNotes));
        setTimeout(() => resolve({ success: true }), 300);
      });
    }

    const res = await fetch(`${this.baseUrl}/notes/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete note');
    return res.json();
  }
}

const api = new NotesApi();
