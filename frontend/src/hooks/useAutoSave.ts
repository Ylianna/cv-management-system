import {useEffect, useRef, useState} from 'react';

interface AutoSaveConfig<T> {
    data: T;
    version: number;
    onSave: (updatedData: T, currentVersion: number) => Promise<number | null>;
    delay?: number;
}

export function useAutoSave<T>({data, version, onSave, delay = 5000}: AutoSaveConfig<T>) {
    const [currentVersion, setCurrentVersion] = useState(version);
    const isFirstRender = useRef(true);
    const dataRef = useRef(data);

    dataRef.current = data;

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(async () => {
            const newVersion = await onSave(dataRef.current, currentVersion);
            if (newVersion) {
                setCurrentVersion(newVersion);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [data, delay]);

    return {currentVersion};
}