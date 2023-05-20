import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.tsx'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'

import { withProse } from '@nikolovlazar/chakra-ui-prose';

const theme = extendTheme({}, withProse());

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
)
