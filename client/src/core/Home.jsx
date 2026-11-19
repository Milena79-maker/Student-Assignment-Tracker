import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssignments } from '../api.js';
import { STATUS_LABEL, dueStatus, formatDue } from '../dates.js';

export default function Home() {
  const [assignments, setAssignments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Home · Assignment Tracker';
  }, []);

  useEffect(() => {
    let active = true;
    getAssignments()
      .then((data) => {
        if (active) setAssignments(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const pending = (assignments || []).filter((assignment) => !assignment.completed);
  const completed = (assignments || []).filter((assignment) => assignment.completed);
  const overdue = pending.filter((assignment) => dueStatus(assignment) === 'overdue');
  const upcoming = [...pending].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  ).slice(0, 5);

  return (
    <div>
      <section className="hero">
        <p className="eyebrow">Coursework</p>
        <h1>Keep every assignment in one place.</h1>
        <p className="lede">
          Add work, set a due date, and mark it complete when you finish.
        </p>
        <div className="hero-actions">
          <Link className="button" to="/assignments">View assignments</Link>
          <Link className="button secondary" to="/assignments/new">Add assignment</Link>
        </div>
      </section>

      {error && <p className="banner error" role="alert">{error}</p>}
      {assignments === null && !error && <p className="status-line">Loading assignments…</p>}

      {assignments && (
        <>
          <section className="stats" aria-label="Assignment totals">
            <article className="stat">
              <strong>{assignments.length}</strong>
              <span>Total</span>
            </article>
            <article className="stat">
              <strong>{pending.length}</strong>
              <span>Pending</span>
            </article>
            <article className="stat">
              <strong>{completed.length}</strong>
              <span>Completed</span>
            </article>
            <article className={`stat ${overdue.length ? 'alert' : ''}`}>
              <strong>{overdue.length}</strong>
              <span>Overdue</span>
            </article>
          </section>

          <section>
            <div className="section-head">
              <h2>Coming up</h2>
              <Link to="/assignments">See all</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="empty">
                <p>Nothing is waiting. You are caught up, or you have not added work yet.</p>
              </div>
            ) : (
              <div className="upcoming">
                {upcoming.map((assignment) => {
                  const status = dueStatus(assignment);
                  return (
                    <Link key={assignment._id} to={`/assignments#assignment-${assignment._id}`}>
                      <span className="stack">
                        <strong>{assignment.title}</strong>
                        <span className="quiet">{assignment.course}</span>
                      </span>
                      <span className="stack end">
                        <span className={`pill ${status}`}>{STATUS_LABEL[status]}</span>
                        <span className="quiet">{formatDue(assignment.dueDate)}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
