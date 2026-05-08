import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Dashboard from "./pages/dashboard/Dashboard";
import AddExpense from "./pages/expenses/AddExpense";
import Approvals from "./pages/expenses/Approvals";
import Contributions from "./pages/contributions/Contributions";
import OneToOne from "./pages/social/OneToOne";
import Personal from "./pages/finances/Personal";
import Namaz from "./pages/social/Namaz";
import AddMember from "./pages/room/AddMember";
import Todos from "./pages/tasks/Todo";
import Expenses from "./pages/expenses/Expenses";
import Savings from "./pages/finances/Savings";
import Accounts from "./pages/finances/Accounts";
import RoomSetup from "./pages/room/RoomSetup";
import NotFound from "./pages/NotFound";
import { SessionProvider } from "./contexts/SessionContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/contributions" element={<Contributions />} />
            <Route path="/one-to-one" element={<OneToOne />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/add-member" element={<AddMember />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/personal" element={<Personal />} />
            <Route path="/namaz" element={<Namaz />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/room-setup" element={<RoomSetup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
