import React, { useEffect } from "react";
import Webcam from "react-webcam";
import { Button, message, Modal } from 'antd';
import { triggerFetchData } from "../Utils/Hooks/useFetchAPI";
import "../styles/webcam.css";


const WebCam = () => {
    const webcamRef = React.useRef(null);
    const [imgSrc, setImgSrc] = React.useState(null);
    const [cameraDenied, setCameraDenied] = React.useState(false);
    const videoConstraints = {
        facingMode: "user"
    };

    let interval;

   
    const checkCameraDenied = async () => {
        try {
            const PermissionStatus = await navigator.permissions.query({
                name: "camera",
        });
        if (PermissionStatus.state === "denied") {
            setCameraDenied(true);
        }
        if (PermissionStatus.state === "granted") {
            setCameraDenied(false);
        }
        } catch (error) {
            console.log(error);
        }
    };
        
    useEffect(() => {
        interval = setInterval(() => {
            checkCameraDenied();
        }, 10000);

        return () => {
            clearInterval(interval);
        }
    }, []);
       

    useEffect(() => {
        interval = setInterval(() => {
            // Fetch user test id from localstorage for ongoing test
            let user = null;
            if ("user_details" in localStorage){
                user = JSON.parse(localStorage.getItem("user_details"))["id"];
            }
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
            
            triggerFetchData(
                'upload_captured_image/', {'userTestId': user, 'imageSrc': imageSrc}
            ).then(
                (data) => {
                    console.log("RESULT",data);
                    // Don't show any message to user.
                    // if (data) {
                    //     message.success(data?.message);
                    // } else {
                    //     message.error('Error uploading image');
                    // }
                }
            ).catch(reason => message.error(reason));
        }, 900000);

        return () => {
            clearInterval(interval);
        }
      }, []);

    return (<>
        {cameraDenied 
        ?
        cameraDenied && (
        <Modal title="Grant Webcam Access" open={cameraDenied} footer={null}>
            <p>Browser not granted camera access, please check your browser permission</p>
        </Modal>
        )
        :
        <Webcam
            className="panel"
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
        />
        }
    </>)
}

export default WebCam;
