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
      {/* <div className="relative w-full overflow-auto">
        <TableC className="w-full caption-bottom text-sm">
          <thead className="">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {column &&
                column.length > 0 &&
                column.map((item, key) => (
                  <>
                    <th
                      key={key}
                      className="h-10 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {item.head}
                    </th>
                  </>
                ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {data &&
              data?.length > 0 &&
              data.map((data, columnkey) => {
                return (
                  <tr
                    key={columnkey}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {column &&
                      column.length > 0 &&
                      column.map((item, key) => {
                        if (item.component) {
                          return (
                            <td
                              key={key}
                              className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                            >
                              {item.component(data, columnkey, data)}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={key}
                            className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                          >
                            {data[item?.accessor]}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
          </tbody>
        </TableC>
      </div> */}
      <TableC className="w-full caption-bottom text-sm">
        <TableHeader>
          <TableRow className="border-0">
            {column &&
              column.length > 0 &&
              column.map((item, key) => (
                <>
                  <TableHead
                    key={key}
                    className="h-10 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
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
                  <TableRow
                    key={columnkey}
                    className="border-0 bg-[var(--cardBg2)] hover:bg-[var(--backgroundColor)]"
                  >
                    {column &&
                      column.length > 0 &&
                      column.map((item, key) => {
                        if (item.component) {
                          return (
                            <>
                              <TableCell
                                key={key}
                                className="h-10 p-2 border-0 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                              >
                                {item.component(data, columnkey, data)}
                              </TableCell>
                            </>
                          );
                        }

                        return (
                          <TableCell
                            key={key}
                            className="h-10 p-2  text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
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
    font-size: 10px;
    line-height: 20px;
    max-width: 200px;
    min-width: 120px;
    vertical-align: middle;
  }
  thead {
    th {
      font-weight: 400;
      background-color: var(--cardBg);
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
