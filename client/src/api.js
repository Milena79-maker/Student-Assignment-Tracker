async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the app is running.');
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
  return request(`/api/assignments/${id}`, { method: 'DELETE' });
}
