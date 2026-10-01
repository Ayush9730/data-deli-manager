import React, { useRef, useState } from "react";

interface DataUploadProps {
  onDatasetLoaded: (data: any[], fileName: string) => void;
}

export default function DataUpload({
  onDatasetLoaded,
}: DataUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (!["csv", "xlsx", "xls"].includes(extension || "")) {
        throw new Error(
          "Please upload a CSV or Excel file (.csv, .xlsx, .xls)"
        );
      }

      let data: any[] = [];

      if (extension === "csv") {
        const text = await file.text();

        const lines = text
          .split(/\r?\n/)
          .filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error("The CSV file does not contain enough data.");
        }

        const headers = lines[0]
          .split(",")
          .map((header) => header.trim());

        data = lines.slice(1).map((line) => {
          const values = line.split(",");

          const row: Record<string, any> = {};

          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() ?? "";
          });

          return row;
        });
      } else {
        const XLSX = await import("xlsx");

        const buffer = await file.arrayBuffer();

        const workbook = XLSX.read(buffer, {
          type: "array",
        });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        data = XLSX.utils.sheet_to_json(firstSheet);
      }

      if (!data.length) {
        throw new Error("The uploaded dataset is empty.");
      }

      // Replace the current dataset with the newly uploaded dataset.
      onDatasetLoaded(data, file.name);

      setFileName(file.name);

      // Important:
      // Reset the input so the SAME file can be uploaded again.
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Dataset upload error:", err);

      setError(
        err?.message || "Unable to process the uploaded dataset."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            Upload Dataset
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Upload a CSV or Excel dataset for clustering,
            classification, association analysis and outlier detection.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleChooseFile}
          disabled={loading}
          className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upload Dataset"}
        </button>

        {fileName && !error && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-sm font-medium text-green-800">
              Dataset loaded successfully
            </p>

            <p className="text-sm text-green-700 mt-1">
              {fileName}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}