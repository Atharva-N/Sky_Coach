https://sky-coach-coral.vercel.app/

## Groq API configuration

For local development, create a root `.env.local` file with `GROQ_API_KEY=<your key>`.
For Vercel, add `GROQ_API_KEY` as an environment variable in the project settings and redeploy.
Do not use the `VITE_` prefix; the key is used by the server-side API proxy, not the browser.
