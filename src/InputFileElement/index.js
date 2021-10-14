import React, { Component } from "react";
import readXlsxFile from 'read-excel-file';
import XLSX from "xlsx";
import getEquals from '../Constants/equals';

const getExcelCell = {
     'matched': 0, 
     'group_id': 1, 
     'unique_id': 2, 
     'companyname': 3,
     'cusip': 4, 
     'unmatch': 5, 
     'count': 6, 
     'permno': 7, 
     'ncusip': 8, 
     'comnam': 9, 
     'newvar': 10, 
     'similscore': 11
  }
  
  //(12) ['matched', 'group_id', 'unique_id', 'companyname', 'cusip', 'unmatch', 'count', 
  // 'permno', 'ncusip', 'comnam', 'newvar', 'similscore']

const InputElement = (props) => {

    const compareTwoNames = (nameA, nameB) => {
        nameA = nameA.trim();
        nameB = nameB.trim();
        const nameAInitialLetter = nameA.length > 0 ? nameA[0] : '';
        const nameBInitialLetter = nameB.length > 0 ? nameB[0] : '';
    
        if(nameA === nameB) return 1; //same words same arrangement
    
        let nameAwords = nameA.split(" ").map(x => x.toUpperCase());
        let nameBwords = nameB.split(" ").map(x => x.toUpperCase());
    
        if(checkIfWordsHasAbbrEquality(nameAwords, nameBwords)) return 3;
        
        let setForNameA = new Set(nameAwords);
        let setForNameB = new Set(nameBwords);
    
        const wordCountDiff = Math.abs(nameAwords.length - nameBwords.length);
    
        if(wordCountDiff >= 2) return 0; //false
    
        if(nameAwords.length < nameBwords.length) {
          let res = switchNamesArrayAndSets(setForNameA, setForNameB, nameAwords, nameBwords);
            setForNameA = res.setForNameA;
            setForNameB = res.setForNameB;
            nameAwords = res.nameAwords;
            nameBwords = res.nameBwords;
        }
    
        let count = getCount(nameAwords, setForNameB);
    
        if(count >= 2) return 0; //false if more than two words different
    
        if(count === 0) return 2; //2 = same words different arrangement
    
        if(isUnsure(count, nameAInitialLetter, nameBInitialLetter)) return '?';
        //match === '?', if only one word or letter is different in the names AND ...
        //...first letter in the two columns are the same (only for last condition)?
    }

    const inputChangeHandler = (x) => {
        const input = document.getElementById('input')
        readXlsxFile(input.files[0]).then((rows) => {
            for(let i = 1; i < rows.length; i++) {
            const row = rows[i];
            let match = compareTwoNames(row[getExcelCell['comnam']], row[getExcelCell['newvar']]);
            if(match === 1) row[getExcelCell['matched']] = 1;
            if(match === 2) row[getExcelCell['matched']] = 2;
            if(match === 3) row[getExcelCell['matched']] = 3;
            if(match === '?') row[getExcelCell['matched']] = '?';
            }
            exportData(rows);
        })
    }

    const switchNamesArrayAndSets = (setForNameA, setForNameB, nameAwords, nameBwords) => {
        let tempSet = setForNameB;
        let tempWords = nameBwords
        setForNameB = setForNameA;
        nameBwords = nameAwords;
        setForNameA = tempSet;
        nameAwords = tempWords;
        return {setForNameA, setForNameB, nameAwords, nameBwords};
      }
    
      const getCount = (nameAwords, setForNameB) => {
        let count = 0; 
        for(let wordA of nameAwords) {
          if(!setForNameB.has(wordA)) {
            count++;
          } else {
            setForNameB.delete(wordA);
          }
        }
        return count;
      }
    
      const isUnsure = (count, nameAInitialLetter, nameBInitialLetter) => {
        if(count === 1) {
          if(nameAInitialLetter === nameBInitialLetter) {
            return true; 
          }
        } 
        return false;
      }

      const checkIfWordsHasAbbrEquality = (nameAwords, nameBwords) => {
        let nameAwordsHasAbbr = false;
        let nameBwordsHasAbbr = false;
    
        nameAwords = nameAwords.map(nameAword => {
          if(getEquals[nameAword]) {
            nameAwordsHasAbbr = true;
          }
          return nameAword;
        })
        nameBwords = nameBwords.map(nameBword => {
          if(getEquals[nameBword]) {
            nameBwordsHasAbbr = true;
          }
          return nameBword;
        });
    
        let nameAwordsWithoutAbbr = nameAwords.map(nameAword => getEquals[nameAword] ? getEquals[nameAword] : nameAword);
        let nameBwordsWithoutAbbr = nameBwords.map(nameBword => getEquals[nameBword] ? getEquals[nameBword] : nameBword);
    
        if((nameAwordsHasAbbr || nameBwordsHasAbbr) && JSON.stringify(nameBwordsWithoutAbbr) === JSON.stringify(nameAwordsWithoutAbbr)) {
          return true
        }
    
        return false;
      }

    return (
        <div>
            <input type="file" onChange= {(x) => inputChangeHandler(x)} id="input" />
        </div>
    );
};

export default InputElement;

function exportData(data)
{
    const filename='reports.xlsx';
    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "People");
    XLSX.writeFile(wb,filename);
}