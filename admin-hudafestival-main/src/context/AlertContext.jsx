import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../components/Button';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({
        isOpen: false,
        message: ''
    });

    const alertAction = useCallback((message) => {
        setAlertState({
            isOpen: true,
            message
        });
    }, []);

    const closeAlert = () => {
        setAlertState({ isOpen: false, message: '' });
    };

    return (
        <AlertContext.Provider value={alertAction}>
            {children}
            {alertState.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAlert} />
                    <div className="relative bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <button onClick={closeAlert} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors">
                            <X size={18} />
                        </button>
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-red-600/10">
                                <AlertTriangle size={18} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--color-text-heading)]">Notice</h3>
                                <p className="text-sm text-[var(--color-text-body)] mt-1">{alertState.message}</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button variant="primary" onClick={closeAlert}>OK</Button>
                        </div>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
};