import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

export function EditorPane({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="editor-pane">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
        height="100%"
      />
    </div>
  );
}
