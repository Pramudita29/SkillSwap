
const StatsCard = ({ icon: Icon, title, value, change, gradient, darkMode }) => {
    return (
        <div
            className={`rounded-3xl p-6 shadow-md border transition-all duration-300 ${darkMode ? 'bg-[#1f2937] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'
                }`}
        >
            <div className="flex items-center gap-4">
                <div
                    className="p-3 rounded-full"
                    style={{
                        background: `linear-gradient(135deg, ${gradient})`,
                        color: darkMode ? '#fff' : '#1f2937', // light theme: dark icon color, dark theme: white
                    }}
                >
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <h2 className="text-2xl font-bold">{value}</h2>
                    <p className="text-xs mt-1 text-green-500">{change}</p>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
