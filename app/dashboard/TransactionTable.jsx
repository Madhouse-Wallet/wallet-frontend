import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { CardCstm } from './DashboardStyled'
import TableLayout from '@/components/TableLayout/index'

const TransactionTable = () => {
  const column = [
    {
      head: 'Asset',
      accessor: 'coin',
      component: (item, key) => {
        return (
          <>
            <div className="d-flex align-items-center gap-10">
              <div className="imgWrp flex-shrink-0">{item.coin}</div>
              <div className="content">
                <p className="m-0 themeClr">{item.CoinName}</p>
              </div>
            </div>
          </>
        )
      }
    },
    { head: 'Balance', accessor: 'Balance' },
    {
      head: 'APY',
      accessor: 'APY',
      isComponent: false
    }
  ]
  const data = [
    {
      CoinName: 'BTC',
      coin: btc,
      Balance: '0.00100',
      APY: '0.14%'
    }
  ]
  return (
    <>
      <Row>
        <Col lg="12" className="my-2">
          <div
            className="top d-flex align-items-center justify-content-between flex-wrap pb-3"
            style={{ fontSize: 12 }}
          >
            <div className="left d-flex align-items-center gap-10">
              <div className="px-2">
                <p className="m-0">Net Worth</p>
                <h4 className="m-0 fw-bold" style={{ fontSize: 18 }}>
                  $ <span className="themeClr">511.93</span>
                </h4>
              </div>
              <div className="px-2">
                <p className="m-0">Net APY</p>
                <h4 className="m-0 fw-bold" style={{ fontSize: 18 }}>
                  <span className="themeClr">-4.12%</span> %
                </h4>
              </div>
              <div className="px-2">
                <p className="m-0">Health Factor</p>
                <h4 className="m-0 fw-bold" style={{ fontSize: 18 }}>
                  <span className="themeClr">1.77</span>
                </h4>
              </div>
            </div>
            <div className="right">
              <Button
                variant="transparent"
                className="border-0 fw-bold p-0 themeClr"
              >
                View Transaction
              </Button>
            </div>
          </div>
        </Col>
        <Col lg="6" className="my-2">
          <CardCstm className={`  rounded-3 p-3 pb-2 px-lg-4 h-100 `}>
            <div className="top d-flex align-items-center justify-content-between">
              <div className="left">
                <h4 className="m-0 font-semibold text-xl">Your supplies</h4>
                <ul
                  className="list-unstyled ps-0 mb-0 d-flex align-items-center gap-10"
                  style={{ fontSize: 10 }}
                >
                  <li className="">
                    Balance <span className="fw-sbold themeClr">$911.94</span>
                  </li>
                  <li className="">
                    APY <span className="fw-sbold themeClr">0.14</span>
                  </li>
                  <li className="">
                    Collateral{' '}
                    <span className="fw-sbold themeClr">$911.94</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="content py-3">
              <TableLayout data={data} column={column} />
            </div>
          </CardCstm>
        </Col>
        <Col lg="6" className="my-2">
          <CardCstm className={`  rounded-3 p-3 pb-2 px-lg-4 h-100 `}>
            <div className="top d-flex align-items-center justify-content-between">
              <div className="left">
                <h4 className="m-0 font-semibold text-xl">Your Borrows</h4>
                <ul
                  className="list-unstyled ps-0 mb-0 d-flex align-items-center gap-10"
                  style={{ fontSize: 10 }}
                >
                  <li className="">
                    Balance <span className="fw-sbold themeClr">$911.94</span>
                  </li>
                  <li className="">
                    APY <span className="fw-sbold themeClr">0.14</span>
                  </li>
                  <li className="">
                    Borrow power used{' '}
                    <span className="fw-sbold themeClr">$911.94</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="content py-3">
              <TableLayout data={data} column={column} />
            </div>
          </CardCstm>
        </Col>
      </Row>
    </>
  )
}

export default TransactionTable

const btc = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_2_2)">
      <path
        d="M15.7607 9.93462C14.6918 14.2226 10.3474 16.8292 6.06549 15.7603C1.77737 14.6914 -0.829259 10.3472 0.239679 6.06537C1.30855 1.77737 5.64668 -0.829258 9.9348 0.239679C14.2167 1.3023 16.8296 5.64655 15.7607 9.93462Z"
        fill="url(#paint0_linear_2_2)"
      />
      <path
        d="M11.8091 7.00312C11.9653 5.94062 11.1591 5.36562 10.0466 4.98437L10.4091 3.54062L9.53407 3.32187L9.18407 4.72812C8.95282 4.67187 8.71532 4.61562 8.47782 4.56562L8.82782 3.15312L7.95282 2.93437L7.59657 4.37187C7.40282 4.32812 7.21532 4.28437 7.03407 4.24062V4.23437L5.82157 3.93437L5.59032 4.87187C5.59032 4.87187 6.24032 5.02187 6.22782 5.02812C6.58407 5.11562 6.64657 5.35312 6.63407 5.54062L6.22157 7.18437C6.24657 7.19062 6.27782 7.19687 6.31532 7.21562C6.28407 7.20937 6.25282 7.20312 6.22157 7.19062L5.64657 9.49062C5.60282 9.59687 5.49032 9.75937 5.24657 9.69687C5.25282 9.70937 4.60907 9.54062 4.60907 9.54062L4.17157 10.5469L5.31532 10.8344C5.52782 10.8906 5.73407 10.9406 5.94032 10.9969L5.57782 12.4531L6.45282 12.6719L6.81532 11.2281C7.05282 11.2906 7.29032 11.3531 7.51532 11.4094L7.15907 12.8469L8.03407 13.0656L8.39657 11.6094C9.89657 11.8906 11.0216 11.7781 11.4903 10.4219C11.8716 9.33437 11.4716 8.70312 10.6841 8.29062C11.2653 8.15937 11.6966 7.77812 11.8091 7.00312ZM9.80282 9.81562C9.53407 10.9031 7.69657 10.3156 7.10282 10.1656L7.58407 8.23437C8.17782 8.38437 10.0903 8.67812 9.80282 9.81562ZM10.0778 6.98437C9.82782 7.97812 8.30282 7.47187 7.80907 7.34687L8.24657 5.59687C8.74032 5.72187 10.3341 5.95312 10.0778 6.98437Z"
        fill="white"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_2_2"
        x1="799.567"
        y1="-0.384"
        x2="799.567"
        y2="1599.84"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#F9AA4B" />
        <stop offset="1" stop-color="#F7931A" />
      </linearGradient>
      <clipPath id="clip0_2_2">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
