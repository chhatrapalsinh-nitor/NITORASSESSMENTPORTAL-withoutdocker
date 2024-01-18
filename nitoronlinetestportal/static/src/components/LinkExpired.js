import React from "react";
import { Modal, Button } from 'antd';

const goBack =() =>{
    localStorage.removeItem("user_details");
    localStorage.removeItem("user_score_details");
    localStorage.removeItem("screen_change");
    localStorage.removeItem("linkExpired");
    window.opener = null;
    window.open('', '_self');
    window.close();
}

function LinkExpired(modalName) {
    localStorage.setItem("linkExpired", JSON.stringify({"expired": true, "module_name": modalName.modalName}));
    return (
        <Modal 
            title="Link Expired"
            open={true}
            footer={null}
            closable={false}
        >
            {modalName.modalName == "userComplete"
                ?
                <>
                    <p>The link has expired, since the candidate has already submitted the test!</p>
                    <Button className="card-button" onClick={() => goBack()}> 
                        Exit Window
                    </Button>
                </>
                :modalName.modalName == "linkExpire"?
                <p> The quiz link has expired as the designated deadline for this activity has passed </p>
                :
                <>
                    <p>The link has expired due to the time limit set for this activity.!!</p>
                    <Button className="card-button" onClick={() => goBack()}> 
                        Exit Window
                    </Button>
                </>
            }

        </Modal>
    )
}

export default LinkExpired;