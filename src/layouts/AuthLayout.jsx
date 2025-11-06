import React from "react";

export default function AuthLayout({ title, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-blue-200">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-semibold text-center mb-6 text-indigo-600">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
