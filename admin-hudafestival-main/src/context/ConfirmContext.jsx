import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: '',
        onConfirm: null
    });

    const confirmAction = useCallback((message, onConfirm) => {
        setConfirmState({
            isOpen: true,
            message,
            onConfirm: () => {
                if (onConfirm) onConfirm();
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    }, []);

    return (
        <ConfirmContext.Provider value={confirmAction}>
            {children}
            <ConfirmDialog 
                open={confirmState.isOpen}
                title="Confirmation Required"
                message={confirmState.message}
                confirmLabel="Confirm"
                variant="danger"
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
        </ConfirmContext.Provider>
    );
};