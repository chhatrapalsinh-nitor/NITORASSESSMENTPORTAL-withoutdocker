import React, { useState, useEffect } from "react";
import { withRouter, useLocation, useHistory } from 'react-router-dom'
import { Button, message, Layout, Card, Row, Col } from 'antd';
import Header from "../components/Header";
import { triggerFetchData } from "../Utils/Hooks/useFetchAPI";
import '../styles/generate-test.css'
import TestCodeEditor from "../pages/TestCodeEditor";
import LinkExpired from "../components/LinkExpired";
import WebCam from "../components/WebCam";
import { usePageVisibility } from "../Utils/Hooks/usePageVisibility";
// let questions = {
//     "error": false,
//     "message": "",
//     "status": 200,
//     "data": {
//         "python": [
//             {
//                 "option1": "Answer1",
//                 "option2": "Answer2",
//                 "option3": "Answer3",
//                 "option4": "Answer4",
//                 "correct_value": "Answer1",
//                 "question": 1,
//                 "question_details": {
//                     "id": 1,
//                     "name": "Is python a programming language?",
//                     "type": 1,
//                     "difficulty": 1,
//                     "language": "python"
//                 }
//             },
//             {
//                 "option1": "Answer1",
//                 "option2": "Answer2",
//                 "option3": "Answer3",
//                 "option4": "Answer4",
//                 "correct_value": "Answer4",
//                 "question": 7,
//                 "question_details": {
//                     "id": 7,
//                     "name": "Is python a programming language?",
//                     "type": 1,
//                     "difficulty": 1,
//                     "language": "python"
//                 }
//             },
//             {
//                 "case1": "case1",
//                 "case2": "case2",
//                 "case3": "case3",
//                 "case4": "case4",
//                 "question": 4,
//                 "question_details": {
//                     "id": 4,
//                     "name": "Write a program",
//                     "type": 2,
//                     "difficulty": 1,
//                     "language": "python"
//                 }
//             }
//         ]
//     }
// }

