import React from 'react';
import { transform } from '@babel/standalone';
import Editor, { loader } from '@monaco-editor/react';
import * as eslint from 'eslint-linter-browserify';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useLocalStorage } from '../../hooks';

const vsCodeConfig = {
  minimap: { enabled: false },
  fontLigatures: true,
  fontSize: 16,
  fontFamily: 'Fira Code',
  lineHeight: 24,
  lineNumbers: 'on',
  wordWrap: 'on',
  folding: true,
  glyphMargin: true,
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  autoIndent: 'full',
  formatOnType: true,
  formatOnPaste: true,
  formatOnSave: true,
};

const CodeEditor = ({ onOutputChange }) => {
  const [code, setCode] = useLocalStorage(
    'code',
    'console.log("Hello, World!")'
  );
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const isResizingRef = useRef(false);

  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    });
  }, []);

  const lintCode = (newCode) => {
    const linter = new eslint.Linter();
    const messages = linter.verify(newCode, {
      rules: { 'no-undef': 'error', 'no-unused-vars': 'warn' },
    });

    const filterMessages = messages.filter(
      (error) => !["'console' is not defined."].includes(error.message)
    );

    const monaco = editorRef.current;
    const model = editorRef.current?.editor?.getModels()[0];

    if (monaco && model) {
      const markers = filterMessages.map((error) => {
        return {
          startLineNumber: error.line,
          startColumn: error.column,
          endLineNumber: error.line,
          endColumn: error.column + 1,
          message: error.message,
          severity: monaco.MarkerSeverity.Error,
        };
      });
      monaco.editor.setModelMarkers(model, 'eslint', markers);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    lintCode(value);
  };

  const executeCode = () => {
    try {
      const transformedCode = transform(code, { presets: ['env'] }).code;

      let capturedOutput = '';
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        capturedOutput += args.join(' ') + '\n';
      };

      eval(transformedCode);

      console.log = originalConsoleLog;

      onOutputChange(capturedOutput);
    } catch (error) {
      onOutputChange(error.message);
    }
  };

  useEffect(() => {
    executeCode();
  }, [code]);

  const handleEditorWillMount = (monaco) => {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  };

  const handleEditorDidMount = (_, monaco) => {
    editorRef.current = monaco;
  };

  const handleMouseMove = (e) => {
    if (!isResizingRef.current) return;
    if (e.clientX < 400) return;
    if (e.clientX > window.innerWidth - 400) return;

    let newWidth = e.clientX;
    editorContainerRef.current.style.width = `${newWidth}px`;
  };
  const handleMouseUp = () => {
    isResizingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleReset = () => {
    editorContainerRef.current.style.width = '50%';
  };

  return (
    <div className='relative h-[100vh] w-2/3' ref={editorContainerRef}>
      <h2 className='text-center'>Code</h2>
      <Editor
        height='100%'
        language='javascript'
        theme='vs-dark'
        value={code}
        onChange={handleCodeChange}
        options={vsCodeConfig}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
      />
      <div
        className='absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-gray-600/20 opacity-0 hover:opacity-100'
        onMouseDown={handleMouseDown}
        onClick={handleReset}
      />
    </div>
  );
};

CodeEditor.propTypes = {
  onOutputChange: PropTypes.func.isRequired,
};

export default CodeEditor;
