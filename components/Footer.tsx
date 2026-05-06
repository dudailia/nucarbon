import { Leaf, GitFork } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-green-900/40 bg-[#060f08] py-8 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-sm text-gray-500">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Leaf className="h-4 w-4 text-green-700" />
            <span className="font-semibold text-green-700">NUCarbon</span>
          </div>

          {/* Attribution */}
          <p className="text-center text-xs leading-relaxed max-w-sm">
            Built for{" "}
            <span className="text-green-600 font-medium">Davis Bookhart</span>,
            Senior Advisor for Sustainability, Northeastern University
            &mdash; May 6, 2026
          </p>

          {/* Right cluster */}
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="https://github.com/dudailia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-green-900/50 bg-green-950/30 px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:border-green-700/60 hover:text-green-400"
            >
              <GitFork className="h-3.5 w-3.5" />
              Open Source
            </a>
            <p className="text-xs text-gray-700">Prototype · Not official NU data</p>
          </div>

        </div>
      </div>
    </footer>
  );
}
