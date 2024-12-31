import React from 'react'
import { Button } from 'react-bootstrap'

// css
import styles from './Table.module.scss'

// image

const TableLayout = ({ column, data }) => {
  return (
    <>
      <div className="table-responsive">
        <table className={`${styles.table} table rounded border-0`}>
          <thead>
            <tr className="">
              {column &&
                column.length > 0 &&
                column.map((item, key) => (
                  <>
                    <th className=" fw-bold border-0 text-dark">{item.head}</th>
                  </>
                ))}
            </tr>
          </thead>
          <tbody>
            {data &&
              data?.length > 0 &&
              data.map((data, columnkey) => {
                return (
                  <tr>
                    {column &&
                      column.length > 0 &&
                      column.map((item, key) => {
                        if (item.component) {
                          return (
                            <td className=" fw-sbold bg-transparent border-0 themeClr">
                              {item.component(data, columnkey, data)}
                            </td>
                          )
                        }

                        return (
                          <td className=" fw-sbold bg-transparent border-0 themeClr">
                            {data[item?.accessor]}
                          </td>
                        )
                      })}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default TableLayout
