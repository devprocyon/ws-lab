'use client';

import { useState } from 'react';
import { CasdoorUser } from '@ws-lab/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthPage() {
  const [userInfo, setUserInfo] = useState<CasdoorUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/login`;
  };

  const handleGetUserInfo = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/auth/user-info`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Not authorized or server error');
      }

      const data: CasdoorUser = await response.json();
      setUserInfo(data);
    } catch (err: any) {
      setError(err.message);
      setUserInfo(null);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>User Authentication</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={handleLogin} className="btn-primary">
            Login with Casdoor
          </button>
          
          <button onClick={handleGetUserInfo} className="btn-secondary">
            Get User Info
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '16px', color: '#ef4444', fontSize: '14px' }}>
            Error: {error}
          </div>
        )}

        {userInfo && (
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            background: '#f8fafc', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
              Logged in as:
            </h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p style={{ margin: '4px 0' }}><strong>Name:</strong> {userInfo.name}</p>
              <p style={{ margin: '4px 0' }}><strong>Email:</strong> {userInfo.email}</p>
              <p style={{ margin: '4px 0', color: '#64748b', fontSize: '12px' }}>
                <strong>ID:</strong> {userInfo.sub}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
