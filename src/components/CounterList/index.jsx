import React from "react";
import Slider from "react-slick";
import styled from "styled-components";

const CounterList = ({ data }) => {
  // var settings = {
  //   dots: false,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 3,
  //   slidesToScroll: 1,
  //   responsive: [
  //     {
  //       breakpoint: 1024,
  //       settings: {
  //         slidesToShow: 3,
  //       },
  //     },
  //     {
  //       breakpoint: 767,
  //       settings: {
  //         slidesToShow: 2,
  //       },
  //     },
  //     {
  //       breakpoint: 575,
  //       settings: {
  //         slidesToShow: 1,
  //       },
  //     },
  //   ],
  // };
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {data &&
          data.length > 0 &&
          data.map((item, key) => (
            <CounterCard
              key={key}
              className="rounded-xl border border-secondary h-full bg-card text-card-foreground shadow"
            >
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="tracking-tight text-sm font-medium">
                  {item.head}
                </div>
                {item.icn}
                {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg> */}
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </div>
            </CounterCard>
          ))}
      </div>

      {/* <Slider {...settings}>
        {data &&
          data.length > 0 &&
          data.map((item, key) => (
            <div key={key} className="px-3">
              <CounterCard className=" p-3 p-lg-4 rounded-4 d-flex align-items-center gap-2">
                <div className="icnWrp flex-shrink-0">{item.icn}</div>
                <div className="content">
                  <h6 className="m-0 text-lg">{item.head}</h6>
                  <h2 className="m-0 fw-bold text-2xl">{item.value}</h2>
                </div>
              </CounterCard>
            </div>
          ))}
      </Slider> */}
    </>
  );
};

const CounterCard = styled.div`
  background-color: var(--cardBg);
  border: 1px solid #ff8735;
`;

export default CounterList;
