// API utility functions for making authenticated requests

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try sessionStorage first (tab-specific)
  const fromSession = sessionStorage.getItem('token');
  if (fromSession) return fromSession;
  
  // Try localStorage
  const fromLocal = localStorage.getItem('token');
  if (fromLocal) return fromLocal;
  
  // Try cookie (works after full page reload on production)
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') return value;
  }
  
  return null;
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

function getAuthHeadersForFormData() {
  const token = getToken();
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Posts API
export const postsAPI = {
  async fetchPosts(limit = 20, skip = 0) {
    const res = await fetch(`/api/posts?limit=${limit}&skip=${skip}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createPost(text: string, mediaUrl?: string, mediaType?: 'image' | 'video') {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, mediaUrl, mediaType }),
    });
    return res.json();
  },

  async toggleLike(postId: string) {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async addComment(postId: string, text: string) {
    const res = await fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  async getComments(postId: string) {
    const res = await fetch(`/api/posts/${postId}/comment`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async deletePost(postId: string) {
    const res = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};

// Messages API
export const messagesAPI = {
  async getConversations() {
    const res = await fetch('/api/messages/conversations', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getMessages(userId: string) {
    const res = await fetch(`/api/messages?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async sendMessage(receiverId: string, receiverName: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'file', fileName?: string, fileSize?: number) {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId, receiverName, text, mediaUrl, mediaType, fileName, fileSize }),
    });
    return res.json();
  },
};

// Users API
export const usersAPI = {
  async getUsers() {
    const res = await fetch('/api/users', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async sendConnectionRequest(userId: string) {
    const res = await fetch(`/api/users/${userId}/connect`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};

// Upload API
export const uploadAPI = {
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: getAuthHeadersForFormData(),
      body: formData,
    });
    return res.json();
  },
};

// Presence API
export const presenceAPI = {
  async sendHeartbeat() {
    const res = await fetch('/api/presence', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: 'heartbeat' }),
    });
    return res.json();
  },

  async sendTyping(conversationId: string) {
    const res = await fetch('/api/presence', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: 'typing', conversationId }),
    });
    return res.json();
  },

  async stopTyping() {
    const res = await fetch('/api/presence', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: 'stop-typing' }),
    });
    return res.json();
  },

  async getPresence(conversationId?: string) {
    const url = conversationId 
      ? `/api/presence?conversationId=${conversationId}`
      : '/api/presence';
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
