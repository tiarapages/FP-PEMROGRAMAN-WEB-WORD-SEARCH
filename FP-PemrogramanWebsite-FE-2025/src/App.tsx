// import { Routes, Route } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import Register from "./pages/Register";
// import Sandbox from "./pages/Sandbox";
// import Login from "./pages/Login";
// import ProfilePage from "./pages/ProfilePage";
// import MyProjectsPage from "./pages/MyProjectsPage";
// import CreateQuiz from "./pages/CreateQuiz";
// import CreateProject from "./pages/CreateProject";
// import EditQuiz from "./pages/EditQuiz";
// import Quiz from "./pages/Quiz";
// import ProtectedRoute from "./routes/ProtectedRoutes";

// function App() {
//   return (
//     <>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/sandbox" element={<Sandbox />} />
//         <Route path="/quiz/play/:id" element={<Quiz />} />

//         <Route element={<ProtectedRoute />}>
//           <Route path="/profile" element={<ProfilePage />} />
//           <Route path="/my-projects" element={<MyProjectsPage />} />
//           <Route path="/create-projects" element={<CreateProject />} />
//           <Route path="/create-quiz" element={<CreateQuiz />} />
//           <Route path="/quiz/edit/:id" element={<EditQuiz />} />
//         </Route>
//       </Routes>
//     </>
//   );
// }

// export default App;

import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Sandbox from "./pages/Sandbox";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import MyProjectsPage from "./pages/MyProjectsPage";
import CreateQuiz from "./pages/CreateQuiz";
import CreateWordSearch from "./pages/CreateWordSearch";
import CreateProject from "./pages/CreateProject";
import EditQuiz from "./pages/EditQuiz";
import Quiz from "./pages/Quiz";
import ProtectedRoute from "./routes/ProtectedRoutes";

// 1. Import Game Kamu
import WordSearchGame from "./pages/word-search";
import WordSearchNew from "./pages/word-search-new/WordSearchNew";
import WordSearchPlay from "./pages/word-search/WordSearchPlay";
import TestGamesPage from "./pages/TestGamesPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/quiz/play/:id" element={<Quiz />} />
        <Route path="/word-search-play/:gameId" element={<WordSearchPlay />} />

        {/* Test Page - Pilih game mana yang mau di-test */}
        <Route path="/test-games" element={<TestGamesPage />} />

        {/* 2. Route Game Kamu (WAJIB ADA) */}
        <Route path="/game/word-search" element={<WordSearchGame />} />
        
        {/* 3. Route Game BARU - Purple Theme */}
        <Route path="/word-search-new" element={<WordSearchNew />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route path="/create-projects" element={<CreateProject />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/create-word-search" element={<CreateWordSearch />} />
          <Route path="/quiz/edit/:id" element={<EditQuiz />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
