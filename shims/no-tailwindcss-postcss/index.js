// This shim is only installed for the CMS package. The payload-puck CSS
// endpoint tries to import @tailwindcss/postcss (Tailwind v4) first, catches
// the failure, and falls back to the tailwindcss v3 PostCSS plugin instead.
throw new Error('@tailwindcss/postcss shim: unavailable in the worker bundle')
