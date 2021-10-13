import './App.css';
import readXlsxFile from 'read-excel-file';
import XLSX from "xlsx";
import getEquals from './equals';

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

function App() {
  console.log(getEquals);
  const compareTwoNames = (nameA, nameB) => {
    //0 = false

    //match === '?', if only one word or letter is different in the names AND ...
    //...first letter in the two columns are the same (only for last condition)?
    nameA = nameA.trim();
    nameB = nameB.trim();
    const nameAInitialLetter = nameA.length > 0 ? nameA[0] : '';
    const nameBInitialLetter = nameB.length > 0 ? nameB[0] : '';

    if(nameA === nameB) return 1; //same words same arrangement

    let nameAwords = nameA.trim().split(" ").map(x => x.toUpperCase());
    //nameAwords = nameAwords.map(nameAword => getEquals[nameAword] ? getEquals[nameAword] : nameAword);
    let nameBwords = nameB.trim().split(" ").map(x => x.toUpperCase());
    //nameBwords = nameBwords.map(nameBword => getEquals[nameBword] ? getEquals[nameBword] : nameBword);
    let setForNameA = new Set(nameAwords);
    let setForNameB = new Set(nameBwords);

    const wordCountDiff = Math.abs(nameAwords.length - nameBwords.length);

    if(wordCountDiff >= 2) return 0; //false

    let count = 0;    

    if(nameAwords.length < nameBwords.length) {
      //switching groups for A and B
      let tempSet = setForNameB;
      let tempWords = nameBwords
      setForNameB = setForNameA;
      nameBwords = nameAwords;
      setForNameA = tempSet;
      nameAwords = tempWords;
    }

    let oddWordOut = '';

    for(let wordA of nameAwords) {
      if(!setForNameB.has(wordA)) {
        oddWordOut = wordA;
        count++;
      } else {
        setForNameB.delete(wordA);
      }
      if(count >= 2) return 0; //false if more than two words different
    }

    if(count === 0) return 2; //2 = same words different arrangement

    if(count === 1) {
      // if(nameBwords.length === nameAwords.length) return 0; //false
      if(count === 1 && nameBwords.length > 1 && nameAInitialLetter === nameBInitialLetter) {
        return '?'; //unsure if different word
      }
    } 
    
  }

  const inputChangeHandler = (x) => {
    const input = document.getElementById('input')
    readXlsxFile(input.files[0]).then((rows) => {
      for(let i = 1; i < rows.length; i++) {
        const row = rows[i];
        let match = compareTwoNames(row[getExcelCell['comnam']], row[getExcelCell['newvar']]);
        if(match === 1) row[getExcelCell['matched']] = 1;
        if(match === 2) row[getExcelCell['matched']] = '?';
      }
      exportData(rows);
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <input type="file" onChange= {(x) => inputChangeHandler(x)} id="input" />
      </header>
    </div>
  );
}

export default App;

function exportData(data)
{
    const filename='reports.xlsx';
    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "People");
    XLSX.writeFile(wb,filename);
 }

