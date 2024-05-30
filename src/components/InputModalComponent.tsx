import React, { useEffect, useRef, useState } from 'react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string) => void;
  initialValue? : string;
}

const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, onSave, initialValue }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>("")

  useEffect(()=>{
    if(initialValue){
        setInputValue(initialValue)
    }
  }, [initialValue])

  const handleSave = () => {
    if (inputRef.current) {
      onSave(inputRef.current.value);
    }
    setInputValue("")
  };

  const handleOnChange = (e: { target: { value: React.SetStateAction<string>; }; }) =>{
    setInputValue(e.target.value)
  }

  const handleOnCancel = () =>{
    setInputValue("")
    onClose()
  }

  return (
    <>
      <div className={`modal-overlay ${isOpen ? '' : 'hidden'}`} />
      <dialog ref={dialogRef} open={isOpen} className='modal-box'>
        <h2>Enter Label</h2>
        <input onChange={handleOnChange} value={inputValue} ref={inputRef} type="text" placeholder="Enter label" />
        <div className='button-wrapper'>
        <button className='save-btn' onClick={handleSave}>Save</button>
        <button onClick={()=> {handleOnCancel()}}>Cancel</button>
        </div> 
      </dialog>
    </>
  );
};

export default InputModal;
