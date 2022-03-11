import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='text-lg font-bold'>
      Hello {count}

      <button onClick={ () => setCount(count + 1) }>ADD</button>
    </div>
  )
}

export default App
