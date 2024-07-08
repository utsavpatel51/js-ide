import React, { useState } from 'react';
import CodeEditor from './components/code-editor';
import NoteEditor from './components/note-editor';
import OutputSection from './components/output-section';

const App = () => {
  const [output, setOutput] = useState('');

  return (
    <div className='flex h-full flex-row'>
      <CodeEditor onOutputChange={setOutput} />
      <div className='flex flex-1 flex-col'>
        <NoteEditor />
        <div className={'h-1 bg-gray-600/20'} />
        <OutputSection output={output} />
      </div>
    </div>
  );
};

export default App;
