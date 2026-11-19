import { useState } from 'react';
import { toDateInput } from '../dates.js';

const EMPTY = {
  title: '',
  course: '',
  dueDate: '',
  priority: 'medium',
  description: '',
};

export default function AssignmentForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => ({
    ...EMPTY,
    ...initial,
    dueDate: toDateInput(initial?.dueDate),
    priority: initial?.priority || 'medium',
    description: initial?.description || '',
  }));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const title = values.title.trim();
    const course = values.course.trim();
    if (!title || !course || !values.dueDate) {
      setError('Title, course, and due date are required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        course,
        dueDate: values.dueDate,
        priority: values.priority,
        description: values.description.trim(),
      });
    } catch (err) {
      setError(err.message || 'Could not save the assignment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <p className="banner error" role="alert">{error}</p>}
      <div className="fields">
        <label>
          Title
          <input
            name="title"
            value={values.title}
            onChange={update}
            maxLength={120}
            required
          />
        </label>
        <label>
          Course
          <input
            name="course"
            value={values.course}
            onChange={update}
            maxLength={80}
            required
          />
        </label>
        <label>
          Due date
          <input
            name="dueDate"
            type="date"
            value={values.dueDate}
            onChange={update}
            required
          />
        </label>
        <label>
          Priority
          <select name="priority" value={values.priority} onChange={update}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="field-wide">
          Description
          <textarea
            name="description"
            value={values.description}
            onChange={update}
            maxLength={2000}
            rows={4}
          />
        </label>
      </div>
      <div className="form-actions">
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button className="button secondary" type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
