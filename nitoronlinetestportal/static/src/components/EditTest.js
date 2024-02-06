import React, { useEffect, useState } from 'react'
import {
  Input,
  Button,
  message,
  Modal,
  Collapse,
  Form,
  Space,
  Select,
  Row,
  DatePicker,
  Col,
} from 'antd'
import {
  CreateTestForm_1,
  CreateTestForm_2,
  CreateTestForm_3,
  languageOptions,
  testSectionOption,
} from '../Utils/constants'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
const { Panel } = Collapse

const constInitialQuestionsValue = {
  easy_mcq_count: 0,
  easy_program_count: 0,
  hard_mcq_count: 0,
  hard_program_count: 0,
  mcq_difficulty: 0,
  medium_mcq_count: 0,
  medium_program_count: 0,
}

const EditTest = ({
  isEditTestModalOpen,
  closeEditModal,
  fetchData,
  testRecord,
  dataList,
  setDataList,
}) => {
  const [form] = Form.useForm()
  const [difficultyLevel, setDifficultyLevel] = useState('1')
  const [activeTab, setActiveTab] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [showAddTestError, setShowAddTestError] = useState(false)
  const [dynamicScore, setDynamicScore] = useState(0)
  const [initialQuestionsValue, setInitialQuestionsValue] = useState(
    constInitialQuestionsValue,
  )
  const [totalScoreWeightage, setTotalScoreWeightage] = useState(0)
  const [endDate, setEndDate] = useState()
  const [addedSections, setAddedSections] = useState([])

  // Updating the Score Weightage dynamically
  useEffect(() => {
    const calculatedScore = calculateWeightage(initialQuestionsValue)
    setDynamicScore(calculatedScore)
  }, [initialQuestionsValue])

  // Updating the Total Score Weightage dynamically
  useEffect(() => {
    let sum = 0
    dataList.map((data) => {
      sum = sum + data.weightage
    })
    setTotalScoreWeightage(sum)
  }, [dataList])

  // Function to Update the Score Weightage dynamically
  const handleCountInputChange = (index, value) => {
    setInitialQuestionsValue((pre) => {
      let temp = Object.assign({}, pre)
      value == '' ? (temp[index] = 0) : (temp[index] = value)
      return temp
    })
  }

  // Function to add new test
  const createTest = () => {
    if (testRecord) {
      dataList[0]['id'] = testRecord.id
    }

    if (dataList.length === 0) {
      setShowAddTestError(true)
      return
    }
    triggerFetchData('create_update_test/', dataList[dataList.length - 1])
      .then(() => {
        message.success('Test created')
        fetchData()
      })
      .catch((reason) => message.error(reason))
    closeEditModal()
    form.resetFields()
  }

  // Function to edit existing test
  const handleEditTest = (values) => {
    values['language'] = selectedLanguage ? selectedLanguage : activeTab
    let dList = {}
    let weightage = calculateWeightage(values)

    dataList.map((item) => {
      let index = item.question_details.findIndex(
        (obj) => obj.language === activeTab,
      )
      item.question_details[index] = values
      item.weightage = weightage
      setSelectedLanguage('')
      dList = item
    })
    setDataList([dList])
  }

  // Function to Calculate Weightage
  const calculateWeightage = (question) => {
    const weights = {
      easy_program_count: 5,
      medium_program_count: 10,
      hard_program_count: 15,
      easy_mcq_count: 5,
      medium_mcq_count: 5,
      hard_mcq_count: 5,
    }

    let score = 0

    for (const key in weights) {
      const count = parseInt(question[key])
      if (count !== 0) {
        score += weights[key] * count
      }
    }
    return score
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  const handleChange = (value) => {
    isNaN(value) ? setSelectedLanguage(value) : setDifficultyLevel(value)
  }

  const onCollapseChange = (key) => {
    setActiveTab(key)
  }

  // Handle Date Change
  const onDateChange = (date, dateString) => {
    setEndDate(dateString)
  }

  const handleAddSection = (value) => {
    setAddedSections(value)
  }

  return (
    <Modal
      title="Edit Test Modal"
      open={isEditTestModalOpen}
      onOk={createTest}
      onCancel={closeEditModal}
      width={900}
      okText="Submit"
    >
      <>
        {testRecord?.question_details?.map((rec, index) => (
          <Form
            form={form}
            name="basic"
            labelCol={{
              span: 12,
            }}
            wrapperCol={{
              span: 12,
            }}
            style={{
              maxWidth: 'none',
            }}
            layout="inline"
            initialValues={{ name: testRecord.name, ...rec }}
            onFinish={handleEditTest}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Col span={24}>
              <Collapse
                accordion
                key={`collapse-index-${index}`}
                onChange={onCollapseChange}
              >
                <Panel header={rec.language} key={rec.language}>
                  <Col span={24}>
                    <Row>
                      {CreateTestForm_1.map((item, index) => (
                        <>
                          <Col span={12}>
                            <Form.Item
                              key={`form-item-${index}`}
                              label={item.title}
                              name={item.dataIndex}
                              rules={[
                                {
                                  required: true,
                                  message: `Please input your ${item.title}`,
                                },
                              ]}
                            >
                              <Space.Compact>
                                {item.dataIndex == 'language' ? (
                                  <Select
                                    showSearch
                                    placeholder="Select a language"
                                    optionFilterProp="children"
                                    defaultValue={rec[item.dataIndex]}
                                    filterOption={(input, option) =>
                                      (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                    options={languageOptions}
                                    onChange={handleChange}
                                  />
                                ) : item.dataIndex == 'add_sections' ? (
                                  <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="Please select"
                                    defaultValue={rec[item.dataIndex]}
                                    onChange={handleAddSection}
                                    options={testSectionOption}
                                  />
                                ) : item.dataIndex == 'end_date' ? (
                                  <DatePicker
                                    style={{ width: 100 + '%' }}
                                    onChange={onDateChange}
                                    disabled
                                  />
                                ) : item.dataIndex == 'name' ? (
                                  <Input
                                    disabled={true}
                                    defaultValue={rec[item.dataIndex]}
                                  />
                                ) : null}
                              </Space.Compact>
                            </Form.Item>
                            <br></br>
                          </Col>
                        </>
                      ))}
                    </Row>
                    {/* MCQ Fields */}
                    {rec.add_sections.includes('Add_MCQs') && (
                      <Row justify="start">
                        <Col span={24}>
                          <h4>MCQ Count</h4>
                        </Col>
                        {CreateTestForm_2.map((item, index) => (
                          <Col span={12}>
                            <Form.Item
                              key={`form-item-${index}`}
                              label={item.title}
                              name={item.dataIndex}
                              rules={[
                                {
                                  required: true,
                                  message: `Please input your ${item.title}`,
                                },
                              ]}
                            >
                              <Input
                                type="text"
                                onKeyPress={(event) => {
                                  if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault()
                                  }
                                }}
                                defaultValue={rec[item.dataIndex]}
                                onChange={(e) =>
                                  handleCountInputChange(
                                    item.dataIndex,
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    )}
                    {/* Program Fields */}
                    {rec.add_sections.includes('Add_Programs') && (
                      <Row justify="start">
                        <Col span={24}>
                          <h4>Program Count</h4>
                        </Col>
                        {CreateTestForm_3.map((item, index) => (
                          <Col span={12}>
                            <Form.Item
                              key={`form-item-${index}`}
                              label={item.title}
                              name={item.dataIndex}
                              rules={[
                                {
                                  required: true,
                                  message: `Please input your ${item.title}`,
                                },
                              ]}
                            >
                              <Input
                                type="text"
                                onKeyPress={(event) => {
                                  if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault()
                                  }
                                }}
                                onChange={(e) =>
                                  handleCountInputChange(
                                    item.dataIndex,
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Item>{' '}
                          </Col>
                        ))}
                      </Row>
                    )}
                    <Button type="primary" ghost onClick={form.submit}>
                      Update
                    </Button>
                  </Col>
                </Panel>
              </Collapse>
            </Col>
          </Form>
        ))}
        <br></br>
      </>
    </Modal>
  )
}

export default EditTest
