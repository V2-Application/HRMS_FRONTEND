import React, { useState } from "react";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExcelUploader = () => {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

 const expectedHeaders = [
    "E.CODE",
    "MONTH",
    "INCENTIVE",
    "ARREAR",
    "OVERTIME",
    "FOODING ALLOWANCE",
    "MOBILE BILL",
  ];
  const handleFileChange = (e) => {
    setErrors([]);
    setUploadSuccess(false);
    const selectedFile = e.target.files[0];
    if (selectedFile && /\.(xlsx|xls)$/i.test(selectedFile.name)) {
      setFile(selectedFile);
      toast.success("File selected: " + selectedFile.name);
    } else {
      toast.error("Please select a valid Excel file (.xlsx or .xls)");
    }
  };

  const handleUpload = () => {
    setErrors([]);
    setUploadSuccess(false);
    if (!file) {
      toast.error("Please choose a file before uploading.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      // Header validation
      const headers = jsonData[0] || [];
      let headerErrors = [];
      if (headers.length !== expectedHeaders.length) {
        headerErrors.push(
          `Header error: Expected ${expectedHeaders.length} columns but found ${headers.length}.`
        );
      } else {
        headers.forEach((h, i) => {
          if (h === undefined || h === null || h === "" || typeof h !== "string") {
            headerErrors.push(`Header error: Column ${i + 1} header is missing or invalid.`);
          } else if (h.trim().toUpperCase() !== expectedHeaders[i].toUpperCase()) {
            headerErrors.push(
              `Header mismatch at column ${i + 1}: Expected "${expectedHeaders[i]}", but got "${h}".`
            );
          }
        });
      }
      // Data type and null validation
      const rowErrors = [];
      const monthECodeSet = new Set();
      for (let rowIdx = 1; rowIdx < jsonData.length; rowIdx++) {
        const row = jsonData[rowIdx];
        if (!row || row.length === 0) continue;
        for (let col = 0; col < headers.length; col++) {
          if (row[col] === undefined || row[col] === null || row[col] === "") {
            rowErrors.push(
              `Row ${rowIdx + 1}, Col ${col + 1} (${headers[col]}): must not be empty.`
            );
          }
        }
        // First column: must be string
        if (typeof row[0] !== "string") {
          rowErrors.push(
            `Row ${rowIdx + 1}, Col 1 (${headers[0]}): must be a string.`
          );
        }
        // Second column: must be string in MMM-YY format
        if (
          typeof row[1] !== "string" ||
          !/^[A-Z]{3}-\d{2}$/.test(row[1].toUpperCase())
        ) {
          rowErrors.push(
            `Row ${rowIdx + 1}, Col 2 (${headers[1]}): must be in MMM-YY format.(e.g.= May-25)`
          );
        }
        // E.CODE not duplicate in same month
        const monthKey = (row[1] ? row[1].toUpperCase() : "") + "__" + (row[0] ? row[0].toUpperCase() : "");
        if (monthECodeSet.has(monthKey)) {
          rowErrors.push(
            `Row ${rowIdx + 1}: Duplicate E.CODE "${row[0]}" for MONTH "${row[1]}".`
          );
        } else {
          monthECodeSet.add(monthKey);
        }
        // All other columns: must be decimal
        for (let col = 2; col < headers.length; col++) {
          const value = row[col];
          if (value === undefined || value === null || value === "") continue;
          if (typeof value !== "number") {
            // Try to convert string to number
            const num = Number(value);
            if (typeof value === "string" && !isNaN(num) && value.trim() !== "") {
              // Acceptable: string that can be converted to a number
              continue;
            }
            rowErrors.push(
              `Row ${rowIdx + 1}, Col ${col + 1} (${headers[col]}): must be a decimal number.(e.g.= 0.00)`
            );
          }
        }
      }
      const allErrors = [...headerErrors, ...rowErrors];
      if (allErrors.length > 0) {
        setErrors(allErrors);
        setUploadSuccess(false);
        return;
      }
      toast.success("Excel file validated and uploaded successfully!");
      setErrors([]);
      setUploadSuccess(true);
      // You can now send jsonData to a backend or process it
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={styles.container}>
      <h2>Upload Excel Sheet</h2>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={styles.input}
      />
      <button onClick={handleUpload} style={styles.button}>
        Upload
      </button>
      {errors.length > 0 && (
        <div style={styles.errorBox}>
          <strong>Validation Errors:</strong>
          <ul style={{ textAlign: "left", margin: 0, paddingLeft: 18 }}>
            {errors.map((err, idx) => (
              <li key={idx} style={{ color: "#d32f2f", fontSize: 14 }}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {uploadSuccess && (
        <div style={{ color: 'green', marginTop: 12, fontWeight: 600 }}>
          Upload Successfully
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

const styles = {
  container: {
    background: "#f9f9f9",
    padding: "20px",
    borderRadius: "12px",
    width: "350px",
    margin: "40px auto",
    boxShadow: "0 0 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  input: {
    marginBottom: "15px",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  errorBox: {
    background: "#fff0f0",
    border: "1px solid #d32f2f",
    color: "#d32f2f",
    borderRadius: 8,
    margin: "18px 0 0 0",
    padding: "12px 16px 8px 16px",
    textAlign: "left",
    maxHeight: "180px",
    overflowY: "auto",
  },
};

export default ExcelUploader;
