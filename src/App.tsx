import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
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
        </Route>
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}
