import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Moon, Shield, Star, Sun, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import image from '../assets/image.png';


const features = [
  {
    icon: Users,
    title: 'Build Connections',
    desc: 'Meet learners and mentors who inspire growth and collaboration.',
  },
  {
    icon: BookOpen,
    title: 'Skill Diversity',
    desc: 'From tech to crafts, explore a vast universe of knowledge.',
  },
  {
    icon: Star,
    title: 'Trusted Reviews',
    desc: 'Feedback-driven community to ensure quality and trust.',
  },
  {
    icon: Shield,
    title: 'Privacy Focused',
    desc: 'Your data and safety are our top priorities.',
  },
];

const floatingWords = [
  'Empowerment',
  'Innovation',
  'Curiosity',
  'Mastery',
  'Impact',
  'Collaboration',
  'Discovery',
  'Ambition',
];

function initializeWords() {
  return floatingWords.map(() => ({
    top: Math.random() * 80 + 10,
    left: Math.random() * 80 + 10,
    dx: (Math.random() - 0.5) * 0.15,
    dy: (Math.random() - 0.5) * 0.15,
  }));
}

export default function SkillSwapLanding({ onGetStarted }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [words, setWords] = useState(initializeWords);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const animationFrame = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      setWords((currentWords) =>
        currentWords.map(({ top, left, dx, dy }) => {
          let newTop = top + dy;
          let newLeft = left + dx;

          if (newTop < 5) {
            newTop = 5;
            dy = -dy;
          } else if (newTop > 95) {
            newTop = 95;
            dy = -dy;
          }

          if (newLeft < 5) {
            newLeft = 5;
            dx = -dx;
          } else if (newLeft > 95) {
            newLeft = 95;
            dx = -dx;
          }

          return { top: newTop, left: newLeft, dx, dy };
        })
      );
      animationFrame.current = requestAnimationFrame(animate);
    };
    animationFrame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame.current);
  }, []);

  const handleContactFormSubmit = (e) => {
    e.preventDefault();
    // Implement your form submission logic here (e.g., sending email or message)
    console.log('Message submitted:', { email, message });
  };

  return (
    <div
      className={`relative min-h-screen flex flex-col transition-colors duration-700 overflow-hidden ${darkMode ? 'bg-[#121b2b] text-white' : 'bg-[#eaf2f7] text-[#112233]'
        }`}
    >
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {words.map(({ top, left }, i) => {
          const fontSizes = ['1rem', '1.25rem', '1.5rem', '1.75rem'];
          const fontSize = fontSizes[i % fontSizes.length];
          const baseColor = darkMode ? '#ffbb91' : '#ff7f50';
          const mouseX = mouse.x * 5 * (i % 2 === 0 ? 1 : -1);
          const mouseY = mouse.y * 5 * (i % 2 === 0 ? 1 : -1);

          return (
            <motion.span
              key={floatingWords[i] + i}
              initial={false}
              style={{
                position: 'absolute',
                top: `${top}%`,
                left: `${left}%`,
                fontSize,
                fontWeight: 600,
                color: `rgba(${darkMode ? '255,187,145' : '255,127,80'}, 0.85)`,
                whiteSpace: 'nowrap',
                userSelect: 'none',
                filter: `drop-shadow(0 0 3px ${baseColor})`,
                cursor: 'default',
                x: mouseX,
                y: mouseY,
                transform: 'translate(-50%, -50%)',
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              {floatingWords[i]}
            </motion.span>
          );
        })}
      </div>

      <nav
        className="fixed top-0 left-0 right-0 z-50 px-12 py-6 backdrop-filter backdrop-blur-xl border-b"
        style={{
          backgroundColor: darkMode
            ? 'rgba(20, 30, 50, 0.55)'
            : 'rgba(255, 255, 255, 0.25)',
          borderColor: darkMode
            ? 'rgba(255,255,255,0.12)'
            : 'rgba(0,0,0,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <div
              className="p-2 rounded-lg"
              style={{
                background: `linear-gradient(135deg, #ff7f50, #ffbb91)`,
                boxShadow: `0 4px 10px #ff7f5040`,
              }}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-wide">SkillSwap</span>
          </div>
          <div className="flex items-center gap-8">
            {['#features', '#about', '#contact'].map((href, i) => (
              <a
                key={href}
                href={href}
                className="text-lg font-medium hover:underline transition-colors"
                style={{ color: darkMode ? '#eee' : '#333' }}
              >
                {['Features', 'About', 'Contact'][i]}
              </a>
            ))}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full transition-colors"
              style={{
                backgroundColor: darkMode ? '#ff7f50' : 'transparent',
                color: darkMode ? '#fff' : '#ff7f50',
                border: `2px solid #ff7f50`,
              }}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <section
        className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-12 py-36 mt-24 z-10"
        style={{
          backgroundColor: darkMode
            ? 'rgba(20, 30, 50, 0.55)'
            : 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(24px)',
          borderRadius: '24px',
          border: darkMode
            ? '1px solid rgba(255,255,255,0.15)'
            : '1px solid rgba(255,255,255,0.3)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1"
        >
          <h1 className="text-5xl font-extrabold leading-tight mb-8 select-none">
            Swap your skills,
            <br />
            <span
              style={{
                background: `linear-gradient(90deg, #ff7f50, #ffbb91)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              grow your future.
            </span>
          </h1>
          <p className="text-lg max-w-lg mb-12 opacity-80 select-none">
            Join a sleek, modern platform that connects learners and teachers — sharing knowledge with style and
            simplicity.
          </p>
          <div className="flex gap-6 mt-6">
            <button
              onClick={onGetStarted}
              className="px-10 py-3 rounded-3xl font-semibold shadow-lg text-white text-lg flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #ff7f50, #ffbb91)',
                boxShadow: '0 6px 12px #ff7f50b0',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>

            <button
              className="px-10 py-3 rounded-3xl font-semibold text-lg border-2 transition-colors duration-200 hover:bg-[#ff7f5022]"
              style={{
                borderColor: '#ff7f50',
                color: '#ff7f50',
                backgroundColor: 'transparent',
              }}
            >
              Learn More
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          whileHover={{ scale: 1.05, rotate: 3 }}
          className="flex-1 flex justify-center"
        >
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80"
            alt="Creative teamwork"
            className="rounded-3xl shadow-xl max-w-full"
            style={{ maxHeight: 400, userSelect: 'none' }}
            draggable={false}
          />
        </motion.div>
      </section>

      {/* Learn Teach Repeat */}
      <section className="max-w-4xl mx-auto px-12 py-20 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-6"
        >
          Learn. Teach. Repeat.
        </motion.h2>
        <p className="text-lg opacity-80 mt-6">
          Whether you're a seasoned expert or just starting out, SkillSwap is your place to connect, grow, and thrive — one skill at a time.
        </p>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-12 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 z-10"
      >
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={i}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 8px 32px #ff7f5040`,
            }}
            className="backdrop-filter backdrop-blur-xl rounded-3xl p-10 border border-white/20"
            style={{
              backgroundColor: darkMode
                ? 'rgba(20, 30, 50, 0.6)'
                : 'rgba(255, 255, 255, 0.25)',
              borderColor: darkMode
                ? 'rgba(255, 255, 255, 0.15)'
                : '#ff7f5030',
            }}
          >
            <div
              className="w-16 h-16 mb-6 flex items-center justify-center rounded-xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, #ff7f50, #ffbb91)`,
                color: '#fff',
              }}
            >
              <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">{title}</h3>
            <p className="leading-relaxed opacity-80">{desc}</p>
          </motion.div>
        ))}
      </section>



      {/* About Us Section */}
      <section id="about" className="max-w-7xl mx-auto px-12 py-20 text-center relative z-10">
        {/* Full section with Glass Effect */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-xl p-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold mb-6"
          >
            About Us
          </motion.h2>

          <div className="flex justify-center items-center mt-8 max-w-7xl mx-auto px-12">
            {/* Text Section */}
            <div className="flex-1 pr-12">
              <p className="text-lg opacity-80 mt-6 max-w-2xl mx-auto">
                SkillSwap is more than just a platform; it's a community of passionate individuals seeking to learn, share,
                and grow together. Whether you're looking to expand your knowledge, connect with mentors, or teach others, we're
                here to provide the tools and the environment to help you succeed.
              </p>
            </div>

            {/* Image Section */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -50 }}  // Adding animation
              animate={{ opacity: 1, x: 0 }}    // Image moves from the left
              whileHover={{ scale: 1.05 }}      // Image grows on hover
              transition={{ duration: 0.8 }}
            >
              <img
                src={image}  // Replace with the correct image path
                alt="Team collaboration"
                className="rounded-lg shadow-xl max-w-lg h-auto transition-all duration-300 transform"
              />
            </motion.div>
          </div>
        </div>
      </section>



      {/* Contact Us Section */}
      <section id="contact" className="max-w-7xl mx-auto px-12 py-20 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-6"
        >
          Contact Us
        </motion.h2>
        <p className="text-lg opacity-80 mt-6 max-w-2xl mx-auto">
          Have any questions or want to learn more? Reach out to us! We're here to help and we'd love to hear from you.
        </p>
        <form className="mt-8 max-w-3xl mx-auto backdrop-blur-xl bg-white p-8 rounded-3xl" onSubmit={handleContactFormSubmit}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff7f50]"
            />
          </div>
          <div className="mb-6">
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows="4"
              className="w-full px-6 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff7f50]"
            />
          </div>
          <button
            type="submit"
            className="px-10 py-3 rounded-3xl font-semibold text-lg bg-[#ff7f50] text-white transition-all hover:bg-[#ffbb91]"
          >
            Message Us
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 z-10 text-sm opacity-70">
        © 2025 SkillSwap — Crafted with passion and glass.
      </footer>
    </div>
  );
}
