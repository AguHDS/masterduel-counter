import { Helmet } from "react-helmet-async";
import { RegisterForm } from "../features/auth/components/RegisterForm";
import { Navbar } from "../layouts/Navbar";
import { FeatureErrorBoundary } from "../shared/components";

export const SignUpPage = () => {
  return (
    <>
      <Helmet>
        <title>Sign Up - Masterduel Counter</title>
        <meta name="description" content="Create an account on Masterduel Counter to contribute your Yu-Gi-Oh! Master Duel archetype counter strategies." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col">
        <Navbar />
        <main role="main" aria-label="Sign up page">
          <FeatureErrorBoundary featureName="Sign Up">
            <RegisterForm />
          </FeatureErrorBoundary>
        </main>
      </div>
    </>
  );
};
