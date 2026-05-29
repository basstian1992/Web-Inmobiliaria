export const runtime = 'edge';

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white/5 p-[2px] shadow-2xl backdrop-blur-md">
        <div className="rounded-[22px] bg-slate-950/80 p-4 flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                card: "bg-transparent shadow-none border-none",
                headerTitle: "text-white text-2xl font-bold font-sans",
                headerSubtitle: "text-slate-400 font-sans",
                socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 border border-white/10 text-white font-sans transition-colors duration-200",
                socialButtonsBlockButtonText: "text-white font-semibold",
                dividerLine: "bg-white/10",
                dividerText: "text-slate-500 font-sans",
                formFieldLabel: "text-slate-300 font-sans",
                formFieldInput: "bg-white/5 border border-white/10 text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans",
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 font-sans",
                footerActionText: "text-slate-400 font-sans",
                footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold font-sans transition-colors duration-200"
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}
