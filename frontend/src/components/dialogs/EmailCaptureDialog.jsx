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
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { upsertAlumnus, logEngagement, recordConsent, submitPriorities } from "@/lib/db";

const SOURCE_LABELS = {
  voice: "Make my voice matter",
  email: "Be one of the first to know",
};

const Q1_OPTIONS = [
  { v: "career", l: "Career direction + next move" },
  { v: "leadership", l: "Leadership + management" },
  { v: "self_employment", l: "Self-employment + entrepreneurship" },
  { v: "personal", l: "Personal or life transition" },
  { v: "other", l: "Other" },
];

const Q2_OPTIONS = [
  { v: "very_important", l: "Very important (I need to act)" },
  { v: "important", l: "Important (I've been thinking about it)" },
  { v: "not_urgent", l: "Not urgent, but relevant" },
];

const Q3_OPTIONS = [
  { v: "time_and_money", l: "I would invest time and money" },
  { v: "time_only", l: "I would invest time, not money yet" },
  { v: "interested_unsure", l: "I'd be interested, but unsure" },
];

export default function EmailCaptureDialog({ open, onOpenChange, source = "voice" }) {
  const [step, setStep] = useState(1);
  const totalSteps = source === "voice" ? 3 : 2;
  const showSurvey = source === "voice" && step === 1;
  const showContact = (source === "voice" && step === 2) || (source === "email" && step === 1);
  const showConsent = (source === "voice" && step === 3) || (source === "email" && step === 2);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    chapter: "",
    grad_year: "",
    primary_focus: "",
    biggest_challenge: "",
    share_with_central_office: false,
    q1_focus: "",
    q1_other: "",
    q2_urgency: "",
    q3_invest: "",
  });

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function reset() {
    setStep(1);
    setSubmitting(false);
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      chapter: "",
      grad_year: "",
      primary_focus: "",
      biggest_challenge: "",
      share_with_central_office: false,
    });
  }

  function handleClose(o) {
    onOpenChange(o);
    if (!o) setTimeout(reset, 200);
  }

  async function handleSubmit() {
    if (!form.email.trim()) {
      toast.error("Email is required.");
      return;
    }
    setSubmitting(true);
    try {
      const alumniId = await upsertAlumnus({
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        email: form.email.trim().toLowerCase(),
        chapter: form.chapter || null,
        grad_year: form.grad_year ? parseInt(form.grad_year, 10) : null,
      });
      await logEngagement(alumniId, source === "email" ? "landing_page" : "survey", "respondent");
      await recordConsent(alumniId, {
        programOnly: true,
        shareCentral: form.share_with_central_office,
      });
      if (source === "voice") {
        await submitPriorities(alumniId, {
          primary_focus: form.q1_focus,
          biggest_challenge: form.q1_focus === "other" ? form.q1_other || null : null,
          urgency: form.q2_urgency,
          willingness_invest_money: form.q3_invest,
        });
      }
      toast.success("Thank you. We'll be in touch.");
      handleClose(false);
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-sm"
        data-testid="email-capture-dialog"
      >
        <DialogHeader>
          <p className="text-xs tracking-[0.25em] uppercase text-[#6B2C91] font-semibold">
            {SOURCE_LABELS[source]}
          </p>
          <DialogTitle className="font-serif text-2xl md:text-3xl text-slate-900 leading-tight pr-8">
            {source === "email"
              ? "Be one of the first to know."
              : "Help shape what comes next."}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {source === "email"
              ? "We'll let you know as programs open. No fundraising, no spam."
              : "Three short steps. Your input directly shapes what we build."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-1" />
        </div>

        {showSurvey && (
          <div className="space-y-6 mt-4" data-testid="email-capture-survey">
            <div>
              <Label className="text-sm font-medium text-slate-900">
                What is the one area you most want to improve or figure out right now? *
              </Label>
              <div className="mt-2 space-y-2">
                {Q1_OPTIONS.map((o) => (
                  <label
                    key={o.v}
                    className="flex items-center gap-3 border border-slate-200 px-4 py-3 rounded-sm hover:border-[#6B2C91] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="q1_focus"
                      value={o.v}
                      checked={form.q1_focus === o.v}
                      onChange={() => update("q1_focus", o.v)}
                      data-testid={`survey-q1-${o.v}`}
                      className="accent-[#6B2C91]"
                    />
                    <span className="text-sm text-slate-700">{o.l}</span>
                  </label>
                ))}
              </div>
              {form.q1_focus === "other" && (
                <Input
                  className="mt-2"
                  placeholder="Tell us more"
                  data-testid="survey-q1-other"
                  value={form.q1_other}
                  onChange={(e) => update("q1_other", e.target.value)}
                />
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-900">
                How important is it for you to make progress on this in the next 6–12 months? *
              </Label>
              <div className="mt-2 space-y-2">
                {Q2_OPTIONS.map((o) => (
                  <label
                    key={o.v}
                    className="flex items-center gap-3 border border-slate-200 px-4 py-3 rounded-sm hover:border-[#6B2C91] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="q2_urgency"
                      value={o.v}
                      checked={form.q2_urgency === o.v}
                      onChange={() => update("q2_urgency", o.v)}
                      data-testid={`survey-q2-${o.v}`}
                      className="accent-[#6B2C91]"
                    />
                    <span className="text-sm text-slate-700">{o.l}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-900">
                If something genuinely helped you move forward in this area, how likely would you be to invest in it? *
              </Label>
              <div className="mt-2 space-y-2">
                {Q3_OPTIONS.map((o) => (
                  <label
                    key={o.v}
                    className="flex items-center gap-3 border border-slate-200 px-4 py-3 rounded-sm hover:border-[#6B2C91] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="q3_invest"
                      value={o.v}
                      checked={form.q3_invest === o.v}
                      onChange={() => update("q3_invest", o.v)}
                      data-testid={`survey-q3-${o.v}`}
                      className="accent-[#6B2C91]"
                    />
                    <span className="text-sm text-slate-700">{o.l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {showContact && (
          <div className="space-y-4 mt-4" data-testid="email-capture-step-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ec-first">First name</Label>
                <Input
                  id="ec-first"
                  data-testid="email-capture-first-name"
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ec-last">Last name</Label>
                <Input
                  id="ec-last"
                  data-testid="email-capture-last-name"
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ec-email">Email *</Label>
              <Input
                id="ec-email"
                type="email"
                data-testid="email-capture-email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ec-chapter">Chapter</Label>
                <Input
                  id="ec-chapter"
                  data-testid="email-capture-chapter"
                  placeholder="e.g. Gamma Beta"
                  value={form.chapter}
                  onChange={(e) => update("chapter", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ec-year">Graduation year</Label>
                <Input
                  id="ec-year"
                  type="number"
                  data-testid="email-capture-grad-year"
                  placeholder="e.g. 2002"
                  value={form.grad_year}
                  onChange={(e) => update("grad_year", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {showConsent && (
          <div className="space-y-5 mt-4" data-testid="email-capture-step-2">
            <p className="text-sm text-slate-600">One last thing — your privacy.</p>
            <div className="bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed rounded-sm">
              Your information is used <strong>only</strong> for this initiative. It will
              <strong> not</strong> be shared with the fraternity or foundation.
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="ec-consent"
                data-testid="email-capture-share-consent"
                checked={form.share_with_central_office}
                onCheckedChange={(v) => update("share_with_central_office", !!v)}
              />
              <Label htmlFor="ec-consent" className="text-sm text-slate-600 leading-relaxed">
                Optional: I'd like the Central Office and Foundation to be able to update my
                contact info in the Delta Tau Delta portal.
              </Label>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              data-testid="email-capture-back"
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleClose(false)}
              data-testid="email-capture-cancel"
            >
              Cancel
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              type="button"
              className="bg-[#6B2C91] hover:bg-[#562374] rounded-sm"
              onClick={() => {
                if (showSurvey) {
                  if (!form.q1_focus) {
                    toast.error("Please answer Question 1.");
                    return;
                  }
                  if (form.q1_focus === "other" && !form.q1_other.trim()) {
                    toast.error("Please tell us more for Question 1.");
                    return;
                  }
                  if (!form.q2_urgency) {
                    toast.error("Please answer Question 2.");
                    return;
                  }
                  if (!form.q3_invest) {
                    toast.error("Please answer Question 3.");
                    return;
                  }
                } else if (showContact) {
                  if (!form.email.trim()) {
                    toast.error("Email is required.");
                    return;
                  }
                }
                setStep(step + 1);
              }}
              data-testid="email-capture-next"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-[#6B2C91] hover:bg-[#562374] rounded-sm"
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="email-capture-submit"
            >
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
