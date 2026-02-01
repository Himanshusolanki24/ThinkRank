import { useCallback } from 'react';

export const useSoundEffects = () => {
    // Audio is completely disabled as per user request
    const initAudio = useCallback(() => { }, []);
    const playHover = useCallback(() => { }, []);
    const playClick = useCallback(() => { }, []);
    const playSuccess = useCallback(() => { }, []);
    const playError = useCallback(() => { }, []);
    const playMessage = useCallback(() => { }, []);
    const playTyping = useCallback(() => { }, []);

    return {
        initAudio,
        playHover,
        playClick,
        playSuccess,
        playError,
        playMessage,
        playTyping
    };
};
