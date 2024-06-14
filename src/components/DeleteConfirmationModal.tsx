import React, { useEffect, useRef, useState } from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    selectedNodesLength: number
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onDelete, selectedNodesLength }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    return (
        <>
            <div className={`modal-overlay ${isOpen ? '' : 'hidden'}`} />
            <dialog ref={dialogRef} open={isOpen} className='modal-box'>
                <h2>Are you sure you want to delete all {selectedNodesLength} elements?</h2>
                <div className='button-wrapper'>
                    <button className='save-btn' onClick={() => onDelete()}>Delete</button>
                    <button onClick={() => { onClose() }}>Cancel</button>
                </div>
            </dialog>
        </>
    );
};

export default DeleteConfirmationModal;
