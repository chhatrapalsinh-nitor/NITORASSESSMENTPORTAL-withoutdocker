import React from "react";
import { Tag } from "antd";

const OutputDetails = ({ outputDetails }) => {
  return (
    <div>
      {outputDetails?.info &&
        <p style={{margin: '10px', fontWeight: '300'}}>
          Info:{" "}
          <Tag>
            {outputDetails?.info}
          </Tag>
        </p>
      }
      {outputDetails?.messages &&
        <p style={{margin: '10px', fontWeight: '300'}}>
          Message:{" "}
          <Tag>
            {outputDetails?.messages}
          </Tag>
        </p>
      }
      {outputDetails?.Stats &&
        <p style={{margin: '10px', fontWeight: '300'}}>
          Status:{" "}
          <Tag>
            {outputDetails?.Stats}
          </Tag>
        </p>
      }
      {outputDetails?.Files &&
        <p style={{margin: '10px', fontWeight: '300'}}>
          Files:{" "}
          <Tag>
            {outputDetails?.Files}
          </Tag>
        </p>
      }
      {/* <p style={{margin: '10px', fontWeight: '300'}}>
        Memory:{" "}
        <Tag>
          {outputDetails?.memory}
          </Tag>
      </p>
      <p style={{margin: '10px', fontWeight: '300'}}>
        Time:{" "}
        <Tag>
          {outputDetails?.time}
          </Tag>
      </p> */}
    </div>
  );
};

export default OutputDetails;
