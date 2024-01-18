import React, { useEffect } from "react";
import PropTypes from 'prop-types';


const Dashboard = (props) => {
    // trigger on component mount
    useEffect(() => {
        props.setSelectedKey('dashboard');
    }, []);

    return (<>
        {/* <WebCam/> */}
    </>)
}

Dashboard.propTypes = {
    setSelectedKey: PropTypes.func,
};

Dashboard.defaultProps = {
    setSelectedKey: (key) => {console.log(key);}
};

export default Dashboard;