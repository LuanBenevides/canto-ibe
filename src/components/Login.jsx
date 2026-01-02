import React, { useState } from 'react';
import { getAll } from '../services/storageService';
import { sha256 } from '../utils/hash';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    const users = await getAll('users');
    const hash = await sha256(password);

    const user = users.find(
      u => u.username === username && u.passwordHash === hash
    );

    if (user) onLogin(user);
    else setError('Usuário ou senha inválidos');
  }

  return (
    <div className="container">
      <h1 className="title">Login</h1>

      <div className="card">
        <form onSubmit={handleLogin}>
          <div className="fieldGroup">
            <input
              className="input"
              placeholder="Usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="fieldGroup">
            <input
              className="input"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="button">
            Entrar
          </button>
        </form>

        {error && (
          <p className="emptyText" style={{ color: 'crimson', marginTop: 12 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
