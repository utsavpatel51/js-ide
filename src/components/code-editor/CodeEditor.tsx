import React, { useEffect, useRef } from 'react';
import { transform } from '@babel/standalone';
import Editor, { loader, Monaco } from '@monaco-editor/react';
import * as eslint from 'eslint-linter-browserify';
import PropTypes from 'prop-types';
import { useLocalStorage } from '../../hooks';
import { editor } from 'monaco-editor';

const VSCODE_CONFIG: editor.IStandaloneEditorConstructionOptions = {
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
  trimAutoWhitespace: true,
};

const CodeEditor = ({
  onOutputChange,
}: {
  onOutputChange: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [code, setCode] = useLocalStorage(
    'code',
    'console.log("Hello, World!")'
  );
  const editorRef: React.MutableRefObject<Monaco | null> = useRef(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    });
  }, []);

  const lintCode = (newCode: string) => {
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

  const handleCodeChange = (value?: string) => {
    setCode(value || '');
    lintCode(value || '');
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
      onOutputChange((error as { message: string }).message);
    }
  };

  useEffect(() => {
    executeCode();
  }, [code]);

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  };

  const handleEditorDidMount = (
    _: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = monaco;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    if (e.clientX < 400) return;
    if (e.clientX > window.innerWidth - 400) return;

    let newWidth = e.clientX;
    if (editorContainerRef.current)
      editorContainerRef.current.style.width = `${newWidth}px`;
  };
  const handleMouseUp = () => {
    isResizingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleReset = () => {
    if (editorContainerRef.current)
      editorContainerRef.current.style.width = '50%';
  };

  return (
    <div className='relative h-[100vh] w-2/3' ref={editorContainerRef}>
      <div className='flex flex-row items-center justify-center gap-2'>
        <img src='/vite.svg' alt='JS playgroud logo' className='h-4 w-4' />
        <h2 className='text-center'>Javascript Playground</h2>
      </div>
      <Editor
        height='100%'
        language='javascript'
        theme='vs-dark'
        value={code || ''}
        onChange={handleCodeChange}
        options={VSCODE_CONFIG}
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
