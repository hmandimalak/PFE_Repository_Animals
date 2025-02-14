const Modal = ({ open, onClose, children }) => {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
          <button onClick={onClose} className="absolute top-2 right-2">X</button>
          {children}
        </div>
      </div>
    );
  };
  
  export default Modal;
  