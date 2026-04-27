import { useState, useEffect } from 'react';
import { getAllUsers, createUser, deleteUser } from '../../services/authService';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { ROLE_NAMES, ROLES } from '../../utils/constants';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: ROLES.CODER
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data.users);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: ROLES.CODER
      });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const roleBadgeColors = {
    [ROLES.TEAM_LEAD]: 'bg-violet-50 text-violet-700 border-violet-100',
    [ROLES.CODER]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    [ROLES.AUDITOR]: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  const inputClasses = 'w-full px-3.5 py-2.5 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-subtle)] transition-all duration-200';

  return (
    <Card
      title="User Management"
      subtitle="Manage all system users"
      action={
        <Button
          size="sm"
          variant={showAddForm ? 'secondary' : 'primary'}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            'Cancel'
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add User
            </>
          )}
        </Button>
      }
    >
      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] bg-red-50 border border-red-100 text-sm text-red-700">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-[var(--color-surface-alt)] rounded-[var(--radius-lg)] border border-[var(--color-border-light)] slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={inputClasses}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputClasses}
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={inputClasses}
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClasses}
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={inputClasses}
              >
                {Object.values(ROLES).map((role) => (
                  <option key={role} value={role}>
                    {ROLE_NAMES[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" size="sm">Create User</Button>
        </form>
      )}

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-6 pb-3 text-left text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Username</th>
                <th className="px-6 pb-3 text-left text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Full Name</th>
                <th className="px-6 pb-3 text-left text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Email</th>
                <th className="px-6 pb-3 text-left text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Role</th>
                <th className="px-6 pb-3 text-right text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="table-row-hover border-b border-[var(--color-border-light)] last:border-0">
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-medium text-[var(--color-text)]">{user.username}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-[var(--color-text-secondary)]">{user.fullName}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-[var(--color-text-secondary)]">{user.email}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleBadgeColors[user.role] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                      {ROLE_NAMES[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="!text-[var(--color-text-tertiary)] hover:!text-[var(--color-danger)] hover:!bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">No users found</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default UserManagement;
