'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function GlobalWebSocket() {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const wsRef = useRef<WebSocket | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!accessToken) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            return;
        }

        let isMounted = true;

        const connectWS = () => {
            if (!isMounted) return;
            const wsUrl = `ws://localhost:8000/api/v1/ws/orders?token=${accessToken}`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => console.log('WebSocket connected');

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.event === 'order_updated') {
                        toast.success(data.message);
                        queryClient.invalidateQueries({ queryKey: ['myOrders'] });
                        queryClient.invalidateQueries({ queryKey: ['order', data.order_id] });
                        queryClient.invalidateQueries({ queryKey: ['adminData'] });
                    }
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            ws.onclose = () => {
                if (isMounted) {
                    console.log('WebSocket disconnected. Reconnecting in 5s...');
                    timeoutRef.current = setTimeout(connectWS, 5000);
                }
            };

            wsRef.current = ws;
        };

        connectWS();

        return () => {
            isMounted = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.onclose = null; // prevent reconnect
                wsRef.current.close();
            }
        };
    }, [accessToken, queryClient]);

    return null;
}
