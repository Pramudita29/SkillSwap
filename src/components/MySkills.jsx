import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import SkillCard from '../components/SkillCard';
import api from '../utils/api';

const MySkills = ({ darkMode, showToast }) => {
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [errorUserSkills, setErrorUserSkills] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPostSkillModal, setShowPostSkillModal] = useState(false);
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

  // Fetch user's posted skills and userSkills for offeredSkill dropdown
  useEffect(() => {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      setError('No user ID found. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get('/skills')
      .then((data) => {
        console.log('Fetched skills:', data);
        const filteredSkills = data.filter((skill) => {
          const postedBy = typeof skill.userId === 'string' ? skill.userId : skill.userId?._id;
          return postedBy === currentUserId;
        });
        const mappedSkills = filteredSkills.map((skill) => {
          const postedById = typeof skill.userId === 'string' ? skill.userId : skill.userId?._id;
          return {
            id: skill._id,
            title: skill.title,
            user: skill.name || 'Unknown',
            avatar: skill.name ? skill.name[0].toUpperCase() : skill.title[0].toUpperCase(),
            rating: skill.rating || 4.5,
            category: skill.category.map((cat) =>
              cat.charAt(0).toUpperCase() + cat.slice(1)
            ), // Capitalize category for display
            offeredSkill: skill.offeredSkill || [],
            wantsSkill: skill.wantsSkill.map((ws) => wantsSkillMap[ws] || ws), // Map wantsSkill to labels
            description: skill.description,
            location: skill.location || 'Unknown',
            timeAgo: skill.createdAt ? new Date(skill.createdAt).toLocaleDateString() : '',
            postedById,
          };
        });
        console.log('Mapped user skills:', mappedSkills);
        setSkills(mappedSkills);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

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

  const handlePostSkill = () => {
    setShowPostSkillModal(true);
    setErrorMessage('');
  };

  const closePostSkillModal = () => {
    setShowPostSkillModal(false);
    setNewSkill({ title: '', category: [], description: '', wantsSkill: [], offeredSkill: [] });
    setErrorMessage('');
  };

  const handleNewSkillChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category' || name === 'wantsSkill' || name === 'offeredSkill') {
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
        const currentUserId = localStorage.getItem('userId');
        api.get('/skills')
          .then((data) => {
            const filteredSkills = data.filter((skill) => {
              const postedBy = typeof skill.userId === 'string' ? skill.userId : skill.userId?._id;
              return postedBy === currentUserId;
            });
            const mappedSkills = filteredSkills.map((skill) => {
              const postedById = typeof skill.userId === 'string' ? skill.userId : skill.userId?._id;
              return {
                id: skill._id,
                title: skill.title,
                user: skill.name || 'Unknown',
                avatar: skill.name ? skill.name[0].toUpperCase() : skill.title[0].toUpperCase(),
                rating: skill.rating || 4.5,
                category: skill.category.map((cat) =>
                  cat.charAt(0).toUpperCase() + cat.slice(1)
                ),
                offeredSkill: skill.offeredSkill || [],
                wantsSkill: skill.wantsSkill.map((ws) => wantsSkillMap[ws] || ws),
                description: skill.description,
                location: skill.location || 'Unknown',
                timeAgo: skill.createdAt ? new Date(skill.createdAt).toLocaleDateString() : '',
                postedById,
              };
            });
            setSkills(mappedSkills);
            setError('');
          })
          .catch((err) => setError(err.message));
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
      .catch((err) => {
        console.error('Error posting skill:', err.message);
        setErrorMessage(err.message || 'Failed to post skill.');
      });
  };

  const handleDeleteSkill = async (skillId, skillTitle) => {
    if (!window.confirm(`Are you sure you want to delete the skill "${skillTitle}"?`)) {
      return;
    }
    try {
      await api.delete(`/skills/${skillId}`);
      showToast('Skill deleted successfully!', 'success');
      const currentUserId = localStorage.getItem('userId');
      api.get('/skills')
        .then((data) => {
          const filteredSkills = data.filter((skill) => {
            const postedBy = typeof skill.userId === 'string' ? skill.userId : skill.userId?._id;
            return postedBy === currentUserId;
          });
          const mappedSkills = filteredSkills.map((skill) => {
            const postedById = typeof skill.userId === 'string' ? skill.userId : skill.userId?._id;
            return {
              id: skill._id,
              title: skill.title,
              user: skill.name || 'Unknown',
              avatar: skill.name ? skill.name[0].toUpperCase() : skill.title[0].toUpperCase(),
              rating: skill.rating || 4.5,
              category: skill.category.map((cat) =>
                cat.charAt(0).toUpperCase() + cat.slice(1)
              ),
              offeredSkill: skill.offeredSkill || [],
              wantsSkill: skill.wantsSkill.map((ws) => wantsSkillMap[ws] || ws),
              description: skill.description,
              location: skill.location || 'Unknown',
              timeAgo: skill.createdAt ? new Date(skill.createdAt).toLocaleDateString() : '',
              postedById,
            };
          });
          setSkills(mappedSkills);
          setError('');
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
        .catch((err) => setError(err.message));
    } catch (err) {
      console.error('Error deleting skill:', err.message);
      showToast(`Failed to delete skill: ${err.message}`, 'error');
    }
  };

  return (
    <div className={`min-h-screen p-6 transition-colors ${darkMode ? 'bg-[#121b2b]' : 'bg-[#eaf2f7]'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-3xl font-extrabold mb-2 ${darkMode ? 'text-white' : 'text-[#112233]'}`}>
            My Posted Skills
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>View and manage your posted skills</p>
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

      <div
        className={`rounded-3xl p-6 border shadow-lg ${darkMode ? 'bg-[#1f2937] border-white/10' : 'bg-white border-gray-200'}`}
      >
        {loading ? (
          <p className={`text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading skills...</p>
        ) : error ? (
          <p className="text-center text-red-500">Failed to load skills: {error}</p>
        ) : skills.length === 0 ? (
          <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No skills posted yet. Use the button above to add a skill.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {skills.map((skill) => (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative pt-10">
                    <SkillCard skill={skill} darkMode={darkMode} disabled={true} />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteSkill(skill.id, skill.title)}
                      className="absolute top-2 right-2 p-2 rounded-full text-white font-semibold flex items-center gap-1 z-10"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #f87171)',
                        boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
                      }}
                      aria-label={`Delete skill ${skill.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs">Delete</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
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
    </div>
  );
};

export default MySkills;