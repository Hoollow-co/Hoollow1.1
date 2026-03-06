import { create } from 'zustand';

interface UserState {
    hasCompletedOnboarding: boolean;
    setHasCompletedOnboarding: (status: boolean) => void;
    environment: 'human' | 'super';
    setEnvironment: (env: 'human' | 'super') => void;
}

export const useStore = create<UserState>((set) => ({
    hasCompletedOnboarding: false,
    setHasCompletedOnboarding: (status) => set({ hasCompletedOnboarding: status }),
    environment: 'human',
    setEnvironment: (env) => set({ environment: env }),
}));
