import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const AccountSettingsPage = ({ darkMode }) => {
    const [formData, setFormData] = useState({
        email: '',
        currentPassword: '',
        password: '',
        newPassword: '',
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    console.error('No userId found in localStorage');
                    alert('Please log in to access account settings');
                    setLoading(false);
                    return;
                }

                const res = await API.get(`/users/${userId}`);
                const userData = res.data && typeof res.data === 'object' ? res.data : res;
                if (userData && typeof userData === 'object' && userData.email) {
                    setFormData({ ...formData, email: userData.email });
                } else {
                    console.error('Unexpected API response:', res);
                    alert('Failed to load user data: Invalid response');
                    setFormData({ ...formData, email: '' });
                }
            } catch (err) {
                console.error('Error fetching user:', err.message);
                alert('Failed to load user data');
                setFormData({ ...formData, email: '' });
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.newPassword) {
            return alert('Passwords do not match.');
        }

        try {
            const response = await API.post('/users/update-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.password,
            });
            alert('Password updated successfully! You can now log in with the new password.');
            setFormData({
                ...formData,
                currentPassword: '',
                password: '',
                newPassword: '',
            });
        } catch (err) {
            console.error('Error updating password:', err.message);
            alert(err.message || 'Failed to update password.');
        }
    };

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0d1321] text-white' : 'bg-gray-100 text-[#0d1321]'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7f50]"></div>
        </div>
    );

    return (
        <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${darkMode ? 'bg-[#0d1321] text-white' : 'bg-gray-100 text-[#0d1321]'}`}>
            <div className="max-w-lg mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className={`mb-6 flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-[#0d1321]'} transition-colors duration-200`}
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Back
                </button>
                <div className={`bg-white dark:bg-[#1e2a44] rounded-2xl p-6 sm:p-8 shadow-lg ${darkMode ? 'shadow-[#1e2a44]/50' : 'shadow-gray-200'}`}>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight">Account Settings</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2a3757] dark:text-white border ${darkMode ? 'border-white/20 focus:border-[#ff7f50]/50' : 'border-gray-300 focus:border-[#ff7f50]'} focus:ring-2 focus:ring-[#ff7f50]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                                disabled
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Email cannot be changed.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2a3757] dark:text-white border ${darkMode ? 'border-white/20 focus:border-[#ff7f50]/50' : 'border-gray-300 focus:border-[#ff7f50]'} focus:ring-2 focus:ring-[#ff7f50]/50 transition-all duration-300`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">New Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2a3757] dark:text-white border ${darkMode ? 'border-white/20 focus:border-[#ff7f50]/50' : 'border-gray-300 focus:border-[#ff7f50]'} focus:ring-2 focus:ring-[#ff7f50]/50 transition-all duration-300`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2a3757] dark:text-white border ${darkMode ? 'border-white/20 focus:border-[#ff7f50]/50' : 'border-gray-300 focus:border-[#ff7f50]'} focus:ring-2 focus:ring-[#ff7f50]/50 transition-all duration-300`}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-2.5 px-6 bg-gradient-to-r from-[#ff7f50] to-[#ffbb91] text-white rounded-lg font-medium hover:from-[#ff7f50]/90 hover:to-[#ffbb91]/90 focus:ring-2 focus:ring-[#ff7f50]/50 focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-[#1e2a44]' : 'focus:ring-offset-white'} transition-all duration-200`}
                        >
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsPage;