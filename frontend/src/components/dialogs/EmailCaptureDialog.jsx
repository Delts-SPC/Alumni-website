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
import { upsertAlumnus, logEngagement, recordConsent } from "@/lib/db";

const SOURCE_LABELS = {
  voice: "Make my voice matter",
  email: "Be one of the first to know",
};

export default function EmailCaptureDialog({ open, onOpenChange, source = "voice" }) {
  const [step, setStep] = useState(1);
  const totalSteps = 2;
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
              : "Two short steps. Your input directly shapes what we build."}
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

        {step === 1 && (
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

        {step === 2 && (
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
                if (!form.email.trim()) {
                  toast.error("Email is required.");
                  return;
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
