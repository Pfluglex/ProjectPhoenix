import { useState, CSSProperties } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useAuth } from "../System/AuthContext";

/**
 * ProjectPhoenix Login Component
 * Simple login for single-user authentication
 */

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(email, password);

    if (!success) {
      setError("Invalid email or password");
    }

    setIsLoading(false);
  };

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb, #d1d5db)',
  };

  return (
    <div style={containerStyle}>
      {/* Cloud effect backgrounds */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '384px',
          height: '384px',
          backgroundColor: 'rgba(156, 163, 175, 0.3)',
          borderRadius: '9999px',
          filter: 'blur(64px)',
          animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '500px',
          height: '500px',
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          borderRadius: '9999px',
          filter: 'blur(64px)',
          animation: 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '2s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          right: '20%',
          width: '320px',
          height: '320px',
          backgroundColor: 'rgba(209, 213, 219, 0.25)',
          borderRadius: '9999px',
          filter: 'blur(64px)',
          animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '4s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '15%',
          width: '288px',
          height: '288px',
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          borderRadius: '9999px',
          filter: 'blur(64px)',
          animation: 'pulse 9s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '1s',
        }}
      />

      {/* Login card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '448px',
          padding: '48px',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Welcome Text */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            color: '#374151',
            letterSpacing: '0.025em',
            fontSize: '24px',
            fontWeight: 500,
            margin: 0,
          }}>
            Welcome to
          </h1>
          <h2 style={{
            color: '#1f2937',
            letterSpacing: '0.05em',
            marginTop: '4px',
            fontSize: '20px',
            fontWeight: 500,
            margin: '4px 0 0 0',
          }}>
            Project Phoenix
          </h2>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '128px',
            height: '128px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(156, 163, 175, 0.2)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}>
            <User style={{ width: '64px', height: '64px', color: '#4b5563' }} strokeWidth={1.5} />
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Email Input */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid rgba(156, 163, 175, 0.5)',
              paddingBottom: '12px'
            }}>
              <Mail style={{ width: '20px', height: '20px', color: '#6b7280', flexShrink: 0 }} />
              <input
                type="email"
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  border: 0,
                  padding: 0,
                  height: 'auto',
                  background: 'transparent',
                  color: '#1f2937',
                  outline: 'none',
                  fontSize: '16px',
                  fontWeight: 400,
                }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid rgba(156, 163, 175, 0.5)',
              paddingBottom: '12px'
            }}>
              <Lock style={{ width: '20px', height: '20px', color: '#6b7280', flexShrink: 0 }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  flex: 1,
                  border: 0,
                  padding: 0,
                  height: 'auto',
                  background: 'transparent',
                  color: '#1f2937',
                  outline: 'none',
                  fontSize: '16px',
                  fontWeight: 400,
                }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              color: '#dc2626',
              textAlign: 'center',
              fontSize: '14px',
              marginTop: '-16px',
            }}>
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '56px',
              background: isLoading
                ? 'linear-gradient(to right, #6b7280, #4b5563, #374151)'
                : 'linear-gradient(to right, #374151, #1f2937, #111827)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              marginTop: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s',
              fontSize: '16px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(to right, #4b5563, #374151, #1f2937)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(to right, #374151, #1f2937, #111827)';
              }
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
