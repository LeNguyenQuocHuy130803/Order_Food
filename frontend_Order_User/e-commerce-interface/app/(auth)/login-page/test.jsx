import React from 'react'

export default function test() {
  const [count, setCount] = React.useState(0)
  const handle_cong = () => {
    setCount(count+1)
  }

  const handle_tru = () => {
    setCount(count-1)
    // không cho trừ xuống 0
    if (count <= 0) {
      setCount(0)
    }
  }

  if (count ==6) {
    return <h1>Đạt 6 rồi nha</h1>
    }
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handle_cong}>+</button>
      <button onClick={handle_tru}>-</button>
    </div>
  )
}
