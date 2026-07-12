export default function Footer() {
  return (
    <footer
      className="bg-slate-950 text-slate-300 border-t-2 border-[#6B2C91]"
      data-testid="site-footer"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#C8A6E0] font-medium mb-4">
              RAH Delt
            </p>
            <h3 className="font-serif text-2xl md:text-3xl text-white leading-snug">
              Built by Delts. Supported by Delts.
              <br />
              Independent from expectations.
              <br />
              Focused on your next chapter.
            </h3>
          </div>
          <div className="md:text-right text-sm text-slate-400 space-y-2">
            <p>An independent, alumnus-led initiative.</p>
            <p>
              Your information is used only for this initiative — never shared with
              the fraternity or foundation unless you explicitly opt in.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} RAH Delt</span>
        </div>
      </div>
    </footer>
  );
}
