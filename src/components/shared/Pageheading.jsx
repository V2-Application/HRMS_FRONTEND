import React from 'react'

const Pageheading = ({
  title = 'Enter Page Heading',
  fontSize = '27px',
  marginBottom = '15px',
  marginTop = '-13px',
}) => {
  return (
    <h1
      style={{
        fontSize,
        marginBottom,
        marginTop,
        color: '#363232',
      }}
    >
      {title}
    </h1>
  )
}

export default Pageheading