const GenerateTest = () => {
    const search = useLocation();
    const [questions, setQuestions] = useState([])
    const [activeQuestion, setActiveQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState('')
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null)
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [showText, setShowText] = useState(true);
    const [language, setLanguage] = useState(null);
    const [showResult, setShowResult] = useState("user_score_details" in localStorage? true: false);
    const [score, setScore] = useState("user_score_details" in localStorage? JSON.parse(localStorage.getItem("user_score_details"))["score"]["candidateScore"]:[]);
    const [isCompleted, setIsCompleted] = useState("user_details" in localStorage? JSON.parse(localStorage.getItem("user_details"))["completed"]:"user_score_details" in localStorage? JSON.parse(localStorage.getItem("user_score_details"))["textFinished"] : false);
    const path = search.pathname.split("/");
    const [counter, setCounter ] = useState("user_details" in localStorage? JSON.parse(localStorage.getItem("user_details"))["generated_question"]["duration"] : 0);
    const minutes = Math.floor((counter / 60));
    const seconds = Math.floor((counter % 60));
    const [isLinkExpired, setIsLinkExpired] = useState({});
    
    const history = useHistory();

    const [result, setResult] = useState({
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      })

    const pageVisibilityStatus = usePageVisibility();

    useEffect(() => { 
        const pageSwitchCount = parseInt(localStorage.getItem("screen_change")) || 0;

        if (pageVisibilityStatus) {
        localStorage.setItem("screen_change", pageSwitchCount + 1);

        if (pageSwitchCount >= 3) {
            alert(`Your exam link has expired due to switching browser tabs frequently.`);
            setIsCompleted(true);
        } else {
            alert(`Warning ${pageSwitchCount + 1}: You are not allowed to leave the page. Your progress may be lost.`);
        }
        }
        
    }, [pageVisibilityStatus]);  

    
    const saveAnswer = (question_details, selectedAnswerIndex,score, finish) => {
        let request_data = {
            "userTestId": JSON.parse(localStorage.getItem("user_details"))["id"],
            "question_details": question_details,
            "candidate_answers":selectedAnswerIndex ? selectedAnswerIndex : candidate_answers,
            "completed": !finish ? false: true,
            "score": score
        }

        triggerFetchData(
                `save_candidate_answer/`, request_data
            ).then((data) => {
                if (data.data.completed){
                    // setScore(data.data);
                    let candidateScore = {
                        score: data.data.score,
                        correct_answers: data.data.correct_answers,
                    }
                    localStorage.setItem("user_score_details",JSON.stringify({score: {candidateScore},textFinished: true}))
                }    
            }).catch(reason => message.error(reason));
    }


    const onClickNext = (question_details) => {
        setSelectedAnswerIndex(null)

        saveAnswer(question_details, selectedAnswerIndex, result, false);
        if (activeQuestion !== questions[language].length - 1) {
            setActiveQuestion((prev) => prev + 1)
        } else {
            saveAnswer(question_details, "", result, true);
            setActiveQuestion(0)
            setShowResult(true)
        }
    }

    const onAnswerSelected = (answer) => {
        setSelectedAnswerIndex(answer)
        if (answer === correct_value) {
            setSelectedAnswer(true);
            setResult({
                score: result.score + 1,
                correctAnswers: result.correctAnswers + 1,
                wrongAnswers: 0
            })
        } else {
            setSelectedAnswer(false)
            setResult({
                score: 0,
                correctAnswers: 0,
                wrongAnswers: result.wrongAnswers + 1,
            })
        }
    }


    const openCodeEditor = () => {
        setShowCodeEditor(true);
        setShowText(false);
    }

    useEffect(()=>{
        if (counter>0){
            const interval = setInterval(()=>{
                setCounter(counter - 1);
                }, 1000);
            return () => clearInterval(interval);
        }
    }, [counter]);
    
    const addLeadingZero = (number) => (number > 9 ? number : `0${number}`) 
    
    useEffect(() => { 
        if ("user_details" in localStorage){
            let data = JSON.parse(localStorage.getItem("user_details"))["generated_question"];
            // set timer for test
            setCounter(data["duration"]);
            delete data["duration"];
            setQuestions(data);
            setLanguage(Object.keys(data)[0]);   
        }
        else{
            history.push(`/screening/user-details/${path[3]}/${path[4]}`)
        }

        if ("linkExpired" in localStorage){
            let linkExpired = JSON.parse(localStorage.getItem("linkExpired"));
            setIsLinkExpired(linkExpired);
        }    
    }, [""]); 

    const { option1, option2, option3, option4, correct_value, question_details, candidate_answers } = questions[language] ?  questions[language][activeQuestion] : {}
    return (
        <>
        <WebCam />
        <div className="quiz-container">
            { questions[language] && !showResult && !isCompleted && !isLinkExpired["expired"] ? (
                <>
            <div>
                <Row>
                    <Col span={21}>
                        <span className="active-question-no">
                            {addLeadingZero(activeQuestion + 1)}
                        </span>
                        <span className="total-question">
                            /{addLeadingZero(questions[language].length)}
                        </span>
                    </Col>
                    <Col span={2}>
                    {counter > 0
                        ?
                        <div className="timer">
                            {/* <!-- MINUTE --> */}
                            <div className="clock">
                                <h1>Time Left</h1>
                                <div className="numbers">
                                    <p className="minutes">{minutes}</p>
                                </div>
                                <div className="colon">
                                    <p>:</p>
                                </div>
                                {/* <!-- SECOND --> */}
                                <div className="numbers">
                                    <p className="seconds">{seconds}</p>
                                </div>
                            </div>
                        </div>
                        :
                        <LinkExpired modalName="timeExpire" />    
                    }
                    </Col>
                </Row>
                
            </div>
            <h2>{question_details.name}</h2>
            <div className="container">
                {question_details.type == 1 ?
                    <ul>
                        {option1 ? <li onClick={() => onAnswerSelected(option1)}  key={option1} className={selectedAnswerIndex === option1 ? 'selected-answer' : candidate_answers === option1? 'selected-answer' : null}>{option1}</li>: null}
                        {option2 ? <li onClick={() => onAnswerSelected(option2)}  key={option2} className={selectedAnswerIndex === option2 ? 'selected-answer'  : candidate_answers === option2? 'selected-answer' : null}>{option2}</li>: null}
                        {option3 ? <li onClick={() => onAnswerSelected(option3)}  key={option3} className={selectedAnswerIndex === option3 ? 'selected-answer'  : candidate_answers === option3? 'selected-answer' : null}>{option3}</li>: null}
                        {option4 ? <li onClick={() => onAnswerSelected(option4)}  key={option4} className={selectedAnswerIndex === option4 ? 'selected-answer'  : candidate_answers === option4? 'selected-answer': null}>{option4}</li>: null}
                        <Button className="flex-left"  onClick={() => onClickNext(question_details)}>{activeQuestion === questions[language].length - 1 ? 'Finish' : 'Next'}</Button>
                    </ul>
                :
                <div>
                    {showText ?
                    <Button className="flex-left" onClick={openCodeEditor}>
                        Click here to write a code
                        </Button>: null}
                    {showCodeEditor ? <>
                        <TestCodeEditor />
                        <Button className="flex-left"  onClick={() => onClickNext(question_details)} >{activeQuestion === questions[language].length - 1 ? 'Finish' : 'Next'}</Button>
                    </>  : null}
                    
                </div>
            
                }
            </div>
            </>
            ) : score && !isCompleted && !isLinkExpired["expired"] ?(
                <Layout className="layout parent-container">
                    <Card
                        style={{
                        width: '60%',
                        padding: 2 +'rem'
                        }}
                        className="card-style-test"
                        
                    >
                        <h1 className="card-h1">Test finished</h1>
                        <p className="card-p">Your total score for the test was {score.score}, Number of correct answers was {score.correct_answers}</p>
                        <p className="card-p"></p>
                        {/* TODO: going to implement a section to display test analysis */}
                        <p className="card-p">Click to see complete analysis</p>
                        <Button className="card-button"> 
                            Exit Window
                        </Button>
                        
                    </Card>                                
                </Layout>
            ) : isCompleted ? (
                <LinkExpired modalName="userComplete" />
            ) : isLinkExpired["expired"] ? (
                <LinkExpired modalName={isLinkExpired["module_name"] } />
            )
            :
            null
    }
        </div>

        </>
    )

}

export default withRouter(GenerateTest);