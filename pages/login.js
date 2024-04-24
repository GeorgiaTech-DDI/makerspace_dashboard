import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Assuming you're using Next.js for routing
import "@/app/globals.css"

function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate login (replace with actual authentication logic)
    if (username === 'admin' && password === 'password') {
      // Login successful
      router.push('/'); // Redirect to home page on success
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    <section className="bg-gt-pi dark:bg-gt-gray flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md dark:border dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gt-gray md:text-2xl dark:text-white text-center">
            Login
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gt-gray dark:text-white">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gt-diploma border border-gt-pi text-gt-gray sm:text-sm rounded-lg focus:ring-gt-buzz focus:border-gt-buzz block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gt-gray dark:text-white">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gt-diploma border border-gt-pi text-gt-gray sm:text-sm rounded-lg focus:ring-gt-buzz focus:border-gt-buzz block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full text-white bg-gt-gold hover:bg-gt-gray focus:ring-4 focus:outline-none focus:ring-gt-buzz font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gt-buzz-600 dark:hover:bg-gt-diploma dark:focus:ring-gt-buzz-800"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
