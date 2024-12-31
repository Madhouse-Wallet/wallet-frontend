import React from "react";
import styled from "styled-components";

// css

// image

const TableLayout = ({ column, data }) => {
  return (
    <>
      <div className="table-responsive">
        <Table className={` table rounded border-0`}>
          <thead>
            <tr className="">
              {column &&
                column.length > 0 &&
                column.map((item, key) => (
                  <>
                    <th key={key} className=" fw-bold border-0 text-dark">
                      {item.head}
                    </th>
                  </>
                ))}
            </tr>
          </thead>
          <tbody>
            {data &&
              data?.length > 0 &&
              data.map((data, columnkey) => {
                return (
                  <tr key={columnkey}>
                    {column &&
                      column.length > 0 &&
                      column.map((item, key) => {
                        if (item.component) {
                          return (
                            <td
                              key={key}
                              className=" fw-sbold bg-transparent border-0 themeClr"
                            >
                              {item.component(data, columnkey, data)}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={key}
                            className=" fw-sbold bg-transparent border-0 themeClr"
                          >
                            {data[item?.accessor]}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
    </>
  );
};

const Table = styled.div`
  background-color: var(--cardBg2);
  th,
  td {
    padding: 10px 15px;
    font-size: 10px;
    line-height: 20px;
    max-width: 200px;
    min-width: 120px;
    vertical-align: middle;
  }
  thead {
    th {
      font-weight: 400;
      background-color: #76fc93;
      white-space: nowrap;
    }
  }
  tbody {
    td {
      padding: 20px 15px;
      font-weight: 400;
      border: 0;
    }
  }
`;

export default TableLayout;
