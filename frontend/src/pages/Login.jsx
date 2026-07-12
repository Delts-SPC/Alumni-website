import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { login } from "@/lib/auth";
import { Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const ok = login(email, password);
    setBusy(false);
    if (ok) {
      toast.success("Signed in.");
      navigate("/dashboard");
    } else {
      toast.error("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6" data-testid="login-page">
      <div className="w-full max-w-md bg-white border border-slate-200 p-10 shadow-sm rounded-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-[#6B2C91] flex items-center justify-center text-white font-serif text-xl">
            Δ
          </div>
          <span className="text-xs tracking-[0.25em] uppercase font-semibold text-slate-600">
            Admin
          </span>
        </div>
        <h1 className="font-serif text-3xl text-slate-900 mb-2">Sign in</h1>
        <p className="text-sm text-slate-500 mb-8">
          RAH Delt — administrative access.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              data-testid="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              data-testid="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-[#6B2C91] hover:bg-[#562374] rounded-sm py-6"
            data-testid="login-submit"
          >
            <Lock className="h-4 w-4 mr-2" /> {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
