import { useState } from 'react';

const AccountSettingsPage = ({ darkMode }) => {
    const [form, setForm] = useState({
        email: 'john@example.com',
        password: '',
        confirmPassword: '',
    });

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            alert('Passwords do not match.');
        } else {
            alert('Account settings updated successfully!');
        }
    };

    return (
        <div className={`min-h-screen p-6 ${darkMode ? 'bg-[#121b2b] text-white' : 'bg-gray-50 text-[#121b2b]'}`}>
            <div className={`max-w-4xl mx-auto bg-white dark:bg-[#1a2637] rounded-3xl p-8 shadow-lg ${darkMode ? 'shadow-[#1a2637]' : 'shadow-lg'}`}>
                <h1 className="text-3xl font-extrabold mb-6">Account Settings</h1>

                {/* Account Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-[#1a2637] dark:text-white focus:ring-2 focus:ring-[#ff7f50] transition-all duration-300 ${darkMode ? 'dark:border-white/30' : 'border-gray-300'}`}
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-[#1a2637] dark:text-white focus:ring-2 focus:ring-[#ff7f50] transition-all duration-300 ${darkMode ? 'dark:border-white/30' : 'border-gray-300'}`}
                            required
                        />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-[#1a2637] dark:text-white focus:ring-2 focus:ring-[#ff7f50] transition-all duration-300 ${darkMode ? 'dark:border-white/30' : 'border-gray-300'}`}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full px-6 py-3 bg-gradient-to-r from-[#ff7f50] to-[#ffbb91] text-white rounded-full hover:bg-[#ff7f50]/80 transition-all duration-200 ${darkMode ? 'dark:hover:bg-[#ff7f50]/70' : 'hover:bg-[#ff7f50]/80'}`}
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AccountSettingsPage;
