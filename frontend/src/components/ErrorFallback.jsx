import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="text-white text-center p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">
        {error.message || 'Something went wrong'}
      </h2>
      <p className="mb-4">Please try again or contact support if the problem persists.</p>
      <button 
        onClick={resetErrorBoundary}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorFallback;
