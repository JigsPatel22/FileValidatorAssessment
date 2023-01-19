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
                parsedData.map((d1) => {                                
                    rowArray = [];           
                    for (const property in d1) {    
                        rowArray.push(`${d1[property]}`);
                      }
                      validArray.push(rowArray);
                });
                for( var counter =0; counter < validArray.length - 1 ; counter++) {
                    let startBal = Number(validArray[counter][3]);
                    let mutBal = Number(validArray[counter][4]);
                    let endBal = Number(validArray[counter][5]);
                    referenceArray.push(validArray[counter][0]);
                    // eslint-disable-next-line eqeqeq
                    if( Number(startBal+mutBal).toFixed(2) != Number(endBal)){
                        setViewDownload(true);
                        let exlObj = {
                            Reference: validArray[counter][0],
                            Description: 'The end balance is not correct'
                        };
                        exportToExcelData.push(exlObj);
                    }                
                }
                const duplicateElements = referenceArray.filter((item, index) => referenceArray.indexOf(item) !== index);                
                for(var iterator = 0; iterator<duplicateElements.length; iterator++) {
                    setViewDownload(true);
                    let exlObj = {
                        Reference: duplicateElements[iterator],
                        Description: 'Duplicate reference number found'
                    };
                    exportToExcelData.push(exlObj);
                }                
            };
        } else if(file.type === "text/xml") {        
           reader.onload = async ({ target }) => {
            var xml = new XMLParser().parseFromString(target.result);
            for( var counter = 0 ; counter< xml.getElementsByTagName('record').length; counter++) {
                    let startBal = Number(xml.getElementsByTagName('record')[counter].children[2].value);
                    let mutBal = Number(xml.getElementsByTagName('record')[counter].children[3].value);
                    let endBal = Number(xml.getElementsByTagName('record')[counter].children[4].value);
                    referenceArray.push(String(Object.values(xml.getElementsByTagName('record')[counter].attributes)));
                    // eslint-disable-next-line eqeqeq
                    if( Number(startBal+mutBal).toFixed(2) != Number(endBal)){   
                        setViewDownload(true);                 
                        let exlObj = {
                            Reference: String(Object.values(xml.getElementsByTagName('record')[counter].attributes)),
                            Description: 'The end balance is not correct'
                        };
                        exportToExcelData.push(exlObj);
                    }   
                }
                const duplicateElements = referenceArray.filter((item, index) => referenceArray.indexOf(item) !== index);
                for(var iterator = 0; iterator<duplicateElements.length; iterator++) {
                    setViewDownload(true);
                    let exlObj = {
                        Reference: duplicateElements[iterator],
                        Description: 'Duplicate reference number found'
                    };
                    exportToExcelData.push(exlObj);
                } 
           }           
        }
        setError('Validation for data completed.')       
        setDataforExcel(exportToExcelData);  
        reader.readAsText(file);    
      };
    
      return (    
        <div class="container center" >
            <div class="row">
                <div class="col-md-12">
                    <h1 class="white">Welcome to FileValidator</h1>
                    <p class="white">Please upload only valid csv/xml file.</p>
                </div>
            </div>
            <div>
                <input type="file" onChange={openFile} class="custom-file-upload" />
            </div>          
            <button onClick={parseFile} class="custom-validate-button">Validate File</button>
            <div class="white">
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