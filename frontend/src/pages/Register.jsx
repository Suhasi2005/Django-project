import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', email: '', phone: '', password1: '', password2: '',
  });
  const [errors, setErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors(null);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setErrors(err.data || { __all__: ['Registration failed.'] });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldErrors = (field) => errors?.[field]?.join(' ');

  return (
    <div className="page page-narrow">
      <h1>Register</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Username
          <input required value={form.username} onChange={updateField('username')} />
          {fieldErrors('username') && <span className="field-error">{fieldErrors('username')}</span>}
        </label>
        <label>
          Email
          <input required type="email" value={form.email} onChange={updateField('email')} />
          {fieldErrors('email') && <span className="field-error">{fieldErrors('email')}</span>}
        </label>
        <label>
          Phone (optional)
          <input value={form.phone} onChange={updateField('phone')} />
        </label>
        <label>
          Password
          <input required type="password" value={form.password1} onChange={updateField('password1')} />
          {fieldErrors('password1') && <span className="field-error">{fieldErrors('password1')}</span>}
        </label>
        <label>
          Confirm Password
          <input required type="password" value={form.password2} onChange={updateField('password2')} />
          {fieldErrors('password2') && <span className="field-error">{fieldErrors('password2')}</span>}
        </label>
        {errors?.__all__ && <p className="status status-error">{errors.__all__.join(' ')}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
