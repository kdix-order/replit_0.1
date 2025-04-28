import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Menu from "@/pages/menu";
import Cart from "@/pages/cart";
import OrderConfirmation from "@/pages/order-confirmation";
import OrderPickup from "@/pages/order-pickup";
import OrderHistory from "@/pages/order-history";
import Admin from "@/pages/admin";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/ui/provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Menu} />
      <Route path="/cart" component={Cart} />
      <Route path="/confirmation/:id" component={OrderConfirmation} />
      <Route path="/pickup/:id" component={OrderPickup} />
      <Route path="/history" component={OrderHistory} />
      <Route path="/admin" component={Admin} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#fff9dc]">
          <Header />
          <main className="flex-grow pb-16 md:pb-0">
            <Router />
          </main>
          <Footer />
          <BottomNav />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
