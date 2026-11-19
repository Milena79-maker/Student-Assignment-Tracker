import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { deleteAssignment, getAssignments, setCompleted, updateAssignment } from '../api.js';
import { useAuth } from '../auth.jsx';
import EditDialog from './edit-dialog.jsx';
import { STATUS_LABEL, dueStatus, formatDue } from '../dates.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
];

export default function Assignments() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    document.title = 'Assignments · Assignment Tracker';
  }, []);

  useEffect(() => {
    if (location.state?.notice) {
      navigate('.', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  async function load() {
    const data = await getAssignments();
    setAssignments(data);
  }

  useEffect(() => {
    let active = true;
    getAssignments()
      .then((data) => {
        if (active) setAssignments(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setAssignments([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!assignments || !location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [assignments, location.hash]);

  async function toggle(assignment) {
    setBusyId(assignment._id);
    setError('');
    try {
      await setCompleted(assignment._id, !assignment.completed);
      setNotice(assignment.completed ? 'Marked as not done.' : 'Marked complete.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit(values) {
    await updateAssignment(editing._id, values);
    setEditing(null);
    setNotice('Assignment updated.');
    await load();
  }

  async function confirmDelete() {
    const target = pendingDelete;
    setBusyId(target._id);
    setError('');
    try {
      await deleteAssignment(target._id);
      setPendingDelete(null);
      setNotice('Assignment deleted.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (assignments === null) {
    return <p className="status-line">Loading assignments…</p>;
  }

  const visible = assignments.filter((assignment) => {
    if (filter === 'pending') return !assignment.completed;
    if (filter === 'completed') return assignment.completed;
    return true;
  });

  const counts = {
    all: assignments.length,
    pending: assignments.filter((assignment) => !assignment.completed).length,
    completed: assignments.filter((assignment) => assignment.completed).length,
  };

  return (
    <section>
      <p className="eyebrow">Your list</p>
      <div className="section-head">
        <h1>Assignments</h1>
        <Link className="button" to={user ? '/assignments/new' : '/sign-in'}>
          {user ? 'Add assignment' : 'Sign in to add'}
        </Link>
      </div>

      {notice && (
        <p className="banner ok" role="status">
          {notice}
          <button type="button" onClick={() => setNotice('')}>Dismiss</button>
        </p>
      )}
      {error && (
        <p className="banner error" role="alert">
          {error}
          <button
            type="button"
            onClick={() => load().catch((err) => setError(err.message))}
          >
            Try again
          </button>
        </p>
      )}

      <div className="filters" role="group" aria-label="Filter assignments">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="button secondary"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label} ({counts[item.id]})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>No assignments here yet.</p>
          <p><Link to={user ? '/assignments/new' : '/sign-in'}>Add an assignment</Link></p>
        </div>
      ) : (
        <div className="list">
          {visible.map((assignment) => {
            const status = dueStatus(assignment);
            return (
              <article
                key={assignment._id}
                id={`assignment-${assignment._id}`}
                className={`card ${status}`}
              >
                <div className="card-top">
                  <div>
                    <h2 className="title">{assignment.title}</h2>
                    <p className="meta">
                      <span>{assignment.course}</span>
                      <span>Due {formatDue(assignment.dueDate)}</span>
                    </p>
                  </div>
                  <div className="pills">
                    <span className={`pill ${assignment.priority}`}>{assignment.priority}</span>
                    <span className={`pill ${status}`}>{STATUS_LABEL[status]}</span>
                  </div>
                </div>
                {assignment.description && <p className="description">{assignment.description}</p>}
                {user ? (
                <div className="actions">
                  <button
                    type="button"
                    className="button"
                    disabled={busyId === assignment._id}
                    onClick={() => toggle(assignment)}
                  >
                    {assignment.completed ? 'Mark incomplete' : 'Mark complete'}
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      setPendingDelete(null);
                      setEditing(assignment);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button danger"
                    onClick={() => {
                      setEditing(null);
                      setPendingDelete(assignment);
                    }}
                  >
                    Delete
                  </button>
                </div>
                ) : (
                  <p className="meta"><Link to="/sign-in">Sign in to update this assignment</Link></p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <EditDialog
          assignment={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}

      {pendingDelete && (
        <div className="modal-backdrop" onClick={() => setPendingDelete(null)}>
          <div
            className="modal confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-title">Delete assignment</h2>
            <p>Delete “{pendingDelete.title}”? This cannot be undone.</p>
            <div className="form-actions">
              <button
                type="button"
                className="button danger solid"
                disabled={busyId === pendingDelete._id}
                onClick={confirmDelete}
              >
                {busyId === pendingDelete._id ? 'Deleting…' : 'Delete'}
              </button>
              <button type="button" className="button secondary" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
