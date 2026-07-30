import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import HomeDashboardPage from "@/pages/HomeDashboardPage";
import TrainingPage from "@/pages/TrainingPage";
import FaithPage from "@/pages/FaithPage";
import HealthPage from "@/pages/HealthPage";
import LibraryPage from "@/pages/LibraryPage";
import PerfumeryPage from "@/pages/PerfumeryPage";
import WealthPage from "@/pages/WealthPage";
import LifePage from "@/pages/LifePage";
import CharacterHubPage from "@/pages/CharacterHubPage";
import ProgressPage from "@/pages/ProgressPage";

/* Original workout tracker screens, preserved in full */
import WorkoutDashboardPage from "@/pages/DashboardPage";
import WorkoutPage from "@/pages/WorkoutPage";
import WeeklySummaryPage from "@/pages/WeeklySummaryPage";
import EvolutionPage from "@/pages/EvolutionPage";
import CharacterPage from "@/pages/CharacterPage";
import DailyPage from "@/pages/DailyPage";
import WeeklyPage from "@/pages/WeeklyPage";
import ClassDayPage from "@/pages/ClassDayPage";

import { initializeDatabase } from "@/db/seed";

export default function App() {
  useEffect(() => {
    // Initializes default data and seeds sample content if the database is fresh
    void initializeDatabase();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<HomeDashboardPage />} />

          {/* Modules */}
          <Route path="training" element={<TrainingPage />} />
          <Route path="faith" element={<FaithPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="perfumery" element={<PerfumeryPage />} />
          <Route path="wealth" element={<WealthPage />} />
          <Route path="life" element={<LifePage />} />
          <Route path="character" element={<CharacterHubPage />} />
          <Route path="progress" element={<ProgressPage />} />

          {/* Original workout tracker routes */}
          <Route path="workout/session" element={<WorkoutPage />} />
          <Route path="workout/dashboard" element={<WorkoutDashboardPage />} />
          <Route path="daily" element={<DailyPage />} />
          <Route path="weekly" element={<WeeklyPage />} />
          <Route path="class-day" element={<ClassDayPage />} />
          <Route path="history" element={<WeeklySummaryPage />} />
          <Route path="weekly-summary" element={<WeeklySummaryPage />} />
          <Route path="evolution" element={<EvolutionPage />} />
          <Route path="character/training" element={<CharacterPage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
