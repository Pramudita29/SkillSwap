import { useEffect, useState } from "react";
import { ArrowRightLeft } from "../icons/index";
import api from "../utils/api";
import TransactionCard from "./TransactionCard";

const TransactionsView = ({ darkMode = true, newTransaction, setNewTransaction, userId: propUserId }) => {
    const [transactions, setTransactions] = useState([]);
    const [filterType, setFilterType] = useState(() => localStorage.getItem("transactionFilterType") || "all");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progressValues, setProgressValues] = useState(() => {
        const saved = localStorage.getItem("transactionProgress");
        return saved ? JSON.parse(saved) : {};
    });

    const userId = propUserId || localStorage.getItem("userId");
    console.log("TransactionsView: userId source:", propUserId ? "prop" : "localStorage", "value:", userId);

    useEffect(() => {
        if (!userId) {
            console.error("TransactionsView: userId is undefined");
            setError("User ID is missing. Please log in.");
            setIsLoading(false);
            return;
        }
        console.log("TransactionsView: useEffect triggered with userId:", userId);
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const res = await api.get("/transactions");
                console.log("Raw transactions response:", res);
                const userTransactions = Array.isArray(res)
                    ? res.filter((t) => t.userId === userId || t.userId._id === userId)
                    : [];
                console.log("Filtered transactions:", userTransactions);
                if (newTransaction && !userTransactions.some((t) => t._id === newTransaction._id)) {
                    setTransactions([newTransaction, ...userTransactions]);
                    setNewTransaction(null);
                } else {
                    setTransactions(userTransactions);
                }
            } catch (err) {
                console.error("Error fetching transactions:", err);
                setError("Failed to load transactions. Please try again.");
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, [newTransaction, setNewTransaction, userId]);

    useEffect(() => {
        localStorage.setItem("transactionFilterType", filterType);
    }, [filterType]);

    useEffect(() => {
        localStorage.setItem("transactionProgress", JSON.stringify(progressValues));
    }, [progressValues]);

    const filteredTransactions = Array.isArray(transactions)
        ? transactions.filter(
            (transaction) =>
                filterType === "all" ||
                (transaction.type && transaction.type.toLowerCase() === filterType.toLowerCase())
        )
        : [];

    const handleFilterChange = (type) => {
        setFilterType(type);
    };

    const getCardGradient = (status) => {
        switch (status) {
            case "active":
                return darkMode
                    ? "bg-gradient-to-r from-emerald-500 to-green-600"
                    : "bg-gradient-to-r from-green-400 to-lime-500";
            case "completed":
                return darkMode
                    ? "bg-gradient-to-r from-yellow-500 to-amber-600"
                    : "bg-gradient-to-r from-orange-400 to-amber-500";
            case "pending":
                return darkMode
                    ? "bg-gradient-to-r from-orange-500 to-red-600"
                    : "bg-gradient-to-r from-red-400 to-orange-500";
            default:
                return darkMode
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                    : "bg-gradient-to-r from-blue-400 to-cyan-500";
        }
    };

    const totalActive = transactions.filter((t) => t.type === "active").length;
    const totalCompleted = transactions.filter((t) => t.type === "completed").length;
    const totalPending = transactions.filter((t) => t.type === "pending").length;

    const handleUpdateProgress = async (transactionId, newProgress) => {
        try {
            const newStatus = newProgress >= 100 ? "completed" : newProgress > 0 ? "active" : "pending";
            const response = await api.put("/transactions/update-progress", { transactionId, progress: newProgress, type: newStatus });
            if (response) {
                setTransactions((prevTransactions) =>
                    prevTransactions.map((transaction) =>
                        transaction._id === transactionId ? { ...transaction, progress: newProgress, type: newStatus } : transaction
                    )
                );
                setProgressValues((prev) => ({ ...prev, [transactionId]: newProgress }));
            }
        } catch (error) {
            console.error("Error updating progress:", error);
            setError("Failed to update progress. Please try again.");
        }
    };

    const handleSaveRating = async (userId, transactionId, rating) => {
        try {
            if (!userId) {
                setError("User ID is missing. Please log in.");
                return;
            }
            console.log("Saving rating:", { userId, transactionId, rating });
            const response = await api.put("/transactions/update-rating", { userId, transactionId, rating });
            if (response && response.status !== 404 && response.status !== 403) {
                const { transaction, avgRating } = response;
                setTransactions((prevTransactions) =>
                    prevTransactions.map((t) =>
                        t._id === transactionId ? { ...t, userRating: transaction.userRating, partnerRating: transaction.partnerRating } : t
                    )
                );
                console.log("Rating saved, new avgRating for user:", avgRating);
            } else if (response?.status === 404) {
                setError("Transaction not found.");
            } else if (response?.status === 403) {
                setError("You are not authorized to rate this transaction.");
            } else {
                setError("Failed to save rating. Please try again.");
            }
        } catch (error) {
            console.error("Error saving rating:", error);
            setError(`Failed to save rating: ${error.message}`);
        }
    };

    if (!userId) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500 text-lg">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                User ID is missing. Please log in.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-lg">Loading transactions...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500 text-lg">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 sm:p-6 md:p-8 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">Transactions Dashboard</h1>
                <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Filter Transactions</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {["all", "active", "completed", "pending"].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleFilterChange(type)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize
              ${filterType === type
                                ? `${getCardGradient(type)} text-white shadow-md`
                                : darkMode
                                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Active", count: totalActive, type: "active", status: "Active Transactions" },
                    { label: "Completed", count: totalCompleted, type: "completed", status: "Completed Transactions" },
                    { label: "Pending", count: totalPending, type: "pending", status: "Pending Transactions" },
                ].map(({ label, count, type, status }) => (
                    <div
                        key={type}
                        className={`p-6 rounded-xl ${getCardGradient(type)} shadow-lg transform hover:scale-105 transition-transform duration-200`}
                    >
                        <h2 className="text-lg font-semibold text-white">{label}</h2>
                        <p className="text-3xl font-bold text-white">{count}</p>
                        <p className="text-sm text-white mt-2">{status}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                        <TransactionCard
                            key={transaction._id}
                            transaction={transaction}
                            darkMode={darkMode}
                            onUpdateProgress={handleUpdateProgress}
                            initialProgress={progressValues[transaction._id] !== undefined ? progressValues[transaction._id] : transaction.progress || 0}
                            userId={userId}
                            onSaveRating={handleSaveRating}
                            className="transform hover:scale-102 transition-transform duration-150"
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">No transactions found for this filter.</div>
                )}
            </div>
        </div>
    );
};

export default TransactionsView;