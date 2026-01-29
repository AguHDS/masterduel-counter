import { Helmet } from "react-helmet-async";
import { LoginForm } from "../features/auth/components/LoginForm";
import { Navbar } from "../layouts/Navbar";

export const SignInPage = () => {
  return (
    <>
      <Helmet>
        <title>Sign In - Masterduel Counter</title>
        <meta name="description" content="Sign in to Masterduel Counter to create and share your Yu-Gi-Oh! Master Duel archetype counter guides." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col">
        <Navbar />
        <main role="main" aria-label="Sign in page">
          <LoginForm />
        </main>
      </div>
    </>
  );
};
