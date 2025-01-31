import React from "react";
import styled from "styled-components";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

// css

// image

const TableLayout = ({ column, data }) => {
  return (
    <>
      <TableC className="w-full caption-bottom text-sm">
        <TableHeader>
          <TableRow className="border-0">
            {column &&
              column.length > 0 &&
              column.map((item, key) => (
                <>
                  <TableHead
                    key={key}
                    className="h-10 px-2 px-lg-4 text-left font-semibold align-middle font-normal [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {item.head}
                  </TableHead>
                </>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data &&
            data?.length > 0 &&
            data.map((data, columnkey) => {
              return (
                <>
                  <TableRow key={columnkey} className="border-0">
                    {column &&
                      column.length > 0 &&
                      column.map((item, key) => {
                        if (item.component) {
                          return (
                            <>
                              <TableCell
                                key={key}
                                className="h-10 p-2 px-lg-4 text-left align-middle font-normal [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                              >
                                {item.component(data, columnkey, data)}
                              </TableCell>
                            </>
                          );
                        }

                        return (
                          <TableCell
                            key={key}
                            className="h-10 p-2 px-lg-4 text-left align-middle font-normal [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                          >
                            {data[item?.accessor]}
                          </TableCell>
                        );
                      })}
                  </TableRow>
                </>
              );
            })}
        </TableBody>
      </TableC>
    </>
  );
};

const TableC = styled(Table)`
  th,
  td {
    padding: 10px 15px;
    font-size: 12px;
    line-height: 20px;
    max-width: 200px;
    min-width: 120px;
    vertical-align: middle;
    border: 0;
    box-shadow: unset !important;
  }
  thead {
    tr > th:first-child {
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }
    tr > th:last-child {
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    }
    th {
      font-weight: 400;
      ${"" /* background-color: var(--cardBg); */}
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(39.6px);
      white-space: nowrap;
      color: var(--textColor);
    }
  }
  tbody {
    tr {
      transition: 0.4s;
    }
    td {
      padding: 20px 15px;
      font-weight: 400;
      border: 0;
    }
  }
`;

export default TableLayout;
