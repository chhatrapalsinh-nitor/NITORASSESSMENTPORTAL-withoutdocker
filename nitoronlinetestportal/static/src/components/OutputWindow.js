import React from "react";
import "../styles/output-window.css";

const OutputWindow = ({ outputDetails }) => {
    // outputDetails structure
    // {
    //     "Errors": "  File \"/home/glot/main.py\", line 1\n    /**\n    ^\nSyntaxError: invalid syntax\n",
    //     "Result": null,
    //     "Stats": "No Status Available",
    //     "Files": null
    // }
    // {
    //      "info": "...",
    //      "messages": "something went wrong"
    // }
    const getOutput = () => {
        let errors = outputDetails?.Errors;
        let result = outputDetails?.Result;
        let messages = outputDetails?.messages;

        if (!!errors) {
            // Show error
            return (
                <pre className="text-red">
                    {errors}
                </pre>
            );
        } else if (!!result) {
            return (
                <pre className="text-green">
                    {result}
                </pre>
            );
        } else {
            return (
                <pre className="text-red">
                    {messages}
                </pre>
            );
        }
    };
    return (
        <>
            <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-2">
                Output
            </h1>
            <div className="output-window">
                {outputDetails ? <>{getOutput()}</> : <pre className="text-green">Output Window</pre>}
            </div>
        </>
    );
};

export default OutputWindow;