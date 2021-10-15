import XLSX from "xlsx";

class ExcelMethods {

    exportData(data) {
        const filename='reports.xlsx';
        let ws = XLSX.utils.json_to_sheet(data);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "People");
        XLSX.writeFile(wb,filename);
    }

}

export default ExcelMethods;
