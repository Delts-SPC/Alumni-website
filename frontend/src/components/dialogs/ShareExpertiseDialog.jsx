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
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { upsertAlumnus, logEngagement, recordConsent, submitExpertise } from "@/lib/db";

const WILLING_OPTIONS = [
  { id: "interview", label: "Interviewed (to share insights, frameworks, lessons)" },
  { id: "future_session", label: "Part of a future session or discussion" },
  { id: "connect_directly", label: "Connecting directly with a Brother if relevant" },
  { id: "something_else", label: "Something else" },
  { id: "not_sure", label: "Not sure yet" },
];

export default function ShareExpertiseDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    expertise_items: [{ title: "", description: "" }],
    problems_to_solve: [{ title: "", why_someone_cares: "" }],
    willing_to: {},
    willing_other: "",
    additional_notes: "",
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

  function updateExpertiseItem(i, k, v) {
    const items = [...form.expertise_items];
    items[i] = { ...items[i], [k]: v };
    update("expertise_items", items);
  }
  function addExpertiseItem() {
    if (form.expertise_items.length >= 10) return;
    update("expertise_items", [...form.expertise_items, { title: "", description: "" }]);
  }
  function removeExpertiseItem(i) {
    if (form.expertise_items.length <= 1) return;
    update("expertise_items", form.expertise_items.filter((_, idx) => idx !== i));
  }

  function updateProblem(i, k, v) {
    const items = [...form.problems_to_solve];
    items[i] = { ...items[i], [k]: v };
    update("problems_to_solve", items);
  }
  function addProblem() {
    if (form.problems_to_solve.length >= 10) return;
    update("problems_to_solve", [...form.problems_to_solve, { title: "", why_someone_cares: "" }]);
  }
  function removeProblem(i) {
    if (form.problems_to_solve.length <= 1) return;
    update("problems_to_solve", form.problems_to_solve.filter((_, idx) => idx !== i));
  }

  function toggleWilling(id) {
    setForm((s) => ({ ...s, willing_to: { ...s.willing_to, [id]: !s.willing_to[id] } }));
  }

  function reset() {
    setStep(1);
    setSubmitting(false);
    setForm({
      expertise_items: [{ title: "", description: "" }],
      problems_to_solve: [{ title: "", why_someone_cares: "" }],
      willing_to: {},
      willing_other: "",
      additional_notes: "",
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
    if (step === 1) {
      const valid = form.expertise_items.some(
        (x) => x.title.trim() && x.description.trim()
      );
      if (!valid) {
        toast.error("Please describe at least one area of expertise.");
        return;
      }
    }
    if (step === 2) {
      const valid = form.problems_to_solve.some(
        (x) => x.title.trim() && x.why_someone_cares.trim()
      );
      if (!valid) {
        toast.error("Please describe at least one problem you can help with.");
        return;
      }
    }
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
      await logEngagement(alumniId, "landing_page", "interview");
      await recordConsent(alumniId, {
        programOnly: true,
        shareCentral: form.share_with_central_office,
      });
      const expertiseClean = form.expertise_items.filter(
        (x) => x.title.trim() || x.description.trim()
      );
      const problemsClean = form.problems_to_solve.filter(
        (x) => x.title.trim() || x.why_someone_cares.trim()
      );
      await submitExpertise(alumniId, {
        expertise_items: expertiseClean,
        problems_to_solve: problemsClean,
        willing_to: form.willing_to,
        willing_other: form.willing_other || null,
        additional_notes: form.additional_notes || null,
        expertise_area: expertiseClean[0]?.title || null,
        willing_to_share: true,
        interview_interest: !!form.willing_to.interview,
      });
      toast.success("Thank you for offering your experience.");
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
        data-testid="share-expertise-dialog"
      >
        <DialogHeader>
          <p className="text-xs tracking-[0.25em] uppercase text-[#6B2C91] font-semibold">
            Share Your Experience
          </p>
          <DialogTitle className="font-serif text-2xl md:text-3xl text-slate-900 leading-tight pr-8">
            What expertise could help another Brother?
          </DialogTitle>
          <DialogDescription className="text-slate-600 leading-relaxed">
            Think about what you've developed, challenges you've faced, problems you've solved,
            or perspectives that could bring clarity to another Delt.
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
          <div className="space-y-4 mt-4" data-testid="expertise-step-1">
            <p className="text-sm text-slate-600">
              What experience or expertise could you share? (Add up to 10.)
            </p>
            {form.expertise_items.map((item, i) => (
              <div key={i} className="border border-slate-200 p-4 rounded-sm space-y-2 relative">
                {form.expertise_items.length > 1 && (
                  <button type="button" onClick={() => removeExpertiseItem(i)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
                    data-testid={`expertise-remove-${i}`}>
                    <X className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    data-testid={`expertise-item-title-${i}`}
                    placeholder="e.g. Career pivots after 40"
                    value={item.title}
                    onChange={(e) => updateExpertiseItem(i, "title", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    rows={2}
                    data-testid={`expertise-item-desc-${i}`}
                    placeholder="Briefly describe what you've learned and how it could help."
                    value={item.description}
                    onChange={(e) => updateExpertiseItem(i, "description", e.target.value)}
                  />
                </div>
              </div>
            ))}
            {form.expertise_items.length < 10 && (
              <Button type="button" variant="outline" size="sm"
                onClick={addExpertiseItem}
                data-testid="expertise-add-item"
                className="rounded-sm">
                <Plus className="h-4 w-4 mr-1" /> Add another
              </Button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-4" data-testid="expertise-step-2">
            <p className="text-sm text-slate-600">
              What kinds of situations or challenges could you help with? (Add up to 10.)
            </p>
            {form.problems_to_solve.map((item, i) => (
              <div key={i} className="border border-slate-200 p-4 rounded-sm space-y-2 relative">
                {form.problems_to_solve.length > 1 && (
                  <button type="button" onClick={() => removeProblem(i)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
                    data-testid={`expertise-problem-remove-${i}`}>
                    <X className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <Label className="text-xs">Problem you address</Label>
                  <Input
                    data-testid={`expertise-problem-title-${i}`}
                    placeholder="e.g. Burnout in senior roles"
                    value={item.title}
                    onChange={(e) => updateProblem(i, "title", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Why would someone care?</Label>
                  <Textarea
                    rows={2}
                    data-testid={`expertise-problem-why-${i}`}
                    value={item.why_someone_cares}
                    onChange={(e) => updateProblem(i, "why_someone_cares", e.target.value)}
                  />
                </div>
              </div>
            ))}
            {form.problems_to_solve.length < 10 && (
              <Button type="button" variant="outline" size="sm"
                onClick={addProblem}
                data-testid="expertise-add-problem"
                className="rounded-sm">
                <Plus className="h-4 w-4 mr-1" /> Add another
              </Button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 mt-4" data-testid="expertise-step-3">
            <Label>Would you be open to being…</Label>
            <div className="space-y-2">
              {WILLING_OPTIONS.map((o) => (
                <label key={o.id}
                  className="flex items-start gap-3 border border-slate-200 px-4 py-3 rounded-sm hover:border-[#6B2C91] cursor-pointer">
                  <Checkbox
                    checked={!!form.willing_to[o.id]}
                    onCheckedChange={() => toggleWilling(o.id)}
                    data-testid={`expertise-willing-${o.id}`}
                  />
                  <span className="text-sm text-slate-700">{o.label}</span>
                </label>
              ))}
            </div>
            {form.willing_to.something_else && (
              <div>
                <Label htmlFor="ex-other">Something else (open text)</Label>
                <Input id="ex-other" data-testid="expertise-willing-other"
                  value={form.willing_other}
                  onChange={(e) => update("willing_other", e.target.value)} />
              </div>
            )}
            <div>
              <Label htmlFor="ex-notes">Anything else you'd want us to know?</Label>
              <Textarea id="ex-notes" rows={3} data-testid="expertise-additional-notes"
                value={form.additional_notes}
                onChange={(e) => update("additional_notes", e.target.value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 mt-4" data-testid="expertise-step-4">
            <p className="text-sm text-slate-600">A little about you.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ex-first">First name *</Label>
                <Input id="ex-first" data-testid="expertise-first-name"
                  value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ex-last">Last name *</Label>
                <Input id="ex-last" data-testid="expertise-last-name"
                  value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="ex-univ">University / College</Label>
              <Input id="ex-univ" data-testid="expertise-university"
                value={form.university} onChange={(e) => update("university", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ex-chapter">Chapter</Label>
                <Input id="ex-chapter" data-testid="expertise-chapter"
                  value={form.chapter} onChange={(e) => update("chapter", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ex-greek">Greek designation</Label>
                <Input id="ex-greek" data-testid="expertise-greek"
                  value={form.greek_designation} onChange={(e) => update("greek_designation", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ex-year">Graduation year</Label>
                <Input id="ex-year" type="number" data-testid="expertise-grad-year"
                  value={form.grad_year} onChange={(e) => update("grad_year", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ex-phone">Phone (optional)</Label>
                <Input id="ex-phone" data-testid="expertise-phone"
                  value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="ex-email">Email *</Label>
              <Input id="ex-email" type="email" data-testid="expertise-email"
                value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ex-linkedin">LinkedIn</Label>
              <Input id="ex-linkedin" data-testid="expertise-linkedin"
                placeholder="https://linkedin.com/in/…"
                value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed rounded-sm">
              Your information is used <strong>only</strong> for this initiative.
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="ex-consent"
                data-testid="expertise-share-consent"
                checked={form.share_with_central_office}
                onCheckedChange={(v) => update("share_with_central_office", !!v)}
              />
              <Label htmlFor="ex-consent" className="text-sm text-slate-600 leading-relaxed">
                Optional: I'd like to update my coordinates in the Delta Tau Delta portal so the
                Central Office and Foundation can reach out.
              </Label>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}
              data-testid="expertise-back">
              Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => handleClose(false)}
              data-testid="expertise-cancel">
              Cancel
            </Button>
          )}
          {step < totalSteps ? (
            <Button type="button"
              className="bg-[#6B2C91] hover:bg-[#562374] rounded-sm"
              onClick={nextStep}
              data-testid="expertise-next">
              Continue
            </Button>
          ) : (
            <Button type="button"
              className="bg-[#6B2C91] hover:bg-[#562374] rounded-sm"
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="expertise-submit">
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
