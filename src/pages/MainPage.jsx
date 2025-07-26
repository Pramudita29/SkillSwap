import { useState } from "react";
import Dashboard from "../components/Dashboard";
import Reviews from "../components/MySkills";
import ProfileView from "../components/ProfileView";
import Sidebar from "../components/SideBar";
import SwapRequests from "../components/SwapRequest";
import Toast from "../components/Toast";
import TransactionsView from "../components/TransactionView";
import Messages from "../components/ViewMessages";

const MainPage = () => {
    const [toast, setToast] = useState(null);
    const [activeView, setActiveView] = useState("dashboard");
    const [darkMode, setDarkMode] = useState(false); // Changed to false for light mode
    const [newTransaction, setNewTransaction] = useState(null);

    const showToast = (message, type = "info") => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    const toggleTheme = () => setDarkMode((prev) => !prev);

    const renderView = () => {
        switch (activeView) {
            case "dashboard":
                return <Dashboard showToast={showToast} darkMode={darkMode} toggleTheme={toggleTheme} />;
            case "profile":
                return <ProfileView showToast={showToast} darkMode={darkMode} />;
            case "transactions":
                return <TransactionsView darkMode={darkMode} newTransaction={newTransaction} setNewTransaction={setNewTransaction} />;
            case "requests":
                return <SwapRequests darkMode={darkMode} showToast={showToast} setActiveView={setActiveView} setNewTransaction={setNewTransaction} />;
            case "skills":
                return <Reviews darkMode={darkMode} showToast={showToast} />;
            case "messages":
                return <Messages darkMode={darkMode} showToast={showToast} />;
            default:
                return <Dashboard showToast={showToast} darkMode={darkMode} toggleTheme={toggleTheme} />;
        }
    };

    return (
        <div className={`min-h-screen flex ${darkMode ? "bg-[#121b2b]" : "bg-[#eaf2f7]"}`}>
            {/* Sidebar */}
            <Sidebar activeView={activeView} setActiveView={setActiveView} darkMode={darkMode} />

            {/* Main Content Area */}
            <main className="ml-64 p-8 flex-1 rounded-lg shadow-lg">
                <div className="relative z-10">{renderView()}</div>
            </main>

            {/* Toast Notifications */}
            {toast && <Toast {...toast} onClose={hideToast} />}
        </div>
    );
};

export default MainPage;