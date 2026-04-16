import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10 bg-white p-10 border-4 border-black">
        <div className="flex flex-col items-center">
          <div className="border-4 border-black p-4">
            <Briefcase className="h-10 w-10 text-black" strokeWidth={3} />
          </div>
          <h2 className="mt-8 text-center text-4xl font-black text-black uppercase tracking-tighter">
            USER_ENROLLMENT
          </h2>
          <p className="mt-2 text-center text-xs font-black text-black uppercase tracking-widest opacity-60">
            Initialize Master Account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-black text-white p-4 font-black uppercase text-xs text-center border-2 border-black">
              {error}
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Full Name</label>
              <input
                type="text"
                required
                className="block w-full px-4 py-3 border-4 border-black bg-white text-black placeholder-black/30 focus:bg-black focus:text-white transition-all outline-none font-bold uppercase text-sm"
                placeholder="JOHN DOE"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Email Address</label>
              <input
                type="email"
                required
                className="block w-full px-4 py-3 border-4 border-black bg-white text-black placeholder-black/30 focus:bg-black focus:text-white transition-all outline-none font-bold uppercase text-sm"
                placeholder="USER@DOMAIN.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Password</label>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 border-4 border-black bg-white text-black placeholder-black/30 focus:bg-black focus:text-white transition-all outline-none font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border-4 border-black text-sm font-black uppercase tracking-widest text-white bg-black hover:bg-white hover:text-black transition-all"
            >
              Initialize
            </button>
          </div>
        </form>
        <div className="text-center text-[10px] font-black uppercase tracking-widest">
          <span className="opacity-40">Entry recorded? </span>
          <Link to="/login" className="underline hover:bg-black hover:text-white p-1 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
