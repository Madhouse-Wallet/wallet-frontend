import React, { useEffect } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Link, Outlet } from 'react-router-dom'

// css
import styles from './Auth.module.scss'

export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/globals.css" /> */}
      </head>
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
