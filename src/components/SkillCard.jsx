import { Star } from 'lucide-react';

const SkillCard = ({ skill, onSwapRequest, darkMode = true, disabled = false }) => (
  <div
    className="group relative backdrop-blur-xl rounded-3xl p-6 border hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
    style={{
      backgroundColor: darkMode ? 'rgba(20, 30, 50, 0.6)' : '#fff',
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.3)',
      boxShadow: darkMode ? '0 0 0 1px rgba(255, 255, 255, 0.1)' : '0 0 0 1px rgba(255, 127, 80, 0.1)',
    }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
          style={{
            background: 'linear-gradient(135deg, #ff7f50, #ffbb91)',
          }}
        >
          {skill.avatar}
        </div>
        <div>
          <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-[#112233]'}`}>{skill.title}</h3>
          <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>{skill.user}</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{skill.rating}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{skill.timeAgo}</span>
        <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{skill.location}</div>
      </div>
    </div>

    <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{skill.description}</p>

    {Array.isArray(skill.tags) && skill.tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {skill.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: darkMode ? 'rgba(255, 127, 80, 0.2)' : 'rgba(255, 127, 80, 0.15)',
              color: '#ff7f50',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    )}

    <div className="flex flex-col gap-2 text-sm mb-4">
      <div>
        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Offers: </span>
        <span className={`font-medium ${darkMode ? 'text-white' : 'text-[#112233]'}`}>
          {Array.isArray(skill.offeredSkill) ? skill.offeredSkill.join(', ') : skill.offeredSkill || 'None'}
        </span>
      </div>
      <div>
        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Wants: </span>
        <span className={`font-medium ${darkMode ? 'text-white' : 'text-[#112233]'}`}>
          {Array.isArray(skill.wantsSkill) ? skill.wantsSkill.join(', ') : skill.wantsSkill || 'None'}
        </span>
      </div>
    </div>

    <div className="flex items-center justify-end">
      <button
        onClick={() => onSwapRequest(skill)}
        disabled={disabled}
        className={`px-4 py-2 text-white rounded-xl transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
          }`}
        style={{
          background: disabled
            ? 'linear-gradient(135deg, #6b7280, #9ca3af)' // Gray gradient for disabled
            : 'linear-gradient(135deg, #ff7f50, #ffbb91)', // Original gradient
          boxShadow: disabled ? 'none' : '0 4px 12px rgba(255, 127, 80, 0.4)',
        }}
      >
        Request Swap
      </button>
    </div>
  </div>
);

export default SkillCard;