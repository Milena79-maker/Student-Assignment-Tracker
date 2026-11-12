import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, ClipboardList, GraduationCap, LayoutDashboard, PlusCircle, Pencil, Trash2, ArrowRight, Search } from 'lucide-react';

const empty = { title: '', course: '', description: '', dueDate: '', priority: 'Medium' };
async function api(path, options) {
  const res = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}
function prettyDate(date) {
  if (!date) return '';
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function isOverdue(item) { return !item.completed && item.dueDate < new Date().toLocaleDateString('en-CA'); }

export default function App() {
  const [page, setPage] = useState('home');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setItems(await api('/assignments')); setError(''); }
    catch (err) { setError(`${err.message}. Check that the backend and MongoDB are running.`); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const stats = useMemo(() => ({ total: items.length, completed: items.filter(x => x.completed).length, pending: items.filter(x => !x.completed).length, overdue: items.filter(isOverdue).length }), [items]);
  const visible = useMemo(() => items.filter(x => {
    const matchesFilter = filter === 'All' || (filter === 'Completed' && x.completed) || (filter === 'Pending' && !x.completed) || (filter === 'Overdue' && isOverdue(x));
    return matchesFilter && `${x.title} ${x.course} ${x.description}`.toLowerCase().includes(search.toLowerCase());
  }), [items, filter, search]);

  function navigate(to) { setPage(to); setNotice(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function addNew() { setEditing(null); setForm(empty); navigate('add'); }
  function startEdit(item) { setEditing(item._id); setForm({ title: item.title, course: item.course, description: item.description || '', dueDate: item.dueDate, priority: item.priority }); navigate('add'); }
  async function submit(e) {
    e.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await api(editing ? `/assignments/${editing}` : '/assignments', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
      await refresh(); setNotice(editing ? 'Assignment updated successfully!' : 'Assignment added successfully!'); setEditing(null); setForm(empty); setPage('assignments');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function toggle(item) {
    try { await api(`/assignments/${item._id}/complete`, { method: 'PATCH', body: JSON.stringify({ completed: !item.completed }) }); await refresh(); setNotice(item.completed ? 'Assignment marked pending.' : 'Great job! Assignment completed.'); }
    catch (err) { setError(err.message); }
  }
  async function remove(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try { await api(`/assignments/${item._id}`, { method: 'DELETE' }); await refresh(); setNotice('Assignment deleted successfully.'); }
    catch (err) { setError(err.message); }
  }
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><GraduationCap size={28}/></div><div><strong>Student Tracker</strong><small>Stay on top of it all</small></div></div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        <button className={page === 'home' ? 'nav active' : 'nav'} onClick={() => navigate('home')}><LayoutDashboard size={19}/> Home</button>
        <button className={page === 'assignments' ? 'nav active' : 'nav'} onClick={() => navigate('assignments')}><ClipboardList size={19}/> Assignments</button>
        <button className={page === 'add' ? 'nav active' : 'nav'} onClick={addNew}><PlusCircle size={19}/> Add Assignment</button>
      </nav>
      <div className="sidebar-footer"><BookOpen size={22}/><div><strong>One step at a time</strong><span>Plan • Track • Complete</span></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><span>Student Assignment Tracker</span><span className="top-chip"><CalendarDays size={15}/> {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span></header>
      <div className="content">
        {error && <div className="alert error" role="alert">{error} <button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
        {notice && <div className="alert success" role="status">{notice} <button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
        {page === 'home' && <>
          <section className="hero"><div><span className="eyebrow">YOUR STUDENT DASHBOARD</span><h1>Make every deadline<br/><em>feel manageable.</em></h1><p>Organize your coursework, track progress, and celebrate every assignment you finish.</p><button className="primary" onClick={addNew}>+ Add Assignment <ArrowRight size={17}/></button></div><div className="hero-art"><GraduationCap size={96} strokeWidth={1.2}/><div className="art-check"><CheckCircle2 size={30}/></div></div></section>
          <div className="section-heading"><div><h2>Overview</h2><p>Your coursework at a glance</p></div></div>
          <div className="stats"><Stat label="Total Assignments" value={stats.total} icon={<ClipboardList/>} tone="purple"/><Stat label="In Progress" value={stats.pending} icon={<BookOpen/>} tone="blue"/><Stat label="Completed" value={stats.completed} icon={<CheckCircle2/>} tone="green"/><Stat label="Overdue" value={stats.overdue} icon={<CalendarDays/>} tone="orange"/></div>
          <div className="section-heading"><div><h2>Upcoming assignments</h2><p>Focus on what comes next</p></div><button className="text-button" onClick={() => navigate('assignments')}>View all <ArrowRight size={16}/></button></div>
          {loading ? <p>Loading assignments...</p> : items.filter(x => !x.completed).length ? <div className="cards">{items.filter(x => !x.completed).slice(0, 3).map(x => <AssignmentCard key={x._id} item={x} toggle={toggle} edit={startEdit} remove={remove}/>)}</div> : <Empty addNew={addNew}/>}
        </>}
        {page === 'assignments' && <><div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>My Assignments</h1><p>Everything you need to stay organized.</p></div><button className="primary" onClick={addNew}>+ Add Assignment</button></div>
          <div className="toolbar"><div className="search"><Search size={18}/><input aria-label="Search assignments" placeholder="Search by title or course..." value={search} onChange={e => setSearch(e.target.value)}/></div><div className="filters">{['All','Pending','Completed','Overdue'].map(f => <button key={f} className={filter === f ? 'filter selected' : 'filter'} onClick={() => setFilter(f)}>{f}</button>)}</div></div>
          {loading ? <p>Loading assignments...</p> : visible.length ? <div className="cards">{visible.map(x => <AssignmentCard key={x._id} item={x} toggle={toggle} edit={startEdit} remove={remove}/>)}</div> : <Empty addNew={addNew} text={items.length ? 'No assignments match your filters.' : undefined}/>}
        </>}
        {page === 'add' && <><div className="page-heading"><div><span className="eyebrow">STAY ORGANIZED</span><h1>{editing ? 'Edit Assignment' : 'Add Assignment'}</h1><p>{editing ? 'Update the details of your coursework.' : 'Add your next task and stay ahead of the deadline.'}</p></div></div>
          <form className="assignment-form" onSubmit={submit}><div className="form-header"><ClipboardList size={22}/><h2>Assignment details</h2></div><div className="form-grid"><label className="full">Assignment Title <span>*</span><input required maxLength="120" placeholder="e.g. React portfolio project" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/></label><label>Course <span>*</span><input required maxLength="80" placeholder="e.g. COMP229" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}/></label><label>Due Date <span>*</span><input required type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}/></label><label className="full">Priority <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label><label className="full">Description <span className="optional">(optional)</span><textarea rows="5" maxLength="1000" placeholder="What do you need to do?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label></div><div className="form-actions"><button type="button" className="secondary" onClick={() => navigate('assignments')}>Cancel</button><button className="primary" disabled={saving} type="submit">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Assignment'}</button></div></form>
        </>}
      </div>
    </main>
  </div>;
}
function Stat({ label, value, icon, tone }) { return <div className="stat"><div className={`stat-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>; }
function Empty({ addNew, text = 'No assignments yet. Add your first assignment to get started!' }) { return <div className="empty"><ClipboardList size={42}/><h3>Nothing here yet</h3><p>{text}</p><button className="primary" onClick={addNew}>+ Add Assignment</button></div>; }
function AssignmentCard({ item, toggle, edit, remove }) { return <article className={`assignment-card ${item.completed ? 'done' : ''}`}><div className="card-top"><span className={`priority ${item.priority.toLowerCase()}`}>{item.priority} priority</span><span className={`status ${item.completed ? 'complete' : isOverdue(item) ? 'late' : ''}`}>{item.completed ? 'Completed' : isOverdue(item) ? 'Overdue' : 'Pending'}</span></div><h3>{item.title}</h3><p className="course">{item.course}</p>{item.description && <p className="description">{item.description}</p>}<div className="card-bottom"><span><CalendarDays size={16}/> {prettyDate(item.dueDate)}</span><div className="card-actions"><button title={item.completed ? 'Mark pending' : 'Mark complete'} aria-label={item.completed ? 'Mark pending' : 'Mark complete'} onClick={() => toggle(item)}><CheckCircle2 size={18}/></button><button title="Edit assignment" aria-label="Edit assignment" onClick={() => edit(item)}><Pencil size={17}/></button><button title="Delete assignment" aria-label="Delete assignment" onClick={() => remove(item)}><Trash2 size={17}/></button></div></div></article>; }
