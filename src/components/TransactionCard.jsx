import { format } from "date-fns";
import { Calendar, CheckCircle, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../utils/api"; // Assuming you have a utility to make API calls

const TransactionCard = ({
  transaction,
  darkMode = true,
  onUpdateProgress,
  initialProgress,
  userId: propUserId,
  onSaveRating,
}) => {
  const [progress, setProgress] = useState(() => {
    const progressValue =
      initialProgress !== undefined ? Number(initialProgress) : transaction.progress || 0;
    return transaction.type === "completed" ? 100 : progressValue;
  });
  const [status, setStatus] = useState(() => {
    const progressValue =
      initialProgress !== undefined ? Number(initialProgress) : transaction.progress || 0;
    return transaction.type === "completed" ? "completed" : progressValue > 0 ? "active" : "pending";
  });
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [partnerName, setPartnerName] = useState(transaction.partner || "Unknown");

  const userId = propUserId || localStorage.getItem("userId");

  // Fetch partner name based on partnerId
  useEffect(() => {
    const fetchPartnerName = async () => {
      if (!transaction?.partnerId) {
        console.warn("No partnerId provided for transaction:", transaction?._id);
        setPartnerName(transaction.partner || "Unknown");
        return;
      }

      const partnerId = typeof transaction.partnerId === "object" && transaction.partnerId._id
        ? transaction.partnerId._id
        : transaction.partnerId;

      console.log("Fetching name for partnerId:", partnerId);

      try {
        const response = await api.get(`/users/${partnerId}`);
        console.log("API response:", {
          url: `/users/${partnerId}`,
          status: response.status,
          data: response.data,
          rawResponse: response,
        });

        // Check if response itself is the user data (non-standard API)
        const partnerData = response.data?.user || response.data || response;

        if (!partnerData || typeof partnerData !== "object") {
          console.warn("Invalid or empty partner data for partnerId:", partnerId, {
            responseData: response.data,
            rawResponse: response,
          });
          setPartnerName(transaction.partner || "Unknown");
          return;
        }

        const name = partnerData.name || partnerData.username || transaction.partner || "Unknown";
        console.log("Partner name extracted:", name);
        setPartnerName(name);
      } catch (error) {
        console.error("Failed to fetch partner name for partnerId:", partnerId, {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
          } : "No response",
          request: error.config ? {
            url: error.config.url,
            headers: error.config.headers,
          } : "No request info",
        });
        setPartnerName(transaction.partner || "Unknown");
      }
    };

    fetchPartnerName();
  }, [transaction?.partnerId, transaction?._id, transaction.partner]);

  useEffect(() => {
    const progressValue =
      initialProgress !== undefined ? Number(initialProgress) : transaction.progress || 0;
    const newProgress = transaction.type === "completed" ? 100 : progressValue;
    const newStatus =
      transaction.type === "completed" ? "completed" : progressValue > 0 ? "active" : "pending";
    if (progress !== newProgress || status !== newStatus) {
      setProgress(newProgress);
      setStatus(newStatus);
    }

    if (newStatus === "completed" && userId) {
      if (!transaction.userId?._id || !transaction.partnerId?._id) {
        console.error("Invalid transaction data", {
          transactionId: transaction._id,
          userId: transaction.userId?._id,
          partnerId: transaction.partnerId?._id,
        });
        setShowRatingPopup(false);
        return;
      }
      if (userId === transaction.userId._id && !transaction.userRating) setShowRatingPopup(true);
      else if (userId === transaction.partnerId._id && !transaction.partnerRating) setShowRatingPopup(true);
    } else if (!userId) {
      console.error("userId is undefined", { transactionId: transaction._id });
      setShowRatingPopup(false);
    }
  }, [
    initialProgress,
    transaction.progress,
    transaction.type,
    transaction._id,
    transaction.userRating,
    transaction.partnerRating,
    transaction.userId,
    transaction.partnerId,
    userId,
  ]);

  const getStatusColor = (type) => {
    switch (type) {
      case "completed":
        return "text-green-400 bg-green-500/20";
      case "active":
        return "text-[#ff7f50] bg-[#ff7f50]/20";
      case "pending":
        return "text-yellow-400 bg-yellow-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "active":
        return <Clock className="w-4 h-4" />;
      case "pending":
        return <Calendar className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleProgressChange = (e) => {
    const newValue = Math.max(0, Math.min(100, Number(e.target.value)));
    if (newValue !== progress) {
      setProgress(newValue);
      const newStatus = newValue >= 100 ? "completed" : newValue > 0 ? "active" : "pending";
      setStatus(newStatus);
      onUpdateProgress(transaction._id, newValue);
    }
  };

  const handleRatingChange = (value) => {
    setRating(value);
    console.log("Selected Rating:", value);
  };

  const handleSaveRating = () => {
    console.log("Attempting to save rating:", { userId, transactionId: transaction._id, rating });
    if (rating > 0 && userId && transaction._id) {
      onSaveRating(userId, transaction._id, rating);
      setShowRatingPopup(false);
    } else {
      console.error("Save failed: Invalid rating, userId, or transactionId", { rating, userId, transactionId: transaction._id });
    }
  };

  const formattedDate = transaction.date ? format(new Date(transaction.date), "MMM dd, yyyy") : "Unknown date";

  return (
    <div className={`rounded-3xl p-6 border transition-all duration-300 ${darkMode ? "bg-[#1a2637] border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #ff7f50, #ffbb91)" }}
          >
            {partnerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h3 className={`font-medium ${darkMode ? "text-white" : "text-[#112233]"}`}>{transaction.skill || "No skill specified"}</h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>with {partnerName}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Trading for:</span>
          <span className={darkMode ? "text-white" : "text-[#112233]"}>{transaction.partnerSkill || "No skill specified"}</span>
        </div>
        <div className="flex justify-between">
          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Duration:</span>
          <span className={darkMode ? "text-white" : "text-[#112233]"}>{transaction.duration || "Not specified"}</span>
        </div>
        <div className="flex justify-between">
          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Started:</span>
          <span className={darkMode ? "text-white" : "text-[#112233]"}>{formattedDate}</span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Progress</span>
          <span className={darkMode ? "text-white" : "text-[#112233]"}>{progress}%</span>
        </div>
        <div className={`w-full rounded-full h-3 overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #ff7f50, #ffbb91)" }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
          className="w-full mt-3 cursor-pointer"
        />
      </div>

      {(transaction.userRating || transaction.partnerRating) && (
        <div className="mt-4 space-y-2">
          {transaction.userRating && (
            <div className="flex items-center gap-1">
              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Your Rating of Partner:</span>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < transaction.userRating ? "text-yellow-400 fill-current" : darkMode ? "text-gray-600" : "text-gray-400"}`}
                />
              ))}
            </div>
          )}
          {transaction.partnerRating && (
            <div className="flex items-center gap-1">
              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Partner's Rating of You:</span>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < transaction.partnerRating ? "text-yellow-400 fill-current" : darkMode ? "text-gray-600" : "text-gray-400"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showRatingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${darkMode ? "bg-[#1a2637] text-white" : "bg-white text-gray-900"}`}>
            <h3 className="text-lg font-semibold mb-4">Rate this Transaction</h3>
            <p className="text-sm mb-4">
              {userId === transaction.userId?._id
                ? `Rate ${transaction.partner || "Partner"}`
                : `Rate ${transaction.userId?.name || "Requester"}`}
            </p>
            <div className="flex gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 cursor-pointer ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  onClick={() => handleRatingChange(i + 1)}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setShowRatingPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleSaveRating}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
