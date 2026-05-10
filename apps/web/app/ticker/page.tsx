'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import protobuf from 'protobufjs';
import { PAIR_SYMBOLS, WS_EVENTS } from '@ws-lab/shared';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export default function TickerPage() {
  const [selectedSymbols, setSelectedSymbols] = useState<Set<string>>(new Set(['BTCUSDT']));
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const protoTypeRef = useRef<protobuf.Type | null>(null);

  useEffect(() => {
    protobuf.load('./proto/ticker.proto', (err, root) => {
      if (root) protoTypeRef.current = root.lookupType('ticker.PriceUpdate');
    });
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const handleConnect = () => {
    setError(null);
    if (socketRef.current) socketRef.current.disconnect();

    const socket = io(WS_URL, { withCredentials: true, transports: ['websocket'] });

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socket.emit(WS_EVENTS.SUBSCRIBE, { symbols: Array.from(selectedSymbols) });
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setError('User is not authorized. Please login via Casdoor.');
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on(WS_EVENTS.PRICE_UPDATE, (buffer: ArrayBuffer) => {
      if (!protoTypeRef.current) return;
      const decoded: any = protoTypeRef.current.decode(new Uint8Array(buffer));
      setPrices(prev => ({ ...prev, [decoded.symbol]: Number(decoded.price).toFixed(2) }));
    });

    socketRef.current = socket;
  };

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h3>Symbol Selection</h3>
        <div className="checkbox-list">
          {PAIR_SYMBOLS.map(symbol => (
            <label key={symbol} className="checkbox-item">
              <input 
                type="checkbox" 
                checked={selectedSymbols.has(symbol)}
                onChange={() => {
                  const next = new Set(selectedSymbols);
                  next.has(symbol) ? next.delete(symbol) : next.add(symbol);
                  setSelectedSymbols(next);
                }}
              />
              {symbol}
            </label>
          ))}
        </div>
        <button onClick={handleConnect} className="btn-primary">
          {isConnected ? 'Update Subscriptions' : 'Connect WebSocket'}
        </button>
        
        {error && (
          <div style={{ marginTop: '15px', color: '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>
            {error}
          </div>
        )}
      </div>

      <div className="ticker-dark-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Live Market Data</h2>
          <div>
            <span className={`status-indicator ${isConnected ? 'status-online' : 'status-offline'}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {Array.from(selectedSymbols).map(symbol => (
            <div key={symbol} className="price-card">
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{symbol}</div>
              <div className="price-value">{prices[symbol] ? `$${prices[symbol]}` : 'Loading...'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
