'use client';

import { AppProvider } from '@/context/AppContext';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    return <AppProvider>{children}</AppProvider>;
}
