"use client";

import Link from "next/link";

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23 4H1v3h22V4Zm0 7H1v3h22v-3ZM1 18h22v3H1v-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22.6 20.4 18.2 16c1.1-1.6 1.8-3.5 1.8-5.6C20 5.2 15.7.9 10.5.9S1 5.2 1 10.4s4.3 9.5 9.5 9.5c2.1 0 4-.7 5.6-1.8l4.4 4.4 2.1-2.1ZM4 10.5C4 6.9 6.9 4 10.5 4S17 6.9 17 10.5 14.1 17 10.5 17 4 14.1 4 10.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function DocsTopBar({ onMenuToggle, menuOpen }) {
  return (
    <header className="docs-topbar text-white">
      <div className="flex h-full items-center gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex shrink-0 items-center justify-center text-white lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <HamburgerIcon />
        </button>

        <Link href="/" className="flex shrink-0 items-baseline gap-1.5 no-underline text-white">
          <span className="text-2xl font-medium leading-none">Uber</span>
          <span className="text-[22px] font-medium leading-none">Developers</span>
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="hidden px-3 text-base leading-[35px] text-white no-underline hover:opacity-80 sm:block"
          >
            Docs
          </Link>
          <Link
            href="/telematics"
            className="hidden px-3 text-base leading-[35px] text-white no-underline hover:opacity-80 sm:block"
          >
            Telematics
          </Link>
          <button
            type="button"
            className="flex items-center justify-center p-2 text-white hover:opacity-80"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
          <Link href="#authentication" className="ml-1 sm:ml-2">
            <span className="inline-flex h-9 items-center rounded-full border border-white px-4 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black">
              Sign in
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
