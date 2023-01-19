/* Independent Excel report generation module.
   Parent application needsto pass exceldata and 
   file name to generate report */
import React  from "react";
import * as FileSaver from 'file-saver';
import XLXS from 'sheetjs-style';

const ExportToExcel = ({excelData, fileName}) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const exportToExcel = async(excelData, fileName) => {
        const ws = XLXS.utils.json_to_sheet(excelData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLXS.write(wb, {bookType: 'xlsx', type: 'array'});
        const data = new Blob([excelBuffer], {type:fileType});
        FileSaver.saveAs(data, fileName+fileExtension); 
    }

    return(
        <>           
          <button onClick={(Event) => exportToExcel(excelData,fileName)} >Download Report</button>
        </>
    )
}

export default ExportToExcel;