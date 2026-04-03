import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Preloader from './components/UI/Preloader/Preloader'
import useThemeStore from './store/themeStore'
import './styles/global.scss'

useThemeStore.getState().init()

function Root() {
  const [ready, setReady] = useState(false)
  return (
    <>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      {ready && <App />}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root />
)
