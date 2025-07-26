import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Settings, Star } from '../icons/index';
import api from '../utils/api';

const ProfileView = ({ showToast, darkMode }) => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [showAddInterest, setShowAddInterest] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProfileAndTransactions = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!userId || !token) {
                showToast('You must be logged in.', 'error');
                setLoading(false);
                return;
            }

            const profileResponse = await api.get(`/users/${userId}?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const rawProfile = profileResponse;
            if (!rawProfile || Object.keys(rawProfile).length === 0 || !rawProfile.name) {
                throw new Error('Profile data is empty or missing');
            }

            const transactionsResponse = await api.get('/transactions');
            console.log('Raw Transactions Response:', transactionsResponse);
            const userTransactions = Array.isArray(transactionsResponse)
                ? transactionsResponse.filter((t) =>
                    t.userId && t.userId._id === userId)
                : [];

            console.log('User Transactions:', userTransactions);

            const completedSwaps = userTransactions.filter(t => t.type === 'completed').length;
            const otherUserRatings = transactionsResponse
                .filter(t =>
                    t.userId && t.userId._id !== userId &&
                    t.partnerId && t.partnerId._id === userId &&
                    t.userRating !== undefined)
                .map(t => t.userRating);
            const rating = otherUserRatings.length > 0 ? otherUserRatings.reduce((sum, r) => sum + r, 0) / otherUserRatings.length : 0;

            console.log('Other User Ratings:', otherUserRatings);
            console.log('Calculated Rating:', rating);
            console.log('User ID:', userId);

            const mappedData = {
                ...rawProfile,
                skills: rawProfile.skillsOffered ?? [],
                interests: rawProfile.skillsToLearn ?? [],
                completedSwaps: completedSwaps,
                rating: rating,
            };

            setProfile(mappedData);
            setEditForm(mappedData);
        } catch (error) {
            console.error('Failed to fetch profile or transactions:', error, error.response);
            showToast('Failed to load profile or transactions.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileAndTransactions();
    }, []);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const maxBioLength = 1000;

            if (editForm.bio && editForm.bio.length > maxBioLength) {
                showToast(`Bio is too long. Please keep it under ${maxBioLength} characters.`, 'error');
                return;
            }

            const payload = {
                name: editForm.name || '',
                email: editForm.email || '',
                location: editForm.location || '',
                bio: editForm.bio || '',
                skillsOffered: editForm.skills || [],
                skillsToLearn: editForm.interests || [],
                avatar: editForm.avatar || '',
            };

            const response = await api.put(`/users/${userId}/profile`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const updatedData = {
                name: response.name || editForm.name,
                email: response.email || editForm.email,
                location: response.location || editForm.location,
                bio: response.bio || editForm.bio,
                skills: response.skillsOffered || editForm.skills || [],
                interests: response.skillsToLearn || editForm.interests || [],
                rating: editForm.rating || 0,
                avatar: response.avatar || editForm.avatar || '',
                completedSwaps: editForm.completedSwaps || 0,
            };

            setProfile(updatedData);
            setEditForm(updatedData);
            setIsEditing(false);
            showToast('Profile updated successfully!', 'success');

            await fetchProfileAndTransactions();
        } catch (err) {
            console.error('Failed to update profile:', err, {
                status: err.response?.status,
                data: err.response?.data,
            });
            const errorMessage =
                err.response?.status === 413
                    ? 'Payload too large. Try reducing the bio length.'
                    : err.response?.data?.message || err.message || 'Unknown error';
            showToast(`Failed to update profile: ${errorMessage}`, 'error');
            if (editForm && editForm.name) {
                setProfile(editForm);
            }
            await fetchProfileAndTransactions();
        }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setEditForm((prev) => ({ ...prev, avatar: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSkill = () => {
        if (newSkill && editForm) {
            setEditForm((prev) => ({
                ...prev,
                skills: prev.skills ? [...prev.skills, newSkill] : [newSkill],
            }));
            showToast(`Skill "${newSkill}" added!`, 'success');
            setNewSkill('');
            setShowAddSkill(false);
        }
    };

    const handleAddInterest = () => {
        if (newInterest && editForm) {
            setEditForm((prev) => ({
                ...prev,
                interests: prev.interests ? [...prev.interests, newInterest] : [newInterest],
            }));
            showToast(`Interest "${newInterest}" added!`, 'success');
            setNewInterest('');
            setShowAddInterest(false);
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        if (editForm) {
            setEditForm((prev) => ({
                ...prev,
                skills: prev.skills.filter((skill) => skill !== skillToRemove),
            }));
            showToast(`Skill "${skillToRemove}" removed!`, 'success');
        }
    };

    const handleRemoveInterest = (interestToRemove) => {
        if (editForm) {
            setEditForm((prev) => ({
                ...prev,
                interests: prev.interests.filter((interest) => interest !== interestToRemove),
            }));
            showToast(`Interest "${interestToRemove}" removed!`, 'success');
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen p-6 flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
                <p className={`${darkMode ? 'text-white' : 'text-black'}`}>Loading profile...</p>
            </div>
        );
    }

    if (!profile || !profile.name) {
        return (
            <div className={`min-h-screen p-6 flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
                <p className={`${darkMode ? 'text-white' : 'text-black'}`}>No profile data found.</p>
            </div>
        );
    }

    const displayData = isEditing ? editForm : profile;

    return (
        <div className={`min-h-screen p-6 ${darkMode ? 'dark' : ''}`}>
            <div className={`bg-[#eaf2f7] text-[#121b2b] ${darkMode ? 'dark:bg-[#121b2b] dark:text-white' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-2">Profile</h1>
                        <p className="text-sm text-gray-700 dark:text-gray-400">Manage your skill-sharing profile</p>
                    </div>
                    <button
                        onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                        className={`px-6 py-3 rounded-3xl font-medium ${darkMode
                            ? 'bg-gradient-to-r from-[#ff7f50] to-[#ffbb91]'
                            : 'bg-gradient-to-r from-[#ff7f50]/80 to-[#ffbb91]/80'
                            } text-white hover:scale-105 hover:shadow-lg transition-all duration-200`}
                    >
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div
                            className={`bg-white ${darkMode ? 'dark:bg-[#1a2637]' : ''} rounded-3xl p-8 border ${darkMode ? 'dark:border-white/20' : 'border-gray-200'
                                } shadow-lg`}
                        >
                            <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData?.name || ''}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                            className={`w-full px-4 py-3 ${darkMode ? 'bg-[#1a2637] text-gray-900' : 'bg-white text-[#112233]'
                                                } border ${darkMode ? 'border-white/30' : 'border-gray-300'} rounded-2xl focus:outline-none focus:border-[#ff7f50] focus:ring-2 focus:ring-[#ff7f50]/30 transition-all duration-200`}
                                        />
                                    ) : (
                                        <p className={`text-[#121b2b] ${darkMode ? 'text-white' : ''}`}>
                                            {displayData.name || ''}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={displayData?.email || ''}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                                            className={`w-full px-4 py-3 ${darkMode ? 'bg-[#1a2637] text-gray-900' : 'bg-white text-[#112233]'
                                                } border ${darkMode ? 'border-white/30' : 'border-gray-300'} rounded-2xl focus:outline-none focus:border-[#ff7f50] focus:ring-2 focus:ring-[#ff7f50]/30 transition-all duration-200`}
                                        />
                                    ) : (
                                        <p className={`text-[#121b2b] ${darkMode ? 'text-white' : ''}`}>
                                            {displayData.email || ''}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        Location
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData?.location || ''}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                                            className={`w-full px-4 py-3 ${darkMode ? 'bg-[#1a2637] text-gray-900' : 'bg-white text-[#112233]'
                                                } border ${darkMode ? 'border-white/30' : 'border-gray-300'} rounded-2xl focus:outline-none focus:border-[#ff7f50] focus:ring-2 focus:ring-[#ff7f50]/30 transition-all duration-200`}
                                        />
                                    ) : (
                                        <p className={`text-[#121b2b] ${darkMode ? 'text-white' : ''}`}>
                                            {displayData.location || ''}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        Bio
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={displayData?.bio || ''}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                                            rows={4}
                                            maxLength={1000}
                                            className={`w-full px-4 py-3 ${darkMode ? 'bg-[#1a2637] text-gray-900' : 'bg-white text-[#112233]'
                                                } border ${darkMode ? 'border-white/30' : 'border-gray-300'} rounded-2xl focus:outline-none focus:border-[#ff7f50] focus:ring-2 focus:ring-[#ff7f50]/30 transition-all duration-200 resize-none`}
                                        />
                                    ) : (
                                        <p className={`text-[#121b2b] ${darkMode ? 'text-white' : ''}`}>
                                            {displayData.bio || ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div
                            className={`bg-white ${darkMode ? 'dark:bg-[#1a2637]' : ''} rounded-3xl p-8 border ${darkMode ? 'dark:border-white/20' : 'border-gray-200'
                                } shadow-lg`}
                        >
                            <h2 className="text-2xl font-semibold mb-4">Skills I Offer</h2>
                            <div className="flex flex-wrap gap-4">
                                {(displayData.skills ?? []).map((skill) => (
                                    <div key={skill} className="relative flex items-center">
                                        <span
                                            className={`px-4 py-2 bg-gradient-to-r from-[#ff7f50]/30 to-[#ffbb91]/30 ${darkMode ? 'dark:from-[#ff7f50]/20 dark:to-[#ffbb91]/20' : ''
                                                } text-[#ff7f50] rounded-full text-sm font-medium border border-[#ff7f50]/30`}
                                        >
                                            {skill}
                                        </span>
                                        {isEditing && (
                                            <button
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="ml-2 text-red-500 hover:text-red-700 text-sm"
                                                title="Remove skill"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <button
                                        onClick={() => setShowAddSkill(true)}
                                        className={`px-4 py-2 ${darkMode ? 'dark:bg-[#1a2637]' : 'bg-[#f3f4f6]'
                                            } text-gray-500 dark:text-gray-400 rounded-full text-sm font-medium border border-gray-300 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200`}
                                    >
                                        + Add Skill
                                    </button>
                                )}
                            </div>
                            {showAddSkill && (
                                <div className="mt-4 flex items-center">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Enter new skill"
                                        className={`px-4 py-2 rounded-full border ${darkMode ? 'border-white/20 bg-[#1a2637] text-gray-900' : 'border-gray-300 bg-white text-gray-900'}`}
                                    />
                                    <button
                                        onClick={handleAddSkill}
                                        className="ml-2 px-4 py-2 bg-[#ff7f50] text-white rounded-full"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>

                        <div
                            className={`bg-white ${darkMode ? 'dark:bg-[#1a2637]' : ''} rounded-3xl p-8 border ${darkMode ? 'dark:border-white/20' : 'border-gray-200'
                                } shadow-lg`}
                        >
                            <h2 className="text-2xl font-semibold mb-4">Skills I Want to Learn</h2>
                            <div className="flex flex-wrap gap-4">
                                {(displayData.interests ?? []).map((interest) => (
                                    <div key={interest} className="relative flex items-center">
                                        <span
                                            className={`px-4 py-2 bg-gradient-to-r from-[#ff7f50]/30 to-[#ffbb91]/30 ${darkMode ? 'dark:from-[#ff7f50]/20 dark:to-[#ffbb91]/20' : ''
                                                } text-[#ff7f50] rounded-full text-sm font-medium border border-[#ff7f50]/30`}
                                        >
                                            {interest}
                                        </span>
                                        {isEditing && (
                                            <button
                                                onClick={() => handleRemoveInterest(interest)}
                                                className="ml-2 text-red-500 hover:text-red-700 text-sm"
                                                title="Remove interest"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <button
                                        onClick={() => setShowAddInterest(true)}
                                        className={`px-4 py-2 ${darkMode ? 'dark:bg-[#1a2637]' : 'bg-[#f3f4f6]'
                                            } text-gray-500 dark:text-gray-400 rounded-full text-sm font-medium border border-gray-300 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200`}
                                    >
                                        + Add Interest
                                    </button>
                                )}
                            </div>
                            {showAddInterest && (
                                <div className="mt-4 flex items-center">
                                    <input
                                        type="text"
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        placeholder="Enter new interest"
                                        className={`px-4 py-2 rounded-full border ${darkMode ? 'border-white/20 bg-[#1a2637] text-gray-900' : 'border-gray-300 bg-white text-gray-900'}`}
                                    />
                                    <button
                                        onClick={handleAddInterest}
                                        className="ml-2 px-4 py-2 bg-[#ff7f50] text-white rounded-full"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div
                            className={`bg-white ${darkMode ? 'dark:bg-[#1a2637]' : ''} rounded-3xl p-8 border ${darkMode ? 'dark:border-white/20' : 'border-gray-200'
                                } shadow-lg`}
                        >
                            <div className="text-center">
                                <div className="relative mb-6">
                                    <div
                                        className={`w-24 h-24 bg-gradient-to-br from-[#ff7f50]/50 to-[#ffbb91]/50 ${darkMode ? 'dark:from-[#ff7f50]' : ''
                                            } rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold`}
                                    >
                                        {displayData.avatar ? (
                                            <img
                                                src={displayData.avatar}
                                                alt="Avatar"
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : displayData.name ? (
                                            displayData.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-8 h-8 bg-[#ff7f50] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#ff7f50]/80 transition-colors">
                                            <Camera className="w-4 h-4 text-white" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <h3 className="text-2xl font-semibold mb-2">{displayData.name || ''}</h3>
                                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                    {displayData.location || ''}
                                </p>
                                <div className="flex items-center justify-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(displayData.rating ?? 0)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                        />
                                    ))}
                                    <span
                                        className={`text-[#121b2b] ${darkMode ? 'text-white' : ''} font-medium ml-2`}
                                    >
                                        {isNaN(displayData.rating) ? '0.0' : displayData.rating.toFixed(1)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-6 text-center">
                                    <div>
                                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#121b2b]'}`}>
                                            {displayData.completedSwaps ?? 0}
                                        </p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                            Completed Swaps
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#121b2b]'}`}>
                                            {(displayData.skills ?? []).length}
                                        </p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                            Skills Offered
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`bg-white ${darkMode ? 'dark:bg-[#1a2637]' : ''} rounded-3xl p-8 border ${darkMode ? 'dark:border-white/20' : 'border-gray-200'
                                } shadow-lg`}
                        >
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-4">
                                <Link
                                    to="/settings"
                                    className={`w-full text-left px-4 py-3 ${darkMode ? 'dark:bg-[#1a2637]' : 'bg-[#f3f4f6]'
                                        } text-[#112233] ${darkMode ? 'dark:text-white' : 'text-[#112233]'} rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 flex items-center gap-3`}
                                >
                                    <Settings className="w-5 h-5 text-gray-400" />
                                    <span>Account Settings</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;