import React from "react";
import { Input } from "antd";

const CustomInput = ({ customInput, setCustomInput }) => {
    return (
            <Input.TextArea
                rows="5"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={`Custom input`}
            />
    );
};

export default CustomInput;
