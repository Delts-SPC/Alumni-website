import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { upsertAlumnus, logEngagement, recordConsent, submitPriorities } from "@/lib/db";

const APPROACHES = [
  { id: "seminar", label: "A seminar" },
  { id: "weekend_retreat", label: "A weekend retreat" },
  { id: "week_retreat", label: "A week-long retreat" },
  { id: "group_work", label: "Group work" },
  { id: "individual_work", label: "Individual work" },
  { id: "virtual", label: "Virtual (online)" },
  { id: "in_person", label: "In-person" },
];

const TIME_OPTIONS = [
  { v: "a_day", l: "A day" },
  { v: "a_weekend", l: "A weekend" },
  { v: "a_week", l: "A week" },
  { v: "many_days_month", l: "Many days over a month" },
  { v: "many_days_year", l: "Many days over the next year" },
  { v: "other", l: "Something else" },
];

export default function SpecificChallengeDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    situation_description: "",
    why_matters: "",
    desired_outcome: "",
    approaches: [],
    other_approach: "",
    time_commitment: "",
    time_commitment_other: "",
    budget_expectation: "",
    first_name: "",
    last_name: "",
    university: "",
    chapter: "",
    greek_designation: "",
    grad_year: "",
    email: "",
    phone: "",
    linkedin: "",
    share_with_central_office: false,
  });

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function toggleApproach(id) {
    setForm((s) => ({
      ...s,
      approaches: s.approaches.includes(id)
        ? s.approaches.filter((a) => a !== id)
        : [...s.approaches, id],
    }));
  }

  function reset() {
    setStep(1);
    setSubmitting(false);
    setForm({
      situation_description: "",
      why_matters: "",
      desired_outcome: "",
      approaches: [],
      other_approach: "",
      time_commitment: "",
      time_commitment_other: "",
      budget_expectation: "",
      first_name: "",
      last_name: "",
      university: "",
      chapter: "",
      greek_designation: "",
      grad_year: "",
      email: "",
      phone: "",
      linkedin: "",
      share_with_central_office: false,
    });
  }

  function handleClose(o) {
    onOpenChange(o);
    if (!o) setTimeout(reset, 200);
  }

  function nextStep() {
    if (step === 1 && (!form.situation_description.trim() || !form.why_matters.trim() || !form.desired_outcome.trim())) {
      toast.error("Please complete all three questions.");
      return;
    }
    if (step === 4) return;
    setStep(step + 1);
  }

  async function handleSubmit() {
    if (!form.email.trim() || !form.first_name.trim() || !form.last_name.trim()) {
      toast.error("First name, last name, and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const alumniId = await upsertAlumnus({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone || null,
        university: form.university || null,
        chapter: form.chapter || null,
        greek_designation: form.greek_designation || null,
        grad_year: form.grad_year ? parseInt(form.grad_year, 10) : null,
        linkedin: form.linkedin || null,
      });
      await logEngagement(alumniId, "landing_page", "priority_list");
      await recordConsent(alumniId, {
        programOnly: true,
        shareCentral: form.share_with_central_office,
      });
      await submitPriorities(alumniId, {
        situation_description: form.situation_description,
        why_matters: form.why_matters,
        desired_outcome: form.desired_outcome,
        approaches: form.approaches,
        other_approach: form.other_approach || null,
        time_commitment: form.time_commitment || null,
        time_commitment_other: form.time_commitment_other || null,
        budget_expectation: form.budget_expectation || null,
      });
      toast.success("Thank you for sharing. We'll be in touch.");
      handleClose(false);
    } catch (e) {
      console.error(e);
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm"
        data-testid="specific-challenge-dialog"
      >
        <DialogHeader>
          <p className="text-xs tracking-[0.25em] uppercase text-[#6B2C91] font-semibold">
            Share Your Situation
          </p>
          <DialogTitle className="font-serif text-2xl md:text-3xl text-slate-900 leading-tight pr-8">
            What are you navigating right now?
          </DialogTitle>
          <DialogDescription className="text-slate-600 leading-relaxed">
            Describe the situation, decision, or challenge that matters most to you at this moment.
            The more we understand, the better we can build for you.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-1" />
        </div>

        {step === 1 && (
          <div className="space-y-5 mt-4" data-testid="challenge-step-1">
            <div>
              <Label htmlFor="sc-situation">Describe your situation *</Label>
              <p className="text-xs text-slate-500 mb-1">Tell us what's going on.</p>
              <Textarea
                id="sc-situation"
                rows={4}
                data-testid="challenge-situation"
                value={form.situation_description}
                onChange={(e) => update("situation_description", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sc-why">Why does this matter now? *</Label>
              <p className="text-xs text-slate-500 mb-1">Helps surface urgency and context.</p>
              <Textarea
                id="sc-why"
                rows={3}
                data-testid="challenge-why-matters"
                value={form.why_matters}
                onChange={(e) => update("why_matters", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sc-outcome">What outcome are you looking for? *</Label>
              <p className="text-xs text-slate-500 mb-1">
                Explain what life would look like if you could resolve this.
              </p>
              <Textarea
                id="sc-outcome"
                rows={3}
                data-testid="challenge-outcome"
                value={form.desired_outcome}
                onChange={(e) => update("desired_outcome", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-4" data-testid="challenge-step-2">
            <div>
              <Label>Would you be open to different approaches? (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {APPROACHES.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2 text-sm text-slate-700 border border-slate-200 px-3 py-2 rounded-sm hover:border-[#6B2C91] cursor-pointer"
                  >
                    <Checkbox
                      checked={form.approaches.includes(a.id)}
                      onCheckedChange={() => toggleApproach(a.id)}
                      data-testid={`challenge-approach-${a.id}`}
                    />
                    {a.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="sc-other-approach">Something else?</Label>
              <Input
                id="sc-other-approach"
                data-testid="challenge-other-approach"
                value={form.other_approach}
                onChange={(e) => update("other_approach", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 mt-4" data-testid="challenge-step-3">
            <div>
              <Label>How much time are you willing to dedicate?</Label>
              <Select value={form.time_commitment} onValueChange={(v) => update("time_commitment", v)}>
                <SelectTrigger className="mt-1" data-testid="challenge-time-commitment">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t.v} value={t.v}>
                      {t.l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.time_commitment === "other" && (
              <div>
                <Label htmlFor="sc-time-other">Explain</Label>
                <Input
                  id="sc-time-other"
                  data-testid="challenge-time-other"
                  value={form.time_commitment_other}
                  onChange={(e) => update("time_commitment_other", e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="sc-budget">How much would you expect to invest?</Label>
              <p className="text-xs text-slate-500 mb-1">
                If you were to set aside a budget to resolve this, what would you expect to pay?
              </p>
              <Input
                id="sc-budget"
                data-testid="challenge-budget"
                placeholder="e.g. $500–$2,000, or open to discussion"
                value={form.budget_expectation}
                onChange={(e) => update("budget_expectation", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 mt-4" data-testid="challenge-step-4">
            <p className="text-sm text-slate-600">A little about you.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sc-first">First name *</Label>
                <Input id="sc-first" data-testid="challenge-first-name"
                  value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sc-last">Last name *</Label>
                <Input id="sc-last" data-testid="challenge-last-name"
                  value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="sc-univ">University / College</Label>
              <Input id="sc-univ" data-testid="challenge-university"
                value={form.university} onChange={(e) => update("university", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sc-chapter">Chapter</Label>
                <Input id="sc-chapter" data-testid="challenge-chapter"
                  value={form.chapter} onChange={(e) => update("chapter", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sc-greek">Greek designation</Label>
                <Input id="sc-greek" data-testid="challenge-greek"
                  value={form.greek_designation} onChange={(e) => update("greek_designation", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sc-year">Graduation year</Label>
                <Input id="sc-year" type="number" data-testid="challenge-grad-year"
                  value={form.grad_year} onChange={(e) => update("grad_year", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sc-phone">Phone (optional)</Label>
                <Input id="sc-phone" data-testid="challenge-phone"
                  value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="sc-email">Email *</Label>
              <Input id="sc-email" type="email" data-testid="challenge-email"
                value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sc-linkedin">LinkedIn</Label>
              <Input id="sc-linkedin" data-testid="challenge-linkedin"
                placeholder="https://linkedin.com/in/…"
                value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed rounded-sm">
              Your information is used <strong>only</strong> for this initiative.
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="sc-consent"
                data-testid="challenge-share-consent"
                checked={form.share_with_central_office}
                onCheckedChange={(v) => update("share_with_central_office", !!v)}
              />
              <Label htmlFor="sc-consent" className="text-sm text-slate-600 leading-relaxed">
                Optional: I'd like to update my coordinates in the Delta Tau Delta portal so the
                Central Office and Foundation can reach out.
              </Label>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}
              data-testid="challenge-back">
              Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => handleClose(false)}
              data-testid="challenge-cancel">
              Cancel
            </Button>
          )}
          {step < totalSteps ? (
            <Button type="button"
              className="bg-[#6B2C91] hover:bg-[#562374] rounded-sm"
              onClick={nextStep}
              data-testid="challenge-next">
              Continue
            </Button>
          ) : (
            <Button type="button"
              className="bg-[#6B2C91] hover:bg-[#562374] rounded-sm"
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="challenge-submit">
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
