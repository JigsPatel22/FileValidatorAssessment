/*  - This is the main component of the application 
    - This module contains Interaction window with User to take input.
    - Ourapplication takes two types of file as Input csv and xml.
    - Depending upon file type application will process the file and validates rules,
      1. Uniqueness in transaction reference
      2. End balance should be varified based upon Start Balance and Mutation
    - After validation phase if any incosistency found in files application allows user to download report
      with list of records quoting reference number and description else completes validation.
*/
import React, { useState } from 'react';
import Papa from 'papaparse';
import ExportToExcel from './ExportExcel';
import XMLParser from 'react-xml-parser';
import '../shared/css/FileValidator.css';

// Allowed extensions for input file
const allowedExtensions = ["csv","xml"];
 
function FileValidator (){
      const [dataForExcel, setDataforExcel] = useState([]);
      const [file, setFile] = useState();
      const [error, setError] = useState("");
      const [viewDownload, setViewDownload] = useState(false);
      var exportToExcelData=[];
 
      /* Save file function will be invoke clicking on Open file button 
         while selecting the file to validate */
      const openFile = (evt) => {
        setError("");
        setViewDownload(false);
        exportToExcelData = [];
        setDataforExcel([]);
        if (evt.target.files.length) {
            setFile(evt.target.files[0]);
        }
        let loadedFileExtension = evt.target.files[0].name.split(".");
        const fileExtension = loadedFileExtension[1];
            if (!allowedExtensions.includes(fileExtension)) {
                setError("Please input as csv or xml file");
                return;
            }
      };

      /* This method will do all the processing and validation on selected file. */
      const parseFile = async (evt) => { 
        if (!file) return setError("Enter a valid csv or xml file");     
        setViewDownload(false);  
        const reader = new FileReader();
        let referenceArray = [];
        if(file.type === "text/csv") {
            reader.onload = async ({ target }) => {
                const csv = Papa.parse(target.result, { header: true });
                const parsedData = csv?.data;
                let validArray =[];
                let rowArray = [];             
                // eslint-disable-next-line array-callback-return
                parsedData.map((value) => {                                
                    rowArray = [];           
                    for (const property in value) {    
                        rowArray.push(`${value[property]}`);
                      }
                      validArray.push(rowArray);
                });
                // eslint-disable-next-line array-callback-return
                validArray.map((arrValue) => {                   
                    if(arrValue[0] !== "") {                          
                          let startBal = Number(arrValue[3]);
                          let mutBal = Number(arrValue[4]);
                          let endBal = Number(arrValue[5]);
                          referenceArray.push(arrValue[0]);
                          // eslint-disable-next-line eqeqeq
                          if( Number(startBal+mutBal).toFixed(2) != Number(endBal)){
                             setViewDownload(true);
                             let exlObj = {
                                 Reference: arrValue[0],
                                 Description: 'The end balance is not correct'
                             };
                             exportToExcelData.push(exlObj);
                        }
                    }  
                });
                /* Code to pull duplicate item for reference number */
                const duplicateElements = referenceArray.filter((item, index) => referenceArray.indexOf(item) !== index);                
                // eslint-disable-next-line array-callback-return
                duplicateElements.map((duplicateValue) => {
                    setViewDownload(true);
                    let exlObj = {
                        Reference: duplicateValue,
                        Description: 'Duplicate reference number found'
                    };
                    exportToExcelData.push(exlObj);
                });             
            };
        } else if(file.type === "text/xml") {        
           reader.onload = async ({ target }) => {
                var xml = new XMLParser().parseFromString(target.result);
                // eslint-disable-next-line array-callback-return
                xml.getElementsByTagName('record').map((data) => {                
                    let startBal = Number(data.children[2].value);
                    let mutBal = Number(data.children[3].value);
                    let endBal = Number(data.children[4].value);
                    referenceArray.push(String(Object.values(data.attributes)));
                    // eslint-disable-next-line eqeqeq
                    if( Number(startBal+mutBal).toFixed(2) != Number(endBal)){   
                        setViewDownload(true);                 
                        let exlObj = {
                            Reference: String(Object.values(data.attributes)),
                            Description: 'The end balance is not correct'
                        };
                        exportToExcelData.push(exlObj);
                    }               
                });
                /* Code to pull duplicate item for reference number */
                const duplicateElements = referenceArray.filter((item, index) => referenceArray.indexOf(item) !== index);
                // eslint-disable-next-line array-callback-return
                duplicateElements.map((duplicateValue) => {
                    setViewDownload(true);
                    let exlObj = {
                        Reference: duplicateValue,
                        Description: 'Duplicate reference number found'
                    };
                    exportToExcelData.push(exlObj); 
                });            
           }           
        }
        setError('Validation for data completed.')       
        setDataforExcel(exportToExcelData);  
        reader.readAsText(file);    
      };
    
      return (    
        <div className="container center" >
            <div className="row">
                <div className="col-md-12">
                    <h1 className="white">Welcome to FileValidator</h1>
                    <p className="white">Please upload only valid csv/xml file.</p>
                </div>
            </div>
            <div>
                <input type="file" onChange={openFile} className="custom-file-upload" />
            </div>          
            <button onClick={parseFile} className="custom-validate-button">Validate File</button>
            <div className="white">
                {error ? error : ""}
            </div>
            <br />
            {/* Conditional rendering for Download Report button only appears when there is 
                any inconsitency found in file and accordingly report needs to generated.  */}
            {
                viewDownload &&
                <ExportToExcel excelData={dataForExcel} fileName={"Excel Report"} />
            }
            </div>
      );
}
export default FileValidator;