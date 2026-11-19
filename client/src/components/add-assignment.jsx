import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssignmentForm from './assignment-form.jsx';
import { createAssignment } from '../api.js';

export default function AddAssignment() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Add Assignment · Assignment Tracker';
  }, []);

  return (
    <section className="panel">
      <p className="eyebrow">New</p>
      <h1>Add assignment</h1>
      <p className="lede">Give it a title, a course, and the day it is due.</p>
      <AssignmentForm
        submitLabel="Add assignment"
        onSubmit={async (values) => {
          await createAssignment(values);
          navigate('/assignments', { state: { notice: 'Assignment added.' } });
        }}
      />
    </section>
  );
}
