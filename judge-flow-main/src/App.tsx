import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import QuestionDetail from "./pages/QuestionDetail";
import Playground from "./pages/Playground";
import Submissions from "./pages/Submissions";
import AIReview from "./pages/AIReview";
import Contests from "./pages/Contests";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Auth routes without navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Main app routes with navbar */}
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/questions" element={<Questions />} />
                  <Route path="/questions/:id" element={<QuestionDetail />} />
                  <Route path="/playground" element={<Playground />} />
                  <Route path="/submissions" element={<Submissions />} />
                  <Route path="/ai-review/:submissionId" element={<AIReview />} />
                  <Route path="/contests" element={<Contests />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
