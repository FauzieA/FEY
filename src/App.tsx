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
import CharacterProgressionPage from "@/pages/CharacterProgressionPage";

/* Original workout tracker screens, preserved in full */
import WorkoutPage from "@/pages/WorkoutPage";
import WeeklySummaryPage from "@/pages/WeeklySummaryPage";
import EvolutionPage from "@/pages/EvolutionPage";
import DailyPage from "@/pages/DailyPage";
import WeeklyPage from "@/pages/WeeklyPage";
import ClassDayPage from "@/pages/ClassDayPage";

import { initializeDatabase } from "@/db/seed";

export default function App() {
  useEffect(() => {
    // Initialize local database with seed data
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
          <Route path="character" element={<CharacterProgressionPage />} />

          {/* Original workout tracker routes */}
          <Route path="workout/session" element={<WorkoutPage />} />
          <Route path="daily" element={<DailyPage />} />
          <Route path="weekly" element={<WeeklyPage />} />
          <Route path="class-day" element={<ClassDayPage />} />
          <Route path="history" element={<WeeklySummaryPage />} />
          <Route path="weekly-summary" element={<WeeklySummaryPage />} />
          <Route path="evolution" element={<EvolutionPage />} />
    

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
