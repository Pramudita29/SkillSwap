import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import api from "../utils/api";

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  const regex = /^[a-fA-F0-9]{24}$/;
  return regex.test(id);
};

const SwapRequest = ({ showToast, darkMode, setActiveView, setNewTransaction, userId: propUserId }) => {
  const [requests, setRequests] = useState([]);
  const [hiddenRequestIds, setHiddenRequestIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = propUserId || localStorage.getItem("userId");
  console.log("SwapRequest: userId source:", propUserId ? "prop" : "localStorage", "value:", userId);

  const fetchSwapRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/swaps");
      console.log("Full API Response:", res);
      const data = Array.isArray(res) ? res : [];
      const enrichedData = data.map((req) => ({
        ...req,
        sender: req.fromUserId || { name: req.fromUserId?.name || "Unknown" },
        title: req.skillOffered || "No skill offered specified",
        description: req.skillRequested || "No skill requested specified",
      }));
      console.log("Data to set:", enrichedData);
      setRequests(enrichedData);
    } catch (err) {
      console.error("Error fetching swap requests:", err);
      showToast("Failed to fetch swap requests", "error");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideRequest = (id) => {
    setHiddenRequestIds((prev) => [...prev, id]);
  };

  const handleUnhideRequest = (id) => {
    setHiddenRequestIds((prev) => prev.filter((reqId) => reqId !== id));
  };

  const handleAction = async (id, status) => {
    try {
      await api.put(`/swaps/${id}`, { status });
      showToast(`Request ${status}`, "success");

      // Remove request from the UI after action
      setRequests(prevRequests => prevRequests.filter((request) => request._id !== id));

      if (status === "accepted") {
        if (!userId) throw new Error("User ID is missing. Please log in.");

        const request = requests.find((req) => req._id === id);
        if (!request) throw new Error("Swap request not found");

        console.log("Full Request Object:", request);

        const fromUserId = request.fromUserId?._id || request.fromUserId;
        const toUserId = request.toUserId?._id || request.toUserId;

        if (!fromUserId || !toUserId) throw new Error("Missing 'fromUserId' or 'toUserId'");
        if (!isValidObjectId(fromUserId) || !isValidObjectId(toUserId))
          throw new Error("Invalid 'fromUserId' or 'toUserId' format");

        let fromUserData, toUserData;
        try {
          const fromUserRes = await api.get(`/users/${fromUserId}`);
          fromUserData = fromUserRes.data || {};
        } catch (err) {
          console.error(`Error fetching user ${fromUserId}:`, err);
          fromUserData = {};
        }

        try {
          const toUserRes = await api.get(`/users/${toUserId}`);
          toUserData = toUserRes.data || {};
        } catch (err) {
          console.error(`Error fetching user ${toUserId}:`, err);
          toUserData = {};
        }

        if (!fromUserData || !toUserData) throw new Error("User or partner data could not be retrieved");

        const fetchPartnerName = async (userId, requestUserId) => {
          try {
            const res = await api.get(`/users/${userId}`);
            return res.data.name || res.data.username || res.data.email?.split("@")[0] || "Unknown";
          } catch (err) {
            console.error(`Failed to fetch partner name for ${userId}:`, err);
            const requestUser = request.fromUserId?._id === userId ? request.fromUserId : request.toUserId;
            return requestUser?.name || requestUser?.username || "Unknown";
          }
        };

        const partner1Name = toUserData.name || toUserData.username || (await fetchPartnerName(toUserId, toUserId)) || "Unknown";
        const partner2Name = fromUserData.name || fromUserData.username || (await fetchPartnerName(fromUserId, fromUserId)) || "Unknown";

        const user1Transaction = {
          userId: fromUserId,
          partnerId: userId,
          type: "pending",
          skill: request.skillOffered,
          partner: partner1Name,
          partnerSkill: request.skillRequested,
          date: new Date(),
          duration: request.duration || "Not specified",
          progress: 0,
        };

        const user2Transaction = {
          userId: userId,
          partnerId: fromUserId,
          type: "pending",
          skill: request.skillRequested,
          partner: partner2Name,
          partnerSkill: request.skillOffered,
          date: new Date(),
          duration: request.duration || "Not specified",
          progress: 0,
        };

        const [user1Res, user2Res] = await Promise.all([
          api.post("/transactions", user1Transaction),
          api.post("/transactions", user2Transaction),
        ]);

        showToast("Transactions created for both users", "success");

        setNewTransaction(user2Res.data);
        setActiveView("transactions");
      }

      // Refetch requests after action to keep the state updated
      fetchSwapRequests();
    } catch (err) {
      console.error("Error updating request:", err);
      showToast(err.message || "Failed to update request", "error");
    }
  };

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  console.log("Requests state:", requests);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Skill Swap Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No swap requests found.</p>
      ) : (
        <>
          {/* Your Requests (Sent by User) */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your Requests</h3>
            {requests.filter((r) => r.fromUserId._id === userId).length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No requests sent by you.</p>
            ) : (
              requests.filter((r) => r.fromUserId._id === userId).map((request) => (
                <div
                  key={request._id}
                  className="p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Skill Offered: {request.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sent to: {request.toUserId?.name || "Unknown"}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Skill Requested:</strong> {request.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, includeSeconds: false })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Pending Requests (For the receiver) */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Pending Requests</h3>
            {requests.filter((r) => r.status === "pending" && r.toUserId === userId).length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No pending requests for you.</p>
            ) : (
              requests.filter((r) => r.status === "pending" && r.toUserId === userId).map((request) => (
                <div
                  key={request._id}
                  className="p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Skill Offered: {request.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">From: {request.sender.name || "Unknown"}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Skill Requested:</strong> {request.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, includeSeconds: false })}
                  </p>
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => handleAction(request._id, "accepted")}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(request._id, "rejected")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Accepted Requests */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Accepted Requests</h3>
            {requests.filter((r) => r.status === "accepted").length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No accepted requests.</p>
            ) : (
              requests.filter((r) => r.status === "accepted").map((request) => (
                <div
                  key={request._id}
                  className="p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Skill Offered: {request.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">From: {request.sender.name || "Unknown"}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Skill Requested:</strong> {request.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, includeSeconds: false })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Declined Requests */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Declined Requests</h3>
            {requests.filter((r) => r.status === "rejected").length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No declined requests.</p>
            ) : (
              requests.filter((r) => r.status === "rejected").map((request) => (
                <div
                  key={request._id}
                  className="p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Skill Offered: {request.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">From: {request.sender.name || "Unknown"}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Skill Requested:</strong> {request.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, includeSeconds: false })}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SwapRequest;