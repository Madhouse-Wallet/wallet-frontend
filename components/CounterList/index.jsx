import React from 'react'
import { Col, Row } from 'react-bootstrap'
import Slider from 'react-slick'
import styled from 'styled-components'

const CounterList = ({ data }) => {
  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  }
  return (
    <>
      <Slider {...settings}>
        {data &&
          data.length > 0 &&
          data.map((item, key) => (
            <div key={key} className="px-3">
              <CounterCard className=" p-3 p-lg-4 rounded-4 d-flex align-items-center gap-10">
                <div className="icnWrp flex-shrink-0">{item.icn}</div>
                <div className="content">
                  <h6 className="m-0 ">{item.head}</h6>
                  <h2 className="m-0 fw-bold pt-2">{item.value}</h2>
                </div>
              </CounterCard>
            </div>
          ))}
      </Slider>
    </>
  )
}

const CounterCard = styled.div`
  background-color: var(--cardBg);
  border: 1px solid #7aff9b;
`

export default CounterList
