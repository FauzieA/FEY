import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "@/pages/DashboardPage";
import WorkoutHubPage from "@/pages/WorkoutHubPage.tsx";
import WorkoutPage from "@/pages/WorkoutPage";
import WeeklySummaryPage from "@/pages/WeeklySummaryPage";
import ProgressPage from "@/pages/ProgressPage";
import CharacterPage from "@/pages/CharacterPage";
import { BottomNav } from "@/components/common/BottomNav";
import DailyPage from "./pages/DailyPage";
import WeeklyPage from "./pages/WeeklyPage";
import ClassDayPage from "./pages/ClassDayPage";

// Import your seed initializer (adjust path if needed)
import { initializeDatabase } from "@/db/seed";

export default function App() {
  useEffect(() => {
    // Initializes default data and seeds mock sessions if database is fresh
    initializeDatabase();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Workout Section */}
        <Route path="workout" element={<WorkoutHubPage />} />
        <Route path="workout/session" element={<WorkoutPage />} />
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/weekly" element={<WeeklyPage />} />
        <Route path="/class-day" element={<ClassDayPage />} />

        {/* History / Summary Section */}
        <Route path="history" element={<WeeklySummaryPage />} />

        {/* Secondary Pages */}
        <Route path="progress" element={<ProgressPage />} />
        <Route path="character" element={<CharacterPage />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}