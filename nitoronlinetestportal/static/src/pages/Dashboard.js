import React, { useEffect } from "react";
import PropTypes from "prop-types";
import ComingSoon from "../assets/coming_soon.jpg";
import { Image } from "antd";

const Dashboard = (props) => {
  // trigger on component mount
  useEffect(() => {
    props.setSelectedKey("dashboard");
  }, []);

  return (
    <>
      {/* <WebCam/> */}
      <Image
        src={ComingSoon}
        alt="Coming Soon"
        width="100%"
        height={400}
        preview={false}
      />
    </>
  );
};

Dashboard.propTypes = {
  setSelectedKey: PropTypes.func,
};

Dashboard.defaultProps = {
  setSelectedKey: (key) => {
    console.log(key);
  },
};

export default Dashboard;
