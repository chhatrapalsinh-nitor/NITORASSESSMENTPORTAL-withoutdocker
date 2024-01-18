import React, { useState, useReducer } from "react";
import "../styles/code-editor.css";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ onChange, language, code, theme }) => {
    const [value, setValue] = useState(code || "");

    const handleEditorChange = (value) => {
        setValue(value);
        onChange("code", value);
    };

    return (
        <div style={{borderRadius: '0.375rem', borderStyle: 'solid', overflow: 'hidden'}}>
        <Editor
            height="85vh"
            width={`100%`}
            defaultLanguage="javascript"
            language={language || "javascript"}
            value={value}
            theme='vs-dark'
            defaultValue="// some comment"
            onChange={handleEditorChange}
            />
            </div>
    )
}

export default CodeEditor;