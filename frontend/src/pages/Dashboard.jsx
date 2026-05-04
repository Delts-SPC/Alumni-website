import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { LogOut, RefreshCw, Search, Users, MessageSquare, Lightbulb, ShieldCheck, Activity } from "lucide-react";
import { logout } from "@/lib/auth";
import { fetchTable } from "@/lib/db";

const TABS = [
  { key: "alumni_profiles", label: "Alumni", icon: Users },
  { key: "priorities", label: "Specific Challenges", icon: MessageSquare },
  { key: "expertise", label: "Expertise Offered", icon: Lightbulb },
  { key: "engagement_entries", label: "Engagements", icon: Activity },
  { key: "consent", label: "Consent", icon: ShieldCheck },
];

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function truncate(s, n = 80) {
  if (!s) return "";
  const str = typeof s === "string" ? s : JSON.stringify(s);
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function StatCard({ label, value, Icon }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-sm" data-testid={`stat-${label}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs tracking-[0.2em] uppercase text-slate-500 font-semibold">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[#6B2C91]" />
      </div>
      <div className="font-serif text-3xl text-slate-900">{value}</div>
    </div>
  );
}

function renderTable(table, rows, q) {
  const ql = q.trim().toLowerCase();
  const filtered = ql
    ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(ql))
    : rows;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm border border-dashed border-slate-200 rounded-sm">
        No records yet.
      </div>
    );
  }

  if (table === "alumni_profiles") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Chapter</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                {[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}
              </TableCell>
              <TableCell>{r.email}</TableCell>
              <TableCell>{r.chapter || "—"}</TableCell>
              <TableCell>{r.grad_year || "—"}</TableCell>
              <TableCell>{r.phone || "—"}</TableCell>
              <TableCell>{formatDate(r.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (table === "priorities") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Situation</TableHead>
            <TableHead>Why now</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="max-w-[280px]">{truncate(r.situation_description, 140)}</TableCell>
              <TableCell className="max-w-[200px]">{truncate(r.why_matters, 100)}</TableCell>
              <TableCell className="max-w-[200px]">{truncate(r.desired_outcome, 100)}</TableCell>
              <TableCell>{r.time_commitment || "—"}</TableCell>
              <TableCell>{r.budget_expectation || "—"}</TableCell>
              <TableCell>{formatDate(r.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (table === "expertise") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Expertise</TableHead>
            <TableHead>Problems they help solve</TableHead>
            <TableHead>Open to interview</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="max-w-[280px]">{truncate(r.expertise_items, 140)}</TableCell>
              <TableCell className="max-w-[280px]">{truncate(r.problems_to_solve, 140)}</TableCell>
              <TableCell>{r.interview_interest ? "Yes" : "No"}</TableCell>
              <TableCell>{formatDate(r.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (table === "engagement_entries") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Alumni ID</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.source}</TableCell>
              <TableCell>{r.stage}</TableCell>
              <TableCell className="font-mono text-xs">{r.alumni_id?.slice(0, 8)}…</TableCell>
              <TableCell>{formatDate(r.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (table === "consent") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumni ID</TableHead>
            <TableHead>Program-only</TableHead>
            <TableHead>Share with Central Office</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.alumni_id?.slice(0, 8)}…</TableCell>
              <TableCell>{r.program_only_consent ? "Yes" : "No"}</TableCell>
              <TableCell>{r.share_with_central_office ? "Yes" : "No"}</TableCell>
              <TableCell>{formatDate(r.timestamp)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    alumni_profiles: [],
    priorities: [],
    expertise: [],
    engagement_entries: [],
    consent: [],
  });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [active, setActive] = useState("alumni_profiles");

  async function load() {
    setLoading(true);
    try {
      const results = await Promise.all(
        TABS.map((t) => fetchTable(t.key).catch(() => []))
      );
      const next = {};
      TABS.forEach((t, i) => {
        next[t.key] = results[i];
      });
      setData(next);
    } catch (e) {
      toast.error("Failed to load data.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard-page">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#6B2C91] flex items-center justify-center text-white font-serif text-lg">
              Δ
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-slate-500 font-semibold">
                Admin Dashboard
              </p>
              <h1 className="font-serif text-xl text-slate-900">Delt Alumni Excellence Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={load} disabled={loading} className="rounded-sm" data-testid="refresh-btn">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="rounded-sm" data-testid="logout-btn">
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <StatCard label="Alumni" value={data.alumni_profiles.length} Icon={Users} />
          <StatCard label="Challenges" value={data.priorities.length} Icon={MessageSquare} />
          <StatCard label="Expertise" value={data.expertise.length} Icon={Lightbulb} />
          <StatCard label="Engagements" value={data.engagement_entries.length} Icon={Activity} />
          <StatCard label="Consents" value={data.consent.length} Icon={ShieldCheck} />
        </div>

        {/* SEARCH + TABS */}
        <div className="bg-white border border-slate-200 rounded-sm">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <Tabs value={active} onValueChange={setActive} className="w-full">
              <TabsList className="bg-slate-100">
                {TABS.map((t) => (
                  <TabsTrigger key={t.key} value={t.key} data-testid={`tab-${t.key}`}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {TABS.map((t) => (
                <TabsContent key={t.key} value={t.key} className="mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="pl-9 rounded-sm"
                        data-testid={`search-${t.key}`}
                      />
                    </div>
                    <span className="text-xs text-slate-500 ml-auto">
                      {data[t.key].length} record{data[t.key].length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="overflow-x-auto" data-testid={`table-${t.key}`}>
                    {loading ? (
                      <div className="text-center py-16 text-slate-400 text-sm">Loading…</div>
                    ) : (
                      renderTable(t.key, data[t.key], q)
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
