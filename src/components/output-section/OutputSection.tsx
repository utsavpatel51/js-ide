import React from 'react';

const OutputSection = ({ output }: { output: string }) => {
  return (
    <div className='flex-1'>
      <h2 className='text-center'>Console</h2>
      {output === '' && (
        <p className='px-1 text-gray-500'>Output will appear here</p>
      )}
      <pre className='px-1'>{output}</pre>
    </div>
  );
};

export default OutputSection;
