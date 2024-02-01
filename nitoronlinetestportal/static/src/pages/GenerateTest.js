import React, { useState, useEffect } from 'react'
import { withRouter, useLocation, useHistory } from 'react-router-dom'
import { Button, message, Layout, Card, Row, Col, Menu } from 'antd'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import '../styles/generate-test.css'
import TestCodeEditor from '../pages/TestCodeEditor'
import LinkExpired from '../components/LinkExpired'
import WebCam from '../components/WebCam'
import { usePageVisibility } from '../Utils/Hooks/usePageVisibility'

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
  const history = useHistory()
  const search = useLocation()
  const [questions, setQuestions] = useState([])
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [showText, setShowText] = useState(true)
  const [language, setLanguage] = useState(null)
  const [showResult, setShowResult] = useState(
    'user_score_details' in localStorage ? true : false,
  )
  const [score, setScore] = useState(
    'user_score_details' in localStorage
      ? JSON.parse(localStorage.getItem('user_score_details'))['score'][
          'candidateScore'
        ]
      : [],
  )
  const [isCompleted, setIsCompleted] = useState(
    'user_details' in localStorage
      ? JSON.parse(localStorage.getItem('user_details'))['completed']
      : 'user_score_details' in localStorage
        ? JSON.parse(localStorage.getItem('user_score_details'))['textFinished']
        : false,
  )
  const path = search.pathname.split('/')

  const [counter, setCounter] = useState(
    'user_details' in localStorage
      ? JSON.parse(localStorage.getItem('user_details'))['generated_question'][
          'duration'
        ]
      : 0,
  )
  const minutes = Math.floor(counter / 60)
  const seconds = Math.floor(counter % 60)
  const [isLinkExpired, setIsLinkExpired] = useState({})

  const [result, setResult] = useState({
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  })

  const pageVisibilityStatus = usePageVisibility()

  const [items, setItems] = useState([])
  const [questionData, setQuestionData] = useState([])
  const [languages, setLanguages] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState()
  const [defaultMenuKey, setDefaultMenuKey] = useState()
  const [isSecondLastItem, setIsSecondLastItem] = useState(false)

  // Use effect for handling the page switch
  useEffect(() => {
    const pageSwitchCount = parseInt(localStorage.getItem('screen_change')) || 0
    if (pageVisibilityStatus) {
      localStorage.setItem('screen_change', pageSwitchCount + 1)
      if (pageSwitchCount >= 3) {
        alert(`Your exam link has expired due to switching browser tabs frequently.`)
        setIsCompleted(true)
      } else {
        alert(
          `Warning ${pageSwitchCount + 1}: You are not allowed to leave the page. Your progress may be lost.`,
        )
      }
    }
  }, [pageVisibilityStatus])

  // Test Score set at end
  useEffect(() => {
    setScore(
      'user_score_details' in localStorage
        ? JSON.parse(localStorage.getItem('user_score_details'))['score'][
            'candidateScore'
          ]
        : [],
    )
  }, [showResult])

  // Test Score set at end
  useEffect(() => {
    setScore(
      'user_score_details' in localStorage
        ? JSON.parse(localStorage.getItem('user_score_details'))['score'][
            'candidateScore'
          ]
        : [],
    )
  }, [])

  // Set Counter
  useEffect(() => {
    if (counter > 0) {
      const interval = setInterval(() => {
        setCounter(counter - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [counter])

  const openCodeEditor = () => {
    setShowCodeEditor(true)
    setShowText(false)
  }

  const addLeadingZero = (number) => (number > 9 ? number : `0${number}`)

  // Use effect for setting the questions details
  useEffect(() => {
    if ('user_details' in localStorage) {
      let data = JSON.parse(localStorage.getItem('user_details'))[
        'generated_question'
      ]

      // set timer for test
      setCounter(data['duration'])
      delete data['duration']
      setQuestions(data)
      setLanguage(Object.keys(data)[0])
    } else {
      history.push(`/screening/user-details/${path[3]}/${path[4]}`)
    }

    if ('linkExpired' in localStorage) {
      let linkExpired = JSON.parse(localStorage.getItem('linkExpired'))
      setIsLinkExpired(linkExpired)
    }
  }, [''])

  function getItemItem(label, key, children) {
    return {
      key,
      children,
      label,
    }
  }

  // Menu Item setting
  useEffect(() => {
    if ('user_details' in localStorage) {
      let data = JSON.parse(localStorage.getItem('user_details'))[
        'generated_question'
      ]

      const languages = Object.keys(data).slice(0, -2)
      const lang = languages && languages.length > 0 && languages[0]
      const question = data[lang]
      const defaultQuestion = question && question.length > 0 && question[0]
      setSelectedQuestion(defaultQuestion)
      setDefaultMenuKey(defaultQuestion.question + '')
      setLanguages(languages)
      let menuItemsData = []
      for (let i = 0; i < languages.length; i++) {
        let temp = {
          languageLabel: languages[i],
          languageKey: languages[i],
          languageQuestions: data[languages[i]],
        }
        menuItemsData.push(temp)
      }

      const items = menuItemsData.map((item) => {
        return getItemItem(
          item.languageLabel,
          item.languageKey,
          item.languageQuestions.map((ques, index) => {
            setQuestionData((current) => [
              ...current,
              { questionId: ques.question, questionDetails: ques },
            ])
            return getItemItem(
              ques.question_details.type == 1 ? 'MCQ' : 'Program',
              ques.question,
              null,
            )
          }),
        )
      })
      setItems(items)
    } else {
      history.push(`/screening/user-details/${path[3]}/${path[4]}`)
    }

    if ('linkExpired' in localStorage) {
      let linkExpired = JSON.parse(localStorage.getItem('linkExpired'))
      setIsLinkExpired(linkExpired)
    }
  }, [])

  // Menu Click Handling
  const onMenuClick = ({ item, key, keyPath, domEvent }) => {
    if ('user_details' in localStorage) {
      let questions = JSON.parse(localStorage.getItem('user_details'))[
        'generated_question'
      ]
      const lang = keyPath && keyPath.length > 0 && keyPath[keyPath.length - 1]
      const data = questions[lang]
      const selectedQues = data.filter((q) => q.question == key)

      setSelectedQuestion(selectedQues[0])
    } else {
      history.push(`/screening/user-details/${path[3]}/${path[4]}`)
    }
  }

  // Function to handle Next button Click
  const goToNextQuestion = (question_details) => {
    for (let i = 0; i < questionData.length; i++) {
      if (questionData[i].questionId == defaultMenuKey) {
        if ((i + 1) % questionData.length === 0) {
          console.log('Last Item Done')
          saveAnswer(question_details, '', result, true)
          setShowResult(true)
          return
        }

        if (i + 1 == questionData.length - 1) {
          setIsSecondLastItem(true)
        }

        saveAnswer(question_details, selectedAnswerIndex, result, false)
        setSelectedAnswerIndex(null)
        setDefaultMenuKey(questionData[i + 1].questionId)
        setSelectedQuestion(questionData[i + 1].questionDetails)
      }
    }
  }

  const onAnswerSelected = (answer) => {
    setSelectedAnswerIndex(answer)
    if (answer === correct_value) {
      setSelectedAnswer(true)
      setResult({
        score: result.score + 1,
        correctAnswers: result.correctAnswers + 1,
        wrongAnswers: 0,
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

  const saveAnswer = (question_details, selectedAnswerIndex, score, finish) => {
    let request_data = {
      userTestId: JSON.parse(localStorage.getItem('user_details'))['id'],
      question_details: question_details,
      candidate_answers: selectedAnswerIndex
        ? selectedAnswerIndex
        : candidate_answers,
      completed: !finish ? false : true,
      score: score,
    }

    triggerFetchData(`save_candidate_answer/`, request_data)
      .then((data) => {
        if (data.data.completed) {
          // setScore(data.data);
          let candidateScore = {
            score: data.data.score,
            correct_answers: data.data.correct_answers,
          }
          localStorage.setItem(
            'user_score_details',
            JSON.stringify({ score: { candidateScore }, textFinished: true }),
          )
        }
      })
      .catch((reason) => message.error(reason))
  }

  const {
    option1,
    option2,
    option3,
    option4,
    correct_value,
    question_details,
    candidate_answers,
  } = selectedQuestion ? selectedQuestion : {}

  const onExit = () => {
    localStorage.clear()
    window.open('', '_self')
    window.close()
  }

  return (
    <>
      <WebCam />
      <div className="quiz-container">
        {questions[language] &&
        !showResult &&
        !isCompleted &&
        !isLinkExpired['expired'] ? (
          <>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flex: 'row',
              }}
            >
              <div className="left-menu-bar">
                <Menu
                  defaultSelectedKeys={[defaultMenuKey]}
                  defaultOpenKeys={languages}
                  mode="inline"
                  theme="light"
                  items={items}
                  onClick={onMenuClick}
                />
              </div>
              <div className="quiz-questions-box">
                <Row>
                  {/* TODO */}
                  {/* Counter of questions*/}
                  {/* <Col span={21}>
                    <span className="active-question-no">
                      {addLeadingZero(activeQuestion + 1)}
                    </span>
                    <span className="total-question">
                      /{addLeadingZero(questions[language].length)}
                    </span>
                  </Col> */}
                  {/* Time Left */}
                  <Col span={2}>
                    {counter > 0 ? (
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
                    ) : (
                      <LinkExpired modalName="timeExpire" />
                    )}
                  </Col>
                </Row>
                <h2>{question_details.name}</h2>
                <div className="container">
                  {/* MCQ Question Type */}
                  {question_details.type == 1 ? (
                    <ul>
                      {option1 ? (
                        <li
                          onClick={() => onAnswerSelected(option1)}
                          key={option1}
                          className={
                            selectedAnswerIndex === option1
                              ? 'selected-answer'
                              : candidate_answers === option1
                                ? 'selected-answer'
                                : null
                          }
                        >
                          {option1}
                        </li>
                      ) : null}
                      {option2 ? (
                        <li
                          onClick={() => onAnswerSelected(option2)}
                          key={option2}
                          className={
                            selectedAnswerIndex === option2
                              ? 'selected-answer'
                              : candidate_answers === option2
                                ? 'selected-answer'
                                : null
                          }
                        >
                          {option2}
                        </li>
                      ) : null}
                      {option3 ? (
                        <li
                          onClick={() => onAnswerSelected(option3)}
                          key={option3}
                          className={
                            selectedAnswerIndex === option3
                              ? 'selected-answer'
                              : candidate_answers === option3
                                ? 'selected-answer'
                                : null
                          }
                        >
                          {option3}
                        </li>
                      ) : null}
                      {option4 ? (
                        <li
                          onClick={() => onAnswerSelected(option4)}
                          key={option4}
                          className={
                            selectedAnswerIndex === option4
                              ? 'selected-answer'
                              : candidate_answers === option4
                                ? 'selected-answer'
                                : null
                          }
                        >
                          {option4}
                        </li>
                      ) : null}
                      <Button
                        className="flex-left"
                        onClick={() => goToNextQuestion(question_details)}
                      >
                        {isSecondLastItem ? 'Finish' : 'Next'}
                      </Button>
                    </ul>
                  ) : (
                    <>
                      {/* Programming Type Question */}
                      <div>
                        {showText ? (
                          <Button className="flex-left" onClick={openCodeEditor}>
                            Click here to write a code
                          </Button>
                        ) : null}
                        {showCodeEditor ? (
                          <>
                            <TestCodeEditor />
                            <Button
                              className="flex-left"
                              onClick={() => goToNextQuestion(question_details)}
                            >
                              {isSecondLastItem ? 'Finish' : 'Next'}
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : score && !isCompleted && !isLinkExpired['expired'] ? (
          <Layout className="layout parent-container">
            <Card
              style={{
                width: '60%',
                padding: 2 + 'rem',
              }}
              className="card-style-test"
            >
              <h1 className="card-h1">Test finished</h1>
              <p className="card-p">
                Your total score for the test was {score.score}, Number of correct
                answers was {score.correct_answers}
              </p>
              <p className="card-p"></p>
              {/* TODO: going to implement a section to display test analysis */}
              {/* <p className="card-p">Click to see complete analysis</p> */}
              <Button className="card-button" onClick={onExit}>
                Exit Window
              </Button>
            </Card>
          </Layout>
        ) : isCompleted ? (
          <LinkExpired modalName="userComplete" />
        ) : isLinkExpired['expired'] ? (
          <LinkExpired modalName={isLinkExpired['module_name']} />
        ) : null}
      </div>
    </>
  )
}

export default withRouter(GenerateTest)
