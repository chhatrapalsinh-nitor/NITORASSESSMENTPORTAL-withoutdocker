import * as XLSX from 'xlsx';

const readExcel = (file) => {
    const fileReadPromise = new Promise((resolve, reject) => {

        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);

        fileReader.onload = (e) => {
            let sheetsData = {};
            const bufferArray = e.target.result;
            const wb = XLSX.read(bufferArray, { type: 'buffer' });

            wb.SheetNames.forEach((element, index) => {
            let data = XLSX.utils.sheet_to_json(wb.Sheets[element]);
            sheetsData[wb.SheetNames[index]] = data;
            });
            resolve(sheetsData);
        };

        fileReader.onerror = (e) => {
            reject(e)
        }
    });

    return fileReadPromise
}

const generateExcelFromJson = (sheetsDataObject, filename='', download=true) => {
    const workbook = XLSX.utils.book_new();
    let worksheet;

    for (const sheetName in sheetsDataObject) {
        console.log(`${sheetName}: ${sheetsDataObject[sheetName]}`);
        const rows = sheetsDataObject[sheetName];
        worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    if (download == true) {
        XLSX.writeFile(workbook, filename);
    }
    return workbook
}

export {readExcel, generateExcelFromJson}
