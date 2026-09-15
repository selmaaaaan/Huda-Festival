const fs = require('fs');
const c = `import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: 'Confirmation Required',
        message: '',
        onConfirm: null,
        onCancel: null
    });

    const confirmAction = useCallback((titleOrMessage, messageOrCb) => {
        return new Promise((resolve) => {
            let title = 'Confirmation Required';
            let message = '';
            let cb = null;
            
            if (typeof messageOrCb === 'function') {
                message = titleOrMessage;
                cb = messageOrCb;
            } else if (typeof messageOrCb === 'string') {
                title = titleOrMessage;
                message = messageOrCb;
            } else {
                message = titleOrMessage;
            }

            setConfirmState({
                isOpen: true,
                title,
                message,
                onConfirm: async () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    if (cb) await cb();
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <ConfirmContext.Provider value={confirmAction}>
            {children}
            <ConfirmDialog 
                open={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                confirmLabel="Confirm"
                variant="danger"
                onConfirm={confirmState.onConfirm}
                onCancel={confirmState.onCancel || (() => setConfirmState(prev => ({ ...prev, isOpen: false })))}
            />
        </ConfirmContext.Provider>
    );
};
`;
fs.writeFileSync('admin-hudafestival-main/src/context/ConfirmContext.jsx', c, 'utf8');
console.log("Fixed ConfirmContext.jsx");