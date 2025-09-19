// app/auth/layout.jsx
export const metadata = {
  title: "Authentication - My E-commerce",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
      {children}
    </div>
  );
}
