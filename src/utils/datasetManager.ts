const DATASET_KEY = "grocery_ml_active_dataset";
const DATASET_NAME_KEY = "grocery_ml_active_dataset_name";

export interface StoredDataset {
  data: any[];
  fileName: string;
  uploadedAt: string;
}

export function saveDataset(
  data: any[],
  fileName: string
) {
  const dataset: StoredDataset = {
    data,
    fileName,
    uploadedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    DATASET_KEY,
    JSON.stringify(dataset)
  );

  localStorage.setItem(
    DATASET_NAME_KEY,
    fileName
  );
}

export function getDataset(): StoredDataset | null {
  try {
    const stored = localStorage.getItem(DATASET_KEY);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error(
      "Unable to load stored dataset:",
      error
    );

    return null;
  }
}

export function clearDataset() {
  localStorage.removeItem(DATASET_KEY);
  localStorage.removeItem(DATASET_NAME_KEY);
}

export function getDatasetName(): string {
  return (
    localStorage.getItem(DATASET_NAME_KEY) ||
    "No dataset uploaded"
  );
}