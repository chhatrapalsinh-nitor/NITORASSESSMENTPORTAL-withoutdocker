import React, { useEffect, useState } from 'react'
import { Input, Tag } from 'antd'

const MultiTagInput = (props) => {
  const [inputValue, setInputValue] = useState('')
  const [tags, setTags] = useState(props.tags)

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue])
      props.setTags([...tags, inputValue])
      setInputValue('')
    }
  }

  const handleTagClose = (removedTag) => {
    const updatedTags = tags.filter((tag) => tag !== removedTag)
    setTags(updatedTags)
  }

  return (
    <div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputConfirm}
        onPressEnter={handleInputConfirm}
        style={{ width: '300px' }}
      />
      <div style={{ margin: '8px 0' }}>
        {tags.map((tag) => (
          <Tag key={tag} closable onClose={() => handleTagClose(tag)}>
            {tag}
          </Tag>
        ))}
      </div>
    </div>
  )
}

export default MultiTagInput
