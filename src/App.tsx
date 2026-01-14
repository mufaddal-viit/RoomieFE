import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Approvals from "./pages/Approvals";
import OneToOne from "./pages/OneToOne";
import Personal from "./pages/Personal";
import Namaz from "./pages/Namaz";
import AddMember from "./pages/AddMember";
import Todos from "./pages/Todo";
import Expenses from "./pages/Expenses";
import Savings from "./pages/Savings";
import Accounts from "./pages/Accounts";
import RoomSetup from "./pages/RoomSetup";
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
