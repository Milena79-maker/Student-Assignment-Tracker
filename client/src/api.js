async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  let response
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Cannot reach the server. Check that the API is running.')
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.');
  }
  return data;
}

export function getAssignments() {
  return request('/api/assignments');
}

export function createAssignment(body) {
  return request('/api/assignments', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAssignment(id, body) {
  return request(`/api/assignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function setCompleted(id, completed) {
  return request(`/api/assignments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}

export function deleteAssignment(id) {
  return request(`/api/assignments/${id}`, { method: 'DELETE' })
}

export function getUsers() {
  return request('/api/users')
}

export function signUp(body) {
  return request('/api/users', { method: 'POST', body: JSON.stringify(body) })
}

export function signIn(body) {
  return request('/api/users/login', { method: 'POST', body: JSON.stringify(body) })
}

export function getMe() {
  return request('/api/users/me')
}

export function updateMe(body) {
  return request('/api/users/me', { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteMe() {
  return request('/api/users/me', { method: 'DELETE' })
}
