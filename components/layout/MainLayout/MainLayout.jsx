import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../../components/Header'

// css
import styles from './mainLayout.module.scss'

import Sidebar from '../../components/Header/sidebar/Sidebar'

const MainLayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        {/* <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/globals.css" /> */}
      </head>
      <body>{children}</body>
    </html>
  )
}
export default MainLayout
