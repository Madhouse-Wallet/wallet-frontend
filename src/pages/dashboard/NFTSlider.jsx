import React from 'react'
import styled from 'styled-components'
import Slider from 'react-slick'

const NFTSlider = () => {
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
        {[1, 2, 3, 4, 5, 6].map((item, key) => (
          <div key={key} className="px-2">
            <NFTCard className="rounded-4 p-3 position-relative">
              <div className="top pb-2 d-flex align-items-center justify-content-between">
                <h5 className="m-0 fw-sbold">Cover Info</h5>
                {icn1}
              </div>
              <div className="content py-3">
                <ul className="list-unstyled ps-0 mb-0">
                  <li className="d-flex align-items-center justify-content-between py-1">
                    <p className="m-0">Product:</p>
                    <p className="m-0">Balancer v2</p>
                  </li>
                  <li className="d-flex align-items-center justify-content-between py-1">
                    <p className="m-0">Amount:</p>
                    <p className="m-0">140000.25 DAI</p>
                  </li>
                  <li className="d-flex align-items-center justify-content-between py-1">
                    <p className="m-0">Expiry Date:</p>
                    <p className="m-0">June 22 2023</p>
                  </li>
                  <li className="d-flex align-items-center justify-content-between py-1">
                    <p className="m-0">Cover ID:</p>
                    <p className="m-0">111</p>
                  </li>
                </ul>
              </div>
            </NFTCard>
          </div>
        ))}
      </Slider>
    </>
  )
}

const NFTCard = styled.div`
  background-color: var(--cardBg2);
  border: 1px solid #7aff9b;
  font-size: 14px;
  line-height: 20px;
  li {
    font-size: 12px;
  }
`

export default NFTSlider

const icn1 = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="27" cy="27" r="27" fill="#76FC93" />
    <path
      d="M30 18C30.2652 18 30.5196 18.1054 30.7071 18.2929C30.8946 18.4804 31 18.7348 31 19V21H35C35.2652 21 35.5196 21.1054 35.7071 21.2929C35.8946 21.4804 36 21.7348 36 22V34H38V36H16V34H18V22C18 21.7348 18.1054 21.4804 18.2929 21.2929C18.4804 21.1054 18.7348 21 19 21H23V19C23 18.7348 23.1054 18.4804 23.2929 18.2929C23.4804 18.1054 23.7348 18 24 18H30ZM23 23H20V34H23V23ZM29 23H25V34H29V23ZM34 23H31V34H34V23ZM29 20H25V21H29V20Z"
      fill="#0d1017"
    />
  </svg>
)
