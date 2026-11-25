import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, ClipboardList, GraduationCap, LayoutDashboard, PlusCircle, Pencil, Trash2, ArrowRight, Search, Users, UserRound, LogIn, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './auth.jsx';

const empty = { title: '', course: '', description: '', dueDate: '', priority: 'Medium' };
const emptyAccount = { name: '', email: '', password: '' };

async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function dueKey(date) {
  const text = String(date || '');
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return '';
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
}

function prettyDate(date) {
  const key = dueKey(date);
  if (!key) return '';
  return new Date(`${key}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(item) {
  const key = dueKey(item.dueDate);
  return !item.completed && Boolean(key) && key < new Date().toLocaleDateString('en-CA');
}

function priorityLabel(value) {
  const text = String(value || 'medium').toLowerCase();
  if (text === 'high') return 'High';
  if (text === 'low') return 'Low';
  return 'Medium';
}

export default function App() {
  return (
    <AuthProvider>
      <Tracker />
    </AuthProvider>
  );
}

function Tracker() {
  const { user, signIn, signOut, replaceUser } = useAuth();
  const [page, setPage] = useState('home');
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersReady, setUsersReady] = useState(false);
  const [form, setForm] = useState(empty);
  const [account, setAccount] = useState(emptyAccount);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due-asc');
  const resetFilters = () => {
  setFilter('All');
  setSearch('');
  setPriorityFilter('All');
  setSortBy('due-asc');
  };
  const hasActiveFilters =
  filter !== 'All' ||
  search.trim() !== '' ||
  priorityFilter !== 'All' ||
  sortBy !== 'due-asc';
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

  useEffect(() => {
    if (page !== 'users') return undefined;
    let active = true;
    setUsersReady(false);
    api('/users')
      .then((data) => { if (active) setUsers(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setUsersReady(true); });
    return () => { active = false; };
  }, [page]);

  useEffect(() => {
    if (!user) return;
    setAccount((current) => ({ ...current, name: user.name, email: user.email, password: '' }));
  }, [user]);

  const stats = useMemo(() => ({
    total: items.length,
    completed: items.filter((x) => x.completed).length,
    pending: items.filter((x) => !x.completed).length,
    overdue: items.filter(isOverdue).length,
  }), [items]);

  const visible = useMemo(() => {
  const filtered = items.filter((x) => {
    const matchesFilter = filter === 'All' ||
      (filter === 'Completed' && x.completed) ||
      (filter === 'Pending' && !x.completed) ||
      (filter === 'Overdue' && isOverdue(x));

    const matchesPriority = priorityFilter === 'All' ||
      priorityLabel(x.priority) === priorityFilter;

    const matchesSearch = `${x.title} ${x.course} ${x.description}`
      .toLowerCase().includes(search.trim().toLowerCase());

    return matchesFilter && matchesPriority && matchesSearch;
  });

  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  return filtered.sort((a, b) => {
    if (sortBy === 'due-asc') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }

    if (sortBy === 'due-desc') {
      return new Date(b.dueDate) - new Date(a.dueDate);
    }

    if (sortBy === 'priority') {
      return priorityOrder[priorityLabel(b.priority)] -
        priorityOrder[priorityLabel(a.priority)];
    }

    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }

    return 0;
    });
  }, [items, filter, search, priorityFilter, sortBy]);

  function navigate(to) { setPage(to); setNotice(''); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function requireSignIn(message) {
    setAccount(emptyAccount);
    setNotice(message);
    setPage('signin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addNew() {
    if (!user) {
      requireSignIn('Sign in to add or update assignments.');
      return;
    }
    setEditing(null);
    setForm(empty);
    navigate('add');
  }

  function startEdit(item) {
    if (!user) {
      requireSignIn('Sign in to add or update assignments.');
      return;
    }
    setEditing(item._id);
    setForm({
      title: item.title,
      course: item.course,
      description: item.description || '',
      dueDate: dueKey(item.dueDate),
      priority: priorityLabel(item.priority),
    });
    navigate('add');
  }

  async function submit(event) {
    event.preventDefault();
    if (!user) {
      requireSignIn('Sign in to add or update assignments.');
      return;
    }
    setSaving(true); setError(''); setNotice('');
    try {
      await api(editing ? `/assignments/${editing}` : '/assignments', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
      await refresh();
      setNotice(editing ? 'Assignment updated successfully!' : 'Assignment added successfully!');
      setEditing(null);
      setForm(empty);
      setPage('assignments');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function toggle(item) {
    if (!user) {
      requireSignIn('Sign in to add or update assignments.');
      return;
    }
    try {
      await api(`/assignments/${item._id}/complete`, { method: 'PATCH', body: JSON.stringify({ completed: !item.completed }) });
      await refresh();
      setNotice(item.completed ? 'Assignment marked pending.' : 'Great job! Assignment completed.');
    } catch (err) { setError(err.message); }
  }

  async function remove(item) {
    if (!user) {
      requireSignIn('Sign in to add or update assignments.');
      return;
    }
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await api(`/assignments/${item._id}`, { method: 'DELETE' });
      await refresh();
      setNotice('Assignment deleted successfully.');
    } catch (err) { setError(err.message); }
  }

  async function submitAccount(event) {
    event.preventDefault();
    setSaving(true); setError(''); setNotice('');
    try {
      if (page === 'signup') {
        await api('/users', { method: 'POST', body: JSON.stringify(account) });
        setAccount(emptyAccount);
        setPage('signin');
        setNotice('Account created. Sign in to continue.');
      } else if (page === 'signin') {
        const result = await api('/users/login', { method: 'POST', body: JSON.stringify({ email: account.email, password: account.password }) });
        signIn(result.token, result.user);
        setAccount(emptyAccount);
        setPage('home');
        setNotice('Signed in.');
      } else {
        const updated = await api('/users/me', {
          method: 'PUT',
          body: JSON.stringify({ name: account.name, email: account.email, password: account.password }),
        });
        replaceUser(updated);
        setAccount((current) => ({ ...current, password: '' }));
        setNotice('Profile updated.');
      }
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function removeAccount() {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    try {
      await api('/users/me', { method: 'DELETE' });
      signOut();
      setAccount(emptyAccount);
      setPage('home');
      setNotice('Account deleted.');
      setUsers((current) => current.filter((item) => item._id !== user._id));
    } catch (err) { setError(err.message); }
  }

  function leave() {
    signOut();
    setAccount(emptyAccount);
    navigate('home');
    setNotice('Signed out.');
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><img className="brand-logo" src="/logo.webp" alt="Student Assignment Tracker" /></div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        <button className={page === 'home' ? 'nav active' : 'nav'} onClick={() => navigate('home')}><LayoutDashboard size={19}/> Home</button>
        <button className={page === 'assignments' ? 'nav active' : 'nav'} onClick={() => navigate('assignments')}><ClipboardList size={19}/> Assignments</button>
        {user && <button className={page === 'add' ? 'nav active' : 'nav'} onClick={addNew}><PlusCircle size={19}/> Add Assignment</button>}
        <p className="nav-label nav-gap">ACCOUNT</p>
        <button className={page === 'users' ? 'nav active' : 'nav'} onClick={() => navigate('users')}><Users size={19}/> Users</button>
        {user ? <>
          <button className={page === 'profile' ? 'nav active' : 'nav'} onClick={() => navigate('profile')}><UserRound size={19}/> My Profile</button>
          <button className="nav" onClick={leave}><LogOut size={19}/> Sign Out</button>
        </> : <>
          <button className={page === 'signup' ? 'nav active' : 'nav'} onClick={() => { setAccount(emptyAccount); navigate('signup'); }}><PlusCircle size={19}/> Sign Up</button>
          <button className={page === 'signin' ? 'nav active' : 'nav'} onClick={() => { setAccount(emptyAccount); navigate('signin'); }}><LogIn size={19}/> Sign In</button>
        </>}
      </nav>
      <div className="sidebar-footer">{user ? <><UserRound size={22}/><div><strong>{user.name}</strong><span>{user.email}</span></div></> : <><BookOpen size={22}/><div><strong>One step at a time</strong><span>Plan • Track • Complete</span></div></>}</div>
    </aside>
    <main className="main">
      <header className="topbar"><span>Student Assignment Tracker</span><span className="top-chip"><CalendarDays size={15}/> {today}</span></header>
      <div className="content">
        {error && <div className="alert error" role="alert">{error} <button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
        {notice && <div className="alert success" role="status">{notice} <button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
        {page === 'home' && <>
          <section className="hero"><div>
            <img className="hero-logo" src="/logo.webp" alt="" />
            <span className="eyebrow">YOUR STUDENT DASHBOARD</span>
            <h1>Make every deadline<br/><em>feel manageable.</em></h1>
            <p>Organize your coursework, track progress, and celebrate every assignment you finish.</p>
            <div className="hero-actions">
              <button className="primary" onClick={addNew}>+ Add Assignment <ArrowRight size={17}/></button>
              {!user && <button className="secondary" onClick={() => { setAccount(emptyAccount); navigate('signup'); }}>Sign Up</button>}
              {!user && <button className="secondary" onClick={() => { setAccount(emptyAccount); navigate('signin'); }}>Sign In</button>}
            </div>
          </div><div className="hero-art"><GraduationCap size={96} strokeWidth={1.2}/><div className="art-check"><CheckCircle2 size={30}/></div></div></section>
          <div className="section-heading"><div><h2>Overview</h2><p>Your coursework at a glance</p></div></div>
          <div className="stats"><Stat label="Total Assignments" value={stats.total} icon={<ClipboardList/>} tone="purple"/><Stat label="In Progress" value={stats.pending} icon={<BookOpen/>} tone="blue"/><Stat label="Completed" value={stats.completed} icon={<CheckCircle2/>} tone="green"/><Stat label="Overdue" value={stats.overdue} icon={<CalendarDays/>} tone="orange"/></div>
          <div className="section-heading"><div><h2>Upcoming assignments</h2><p>Focus on what comes next</p></div><button className="text-button" onClick={() => navigate('assignments')}>View all <ArrowRight size={16}/></button></div>
          {loading ? <p>Loading assignments...</p> : items.filter((x) => !x.completed).length ? <div className="cards">{items.filter((x) => !x.completed).slice(0, 3).map((x) => <AssignmentCard key={x._id} item={x} signedIn={Boolean(user)} toggle={toggle} edit={startEdit} remove={remove} onSignIn={() => requireSignIn('Sign in to add or update assignments.')}/>)}</div> : <Empty addNew={addNew}/>}
        </>}
        {page === 'assignments' && <><div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>My Assignments</h1><p>Everything you need to stay organized.</p></div><button className="primary" onClick={addNew}>+ Add Assignment</button></div>
          <div className="toolbar assignment-toolbar">
  <div className="search">
    <Search size={18}/>
    <input
      aria-label="Search assignments"
      placeholder="Search by title, course or description..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  <div className="toolbar-controls">
    <div className="filter-group">
      <label>Status</label>
      <div className="filters">
        {['All', 'Pending', 'Completed', 'Overdue'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'filter selected' : 'filter'}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </div>

        <div className="filter-group">
          <label htmlFor="priority-filter">Priority</label>
          <select
            id="priority-filter"
            className="filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All priorities</option>
            <option value="High">High priority</option>
            <option value="Medium">Medium priority</option>
            <option value="Low">Low priority</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="sort-by">Sort by</label>
          <select
            id="sort-by"
            className="filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="due-asc">Due date: earliest first</option>
            <option value="due-desc">Due date: latest first</option>
            <option value="priority">Priority: high to low</option>
                        <option value="title">Title: A–Z</option>
          </select>
        </div>
      </div>

      <div className="toolbar-summary">
        <p className="results-count">
          Showing {visible.length} of {items.length} assignments
        </p>

        <button
          type="button"
          className="reset-filters"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
        >
          Reset Filters
        </button>
      </div>
    </div>
          {loading ? <p>Loading assignments...</p> : visible.length ? <div className="cards">{visible.map((x) => <AssignmentCard key={x._id} item={x} signedIn={Boolean(user)} toggle={toggle} edit={startEdit} remove={remove} onSignIn={() => requireSignIn('Sign in to add or update assignments.')}/>)}</div> : (items.length > 0 ? (
            <div className="empty">
              <Search size={42}/>
              <h3>No matching assignments</h3>
              <p>Try changing your search or resetting your filters.</p>
              <button className="primary" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            <Empty addNew={addNew}/>
          ))}
        </>}
        {page === 'add' && user && <><div className="page-heading"><div><span className="eyebrow">STAY ORGANIZED</span><h1>{editing ? 'Edit Assignment' : 'Add Assignment'}</h1><p>{editing ? 'Update the details of your coursework.' : 'Add your next task and stay ahead of the deadline.'}</p></div></div>
          <form className="assignment-form" onSubmit={submit}><div className="form-header"><ClipboardList size={22}/><h2>Assignment details</h2></div><div className="form-grid"><label className="full">Assignment Title <span>*</span><input required maxLength="120" placeholder="e.g. React portfolio project" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/></label><label>Course <span>*</span><input required maxLength="80" placeholder="e.g. COMP229" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}/></label><label>Due Date <span>*</span><input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}/></label><label className="full">Priority <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label><label className="full">Description <span className="optional">(optional)</span><textarea rows="5" maxLength="1000" placeholder="What do you need to do?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label></div><div className="form-actions"><button type="button" className="secondary" onClick={() => navigate('assignments')}>Cancel</button><button className="primary" disabled={saving} type="submit">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Assignment'}</button></div></form>
        </>}
        {page === 'users' && <><div className="page-heading"><div><span className="eyebrow">CLASSMATES</span><h1>Users</h1><p>Accounts registered on Student Assignment Tracker.</p></div>{!user && <button className="primary" onClick={() => { setAccount(emptyAccount); navigate('signup'); }}>Sign Up</button>}</div>
          {!usersReady ? <p>Loading users...</p> : users.length === 0 ? <div className="empty"><Users size={42}/><h3>No accounts yet</h3><p>Create the first account to appear in this list.</p></div> : <div className="cards">{users.map((accountItem) => {
            const mine = user?._id === accountItem._id;
            return <article key={accountItem._id} className="assignment-card user-card"><h3>{accountItem.name}</h3><p className="course">{accountItem.email}</p>{mine && <div className="form-actions"><button type="button" className="secondary" onClick={() => navigate('profile')}>Edit</button><button type="button" className="secondary" onClick={removeAccount}>Delete</button></div>}</article>;
          })}</div>}
        </>}
        {(page === 'signin' || page === 'signup') && <AccountForm
          mode={page}
          account={account}
          setAccount={setAccount}
          saving={saving}
          onSubmit={submitAccount}
          onSwitch={() => { setAccount(emptyAccount); navigate(page === 'signin' ? 'signup' : 'signin'); }}
        />}
        {page === 'profile' && user && <><div className="page-heading"><div><span className="eyebrow">ACCOUNT</span><h1>My Profile</h1><p>Update your name, email, or password. Leave the password blank to keep the current one.</p></div></div>
          <form className="assignment-form" onSubmit={submitAccount}><div className="form-header"><UserRound size={22}/><h2>Profile details</h2></div><div className="form-grid"><label className="full">Name <span>*</span><input required maxLength="80" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })}/></label><label className="full">Email <span>*</span><input required type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })}/></label><label className="full">New password <span className="optional">(optional)</span><input type="password" autoComplete="new-password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })}/></label></div><div className="form-actions"><button type="button" className="secondary" onClick={removeAccount}>Delete account</button><button className="primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save changes'}</button></div></form>
        </>}
      </div>
    </main>
  </div>;
}

function AccountForm({ mode, account, setAccount, saving, onSubmit, onSwitch }) {
  const signingIn = mode === 'signin';
  return <><div className="page-heading"><div><span className="eyebrow">ACCOUNT</span><h1>{signingIn ? 'Sign in' : 'Sign up'}</h1><p>{signingIn ? 'Use your email and password to continue.' : 'Create an account to add and update assignments.'}</p></div></div>
    <form className="assignment-form" onSubmit={onSubmit}><div className="form-header">{signingIn ? <LogIn size={22}/> : <PlusCircle size={22}/>}<h2>{signingIn ? 'Welcome back' : 'Create your account'}</h2></div><div className="form-grid">{!signingIn && <label className="full">Name <span>*</span><input required maxLength="80" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })}/></label>}<label className="full">Email <span>*</span><input required type="email" autoComplete="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })}/></label><label className="full">Password <span>*</span><input required type="password" minLength="6" autoComplete={signingIn ? 'current-password' : 'new-password'} value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })}/></label></div><div className="form-actions"><button className="primary" disabled={saving} type="submit">{saving ? 'Please wait...' : signingIn ? 'Sign in' : 'Create account'}</button></div><p className="account-switch">{signingIn ? 'Need an account?' : 'Already have an account?'} <button type="button" onClick={onSwitch}>{signingIn ? 'Sign up' : 'Sign in'}</button></p></form>
  </>;
}

function Stat({ label, value, icon, tone }) { return <div className="stat"><div className={`stat-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>; }
function Empty({ addNew, text = 'No assignments yet. Add your first assignment to get started!' }) { return <div className="empty"><ClipboardList size={42}/><h3>Nothing here yet</h3><p>{text}</p><button className="primary" onClick={addNew}>+ Add Assignment</button></div>; }
function AssignmentCard({ item, signedIn, toggle, edit, remove, onSignIn }) {
  const priority = priorityLabel(item.priority);
  return <article className={`assignment-card ${item.completed ? 'done' : ''}`}><div className="card-top"><span className={`priority ${priority.toLowerCase()}`}>{priority} priority</span><span className={`status ${item.completed ? 'complete' : isOverdue(item) ? 'late' : ''}`}>{item.completed ? 'Completed' : isOverdue(item) ? 'Overdue' : 'Pending'}</span></div><h3>{item.title}</h3><p className="course">{item.course}</p>{item.description && <p className="description">{item.description}</p>}<div className="card-bottom"><span><CalendarDays size={16}/> {prettyDate(item.dueDate)}</span>{signedIn ? <div className="card-actions"><button title={item.completed ? 'Mark pending' : 'Mark complete'} aria-label={item.completed ? 'Mark pending' : 'Mark complete'} onClick={() => toggle(item)}><CheckCircle2 size={18}/></button><button title="Edit assignment" aria-label="Edit assignment" onClick={() => edit(item)}><Pencil size={17}/></button><button title="Delete assignment" aria-label="Delete assignment" onClick={() => remove(item)}><Trash2 size={17}/></button></div> : <button className="text-button" onClick={onSignIn}>Sign in to update</button>}</div></article>;
}
