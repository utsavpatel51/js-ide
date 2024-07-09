import React from 'react';
import { useLocalStorage } from '../../hooks';

const NoteEditor = () => {
  const [notes, setNotes] = useLocalStorage<string>('notes');

  return (
    <div className='h-1/2'>
      <h2 className='text-center'>Notes</h2>
      <textarea
        className='h-full w-full bg-inherit px-1 outline-0 placeholder:text-gray-500'
        value={notes || ''}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={'Write your notes here'}
      />
    </div>
  );
};

export default NoteEditor;
