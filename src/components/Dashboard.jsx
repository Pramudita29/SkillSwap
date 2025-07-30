import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightLeft, Award, Filter, Moon, Plus, Sun, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import SkillCard from './SkillCard';
import StatsCard from './StatsCard';

const Dashboard = ({ darkMode, toggleTheme, showToast }) => {
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [errorUserSkills, setErrorUserSkills] = useState('');
  const [stats, setStats] = useState(null);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorSkills, setErrorSkills] = useState('');
  const [errorStats, setErrorStats] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showPostSkillModal, setShowPostSkillModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState([]);
  const [newSkill, setNewSkill] = useState({
    title: '',
    category: [],
    description: '',
    wantsSkill: [],
    offeredSkill: [],
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Define wantsSkill mapping for consistent display
  const wantsSkillMap = {
    frontend: 'Frontend Development',
    backend: 'Backend Development',
    graphicDesign: 'Graphic Design',
    seo: 'SEO',
    marketing: 'Digital Marketing',
    dataAnalysis: 'Data Analysis',
    contentWriting: 'Content Writing',
    javascript: 'JavaScript',
    python: 'Python',
    uiuxDesign: 'UI/UX Design',
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Dark mode styling
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#121b2b';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#eaf2f7';
    }
  }, [darkMode]);

  // Fetch skills from backend (excluding current user's skills)
  useEffect(() => {
    const currentUserId = localStorage.getItem('userId');
    setLoadingSkills(true);
    api.get('/skills')
      .then((data) => {
        console.log('Fetched skills:', data);
        const filteredSkills = data.filter((skill) => {
          const postedBy = typeof skill.userId === 'string' ? skill.userId : skill.userId?._id;
          return postedBy !== currentUserId;
        });
        const mappedSkills = filteredSkills.map((skill) => {
          const postedById = typeof skill.userId === 'string' ? skill.userId : skill.userId?._id;
          return {
            id: skill._id,
            title: skill.title,
            user: skill.name || 'Unknown',
            avatar: skill.name ? skill.name[0].toUpperCase() : skill.title[0].toUpperCase(),
            rating: skill.rating || 4.5,
            category: skill.category.map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1)),
            offeredSkill: skill.offeredSkill || [],
            wantsSkill: skill.wantsSkill.map((ws) => wantsSkillMap[ws] || ws),
            description: skill.description,
            location: skill.location || 'Unknown',
            timeAgo: skill.createdAt ? new Date(skill.createdAt).toLocaleDateString() : '',
            postedById,
          };
        });
        console.log('Mapped skills:', mappedSkills);
        setSkills(mappedSkills);
        setErrorSkills('');
      })
      .catch((err) => setErrorSkills(err.message))
      .finally(() => setLoadingSkills(false));
  }, []);

  // Fetch user's skills for offeredSkill dropdown
  useEffect(() => {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      setErrorUserSkills('No user ID found. Please log in again.');
      return;
    }
    console.log('Fetching user skills for userId:', currentUserId);
    api.get('/skills/my-skills')
      .then((data) => {
        console.log('User skills response:', data);
        setUserSkills(data);
        setErrorUserSkills(data.length === 0 ? 'No skills found. Please add skills to your profile.' : '');
      })
      .catch((err) => {
        console.error('Error fetching user skills:', err.message);
        setErrorUserSkills('Failed to load your skills.');
      });
  }, []);

  // Fetch stats
  useEffect(() => {
    setLoadingStats(true);
    api.get('/stats')
      .then((data) => {
        setStats(data);
        setErrorStats('');
      })
      .catch((err) => setErrorStats(err.message))
      .finally(() => setLoadingStats(false));
  }, []);

  // Filter skills
  const filteredSkills = skills.filter(
    (skill) =>
      skill.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      (filterCategory === 'all' || skill.category.includes(filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)))
  );

  // Handle initiating swap request
  const handleSwapRequest = (skill) => {
    if (userSkills.length === 0) {
      showToast('Please add skills to your profile before requesting a swap.', 'error');
      return;
    }
    setSelectedSkill(skill);
    setShowSwapModal(true);
    setErrorMessage('');
  };

  // Handle swap submission
  const handleSwapSubmit = async () => {
    if (!selectedOfferedSkill.length) {
      setErrorMessage('Please select at least one skill to offer.');
      return;
    }
    try {
      await api.post('/swaps', {
        toUserId: selectedSkill.postedById,
        skillOffered: selectedOfferedSkill.join(', '),
        skillRequested: selectedSkill.title,
      });
      showToast('Swap request sent!', 'success');
      setShowSwapModal(false);
      setSelectedOfferedSkill([]);
      setSelectedSkill(null);
    } catch (err) {
      console.error('Swap request failed:', err.response?.data?.error || err.message);
      showToast(`Failed to send request: ${err.response?.data?.error || 'Unknown error'}`, 'error');
    }
  };

  const handlePostSkill = () => {
    setShowPostSkillModal(true);
    setErrorMessage('');
  };

  const closePostSkillModal = () => {
    setShowPostSkillModal(false);
    setNewSkill({ title: '', category: [], description: '', wantsSkill: [], offeredSkill: [] });
    setErrorMessage('');
  };

  const closeSwapModal = () => {
    setShowSwapModal(false);
    setSelectedOfferedSkill([]);
    setSelectedSkill(null);
    setErrorMessage('');
  };

  const handleNewSkillChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category' || name == 'wantsSkill' || name === 'offeredSkill') {
      const selectedValues = Array.from(e.target.selectedOptions || [], (option) => option.value);
      console.log(`Updating ${name}:`, selectedValues);
      setNewSkill({
        ...newSkill,
        [name]: selectedValues,
      });
    } else {
      setNewSkill({ ...newSkill, [name]: value });
    }
  };

  const handlePostNewSkill = () => {
    const { title, category, description, offeredSkill } = newSkill;
    if (!title || category.length === 0 || !description || offeredSkill.length === 0) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    console.log('Posting skill with data:', { title, category, description, offeredSkill });
    api.post('/skills', { title, category, description, wantsSkill: newSkill.wantsSkill, offeredSkill })
      .then((createdSkill) => {
        showToast(`Skill "${createdSkill.title}" posted successfully!`, 'success');
        setNewSkill({ title: '', category: [], description: '', wantsSkill: [], offeredSkill: [] });
        closePostSkillModal();
        api.get('/skills/my-skills')
          .then((data) => {
            console.log('Refreshed user skills:', data);
            setUserSkills(data);
            setErrorUserSkills(data.length === 0 ? 'No skills found. Please add skills to your profile.' : '');
          })
          .catch((err) => {
            console.error('Error refreshing user skills:', err.message);
            setErrorUserSkills('Failed to load your skills.');
          });
      })
      .catch((err) => setErrorMessage(err.response?.data?.error || err.message));
  };

  // Custom Dropdown Component
  const CustomDropdown = ({ name, value, onChange, options, placeholder, multiple = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (optionValue) => {
      let newValue;
      if (multiple) {
        if (value.includes(optionValue)) {
          newValue = value.filter((v) => v !== optionValue);
        } else {
          newValue = [...value, optionValue];
        }
      } else {
        newValue = [optionValue];
      }
      const syntheticEvent = {
        target: {
          name,
          value: newValue,
          selectedOptions: newValue.map((val) => ({ value: val })),
        },
      };
      onChange(syntheticEvent);
      if (!multiple) setIsOpen(false);
    };

    const displayText = value.length > 0
      ? value
        .map((val) => options.find((opt) => opt.value === val)?.label || val)
        .join(', ')
      : placeholder;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full py-3 px-4 rounded-xl text-left flex justify-between items-center ${darkMode ? 'bg-[#2c3e50] text-white' : 'bg-gray-100 text-gray-800'
            } border border-[#ff7f50] transition-all duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-[#ff7f50]`}
        >
          <span>{displayText}</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-10 w-full mt-1 rounded-xl shadow-lg border border-white/20 max-h-60 overflow-y-auto ${darkMode ? 'bg-[#2c3e50] text-white' : 'bg-white text-gray-800'
                }`}
            >
              {options.length === 0 && (
                <li className="px-4 py-2 text-sm opacity-50">No options available</li>
              )}
              {options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2 cursor-pointer hover:bg-[#ff7f50] hover:text-white transition-all duration-200 ${value.includes(option.value) ? 'bg-[#ff7f50] text-white' : ''
                    }`}
                >
                  {option.label}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <div className={`min-h-screen p-6 transition-colors relative z-10 ${darkMode ? 'bg-[#121b2b]' : 'bg-[#eaf2f7]'}`}>
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/20 transition border-2 border-[#ff7f50]"
            style={{
              backgroundColor: darkMode ? '#ff7f50' : 'transparent',
              color: darkMode ? '#fff' : '#ff7f50',
            }}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-extrabold mb-2 ${darkMode ? 'text-white' : 'text-[#112233]'}`}>
              Discover Skills
            </h1>
            <p className={`max-w-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Find the perfect skill exchange partner
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePostSkill}
            className="text-white px-6 py-3 rounded-3xl font-semibold shadow-lg flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #ff7f50, #ffbb91)',
              boxShadow: '0 6px 12px #ff7f50b0',
            }}
          >
            <Plus className="w-5 h-5" />
            Post Skill
          </motion.button>
        </div>

        {/* Search & Filter */}
        <div
          className={`mt-6 rounded-3xl p-6 border shadow-lg ${darkMode ? 'bg-[#1f2937] border-white/10' : 'bg-white border-gray-200'
            }`}
        >
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 relative">
              <Filter
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
              />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-transparent border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#ff7f50] transition-all duration-200 ${darkMode ? 'border-white/30 placeholder-gray-400 text-white' : 'border-gray-300 placeholder-gray-600 text-gray-800'
                  }`}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`bg-transparent border rounded-3xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#ff7f50] transition-all duration-200 ${darkMode ? 'border-white/30 text-white' : 'border-gray-300 text-gray-800'
                }`}
            >
              <option value="all">All Categories</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="business">Business</option>
              <option value="creative">Creative</option>
            </select>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {loadingSkills
              ? 'Loading skills...'
              : errorSkills
                ? `Error loading skills: ${errorSkills}`
                : filteredSkills.length === 0
                  ? 'No skills right now'
                  : `Found ${filteredSkills.length} skills`}
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          <AnimatePresence>
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SkillCard
                  skill={skill}
                  onSwapRequest={handleSwapRequest}
                  darkMode={darkMode}
                  disabled={userSkills.length === 0}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {loadingStats && (
            <p className={`text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading stats...</p>
          )}
          {errorStats && <p className="text-center text-red-500">Failed to load stats: {errorStats}</p>}
          {!loadingStats && !errorStats && stats && [
            {
              icon: Users,
              title: 'Active Users',
              value: stats.totalUsers || 0,
              change: '+12% this week',
              gradient: 'from-[#ff7f50] to-[#ffbb91]',
            },
            {
              icon: ArrowRightLeft,
              title: 'Successful Swaps',
              value: stats.totalSwaps || 0,
              change: '+8% this month',
              gradient: 'from-[#ff7f50] to-[#ffbb91]',
            },
            {
              icon: Award,
              title: 'Avg Rating',
              value: stats.avgRating || '0',
              change: '★★★★★',
              gradient: 'from-[#ff7f50] to-[#ffbb91]',
            },
          ].map((stat, i) => (
            <StatsCard key={i} {...stat} darkMode={darkMode} />
          ))}
        </div>
      </div>

      {/* Post Skill Modal */}
      {showPostSkillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded-3xl p-8 w-96 max-w-full shadow-lg border border-white/20 ${darkMode ? 'bg-[#1f2937]' : 'bg-white'
              }`}
          >
            <h3 className="text-2xl font-bold mb-6 text-white">Post a New Skill</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={newSkill.title}
                onChange={handleNewSkillChange}
                placeholder="Skill Title"
                className={`w-full py-3 px-4 rounded-xl ${darkMode ? 'bg-[#2c3e50] text-white' : 'bg-gray-100 text-gray-800'
                  } border border-[#ff7f50]`}
              />
              <CustomDropdown
                name="category"
                value={newSkill.category}
                onChange={handleNewSkillChange}
                options={[
                  { value: 'development', label: 'Development' },
                  { value: 'design', label: 'Design' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'business', label: 'Business' },
                  { value: 'creative', label: 'Creative' },
                ]}
                placeholder="Select Categories"
                multiple
              />
              <CustomDropdown
                name="offeredSkill"
                value={newSkill.offeredSkill}
                onChange={handleNewSkillChange}
                options={userSkills.map((skill) => ({
                  value: skill.title,
                  label: skill.title,
                }))}
                placeholder="Select Offered Skills"
                multiple
              />
              {userSkills.length === 0 && (
                <p className="text-yellow-500 text-sm mt-2">
                  No skills available. Please add skills to your profile in the settings.
                </p>
              )}
              {errorUserSkills && <p className="text-red-500 text-sm mt-2">{errorUserSkills}</p>}
              <textarea
                name="description"
                value={newSkill.description}
                onChange={handleNewSkillChange}
                placeholder="Skill Description"
                rows="4"
                className={`w-full py-3 px-4 rounded-xl ${darkMode ? 'bg-[#2c3e50] text-white' : 'bg-gray-100 text-gray-800'
                  } border border-[#ff7f50]`}
              />
              <CustomDropdown
                name="wantsSkill"
                value={newSkill.wantsSkill}
                onChange={handleNewSkillChange}
                options={[
                  { value: 'frontend', label: 'Frontend Development' },
                  { value: 'backend', label: 'Backend Development' },
                  { value: 'graphicDesign', label: 'Graphic Design' },
                  { value: 'seo', label: 'SEO' },
                  { value: 'marketing', label: 'Digital Marketing' },
                  { value: 'dataAnalysis', label: 'Data Analysis' },
                  { value: 'contentWriting', label: 'Content Writing' },
                  { value: 'javascript', label: 'JavaScript' },
                  { value: 'python', label: 'Python' },
                  { value: 'uiuxDesign', label: 'UI/UX Design' },
                ]}
                placeholder="Select Desired Skills"
                multiple
              />
            </div>
            {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handlePostNewSkill}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #ff7f50, #ffbb91)' }}
              >
                Post Skill
              </button>
              <button
                onClick={closePostSkillModal}
                className="w-full py-3 rounded-xl text-[#ff7f50] font-semibold border-2 border-[#ff7f50] hover:bg-[#ff7f50] hover:text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded-3xl p-8 w-96 max-w-full shadow-lg border border-white/20 ${darkMode ? 'bg-[#1f2937]' : 'bg-white'
              }`}
          >
            <h3 className="text-2xl font-bold mb-6 text-white">Select Skill to Offer</h3>
            <div className="space-y-4">
              <CustomDropdown
                name="offeredSkill"
                value={selectedOfferedSkill}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions || [], (option) => option.value);
                  setSelectedOfferedSkill(selectedValues);
                }}
                options={userSkills.map((skill) => ({
                  value: skill.title,
                  label: skill.title,
                }))}
                placeholder="Select Offered Skills"
                multiple
              />
              {userSkills.length === 0 && (
                <p className="text-yellow-500 text-sm mt-2">
                  No skills available. Please add skills to your profile in the settings.
                </p>
              )}
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Requesting: {selectedSkill?.title}
              </p>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSwapSubmit}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #ff7f50, #ffbb91)' }}
                disabled={userSkills.length === 0}
              >
                Send Swap Request
              </button>
              <button
                onClick={closeSwapModal}
                className="w-full py-3 rounded-xl text-[#ff7f50] font-semibold border-2 border-[#ff7f50] hover:bg-[#ff7f50] hover:text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Dashboard;