import { useState } from 'react';
import API from '../utils/api';

const ProfileSetupForm = ({ userId, onDone }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    location: '',
    bio: '',
    skillsOffered: '',
    skillsToLearn: '',
  });

  const totalSteps = 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        location: form.location.trim(),
        bio: form.bio.trim(),
        skillsOffered: form.skillsOffered
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        skillsToLearn: form.skillsToLearn
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      console.log('Submitting profile setup for userId:', userId);
      console.log('Payload:', payload);

      await API.put(`/users/${userId}/profile`, payload);
      onDone();
    } catch (err) {
      console.error('Profile update error:', err);
      alert(err.response?.data?.message || 'Profile update failed');
    }
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#fefefe] dark:bg-[#121b2b] text-gray-900 dark:text-white">
      <form
        onSubmit={step === totalSteps ? handleSubmit : (e) => e.preventDefault()}
        className="w-full max-w-md space-y-5 bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg backdrop-blur-xl"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">
          Step {step} of {totalSteps}
        </h2>

        <div className="w-full bg-gray-300 dark:bg-white/10 h-2 rounded-full mb-6">
          <div
            className="bg-orange-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {step === 1 && (
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-white/10 border border-gray-300/30 dark:border-white/20 text-gray-900 dark:text-white"
            autoFocus
          />
        )}

        {step === 2 && (
          <textarea
            name="bio"
            placeholder="Short bio"
            value={form.bio}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-white/10 border border-gray-300/30 dark:border-white/20 text-gray-900 dark:text-white"
            autoFocus
          />
        )}

        {step === 3 && (
          <>
            <input
              type="text"
              name="skillsOffered"
              placeholder="Skills you can offer (comma-separated)"
              value={form.skillsOffered}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-white/10 border border-gray-300/30 dark:border-white/20 text-gray-900 dark:text-white mb-4"
              autoFocus
            />

            <input
              type="text"
              name="skillsToLearn"
              placeholder="Skills you want to learn (comma-separated)"
              value={form.skillsToLearn}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-white/10 border border-gray-300/30 dark:border-white/20 text-gray-900 dark:text-white"
            />
          </>
        )}

        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl border text-sm border-gray-400 dark:border-white/20 text-gray-700 dark:text-white"
            >
              Back
            </button>
          )}

          <button
            type={step === totalSteps ? 'submit' : 'button'}
            onClick={step < totalSteps ? handleNext : undefined}
            className="ml-auto px-6 py-2 text-white rounded-xl font-semibold"
            style={{
              background: 'linear-gradient(135deg, #ff7f50, #ffbb91)',
            }}
          >
            {step === totalSteps ? 'Finish Setup' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetupForm;
