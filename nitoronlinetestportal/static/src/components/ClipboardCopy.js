import React, { useState } from "react";
import { Tooltip } from 'antd';
import { CopyFilled } from '@ant-design/icons'


function ClipboardCopy({ copyText }) {
    const [showCopyText, setShowCopyText] = useState("Copy Text");
 
    // return copied text to clipboard
    async function copyTextToClipboard(text) {
      if ('clipboard' in navigator) {
        return await navigator.clipboard.writeText(text);
      } else {
        return document.execCommand('copy', true, text);
      }
    }
  
    // onClick handler function for the copy button
    const handleCopyClick = () => {
      // Asynchronously call copyTextToClipboard
      copyTextToClipboard(copyText)
        .then(() => {
          // If successful, update the isCopied state value
          setIsCopied(true);
          setShowCopyText("Copied!");
          setTimeout(() => {
            setIsCopied(false);
          }, 1500);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  
    return (
      <div>
        <input type="text" value={copyText} readOnly hidden />
        {/* Bind our handler function to the onClick button property */}
        <Tooltip placement="top" title={showCopyText}>
          <CopyFilled onClick={handleCopyClick}/>
        </Tooltip>
      </div>
    );
  }

export default ClipboardCopy;