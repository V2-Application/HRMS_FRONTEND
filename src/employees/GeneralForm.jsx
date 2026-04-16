import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Calendar } from "lucide-react";
import Nav from "../components/Nav";

const EmployeeInformationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    empCode: "",
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    fullName: "",
    gender: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    placeOfBirth: "",
    panNo: "",
    aadhaarNo: "",
    nameOnAadhaar: "",
    dateOfBirth: "",
    presentAddress: "",
    presentAddressPinCode: "",
    permanentAddress: "",
    permanentAddressPinCode: "",
    sameAsPresent: false,
    profilePhoto: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  // Helper functions
  const normalizeGender = (gender) => {
    if (!gender) return "";

    const genderMap = {
      m: "male",
      f: "female",
      male: "male",
      female: "female",
      "m.": "male",
      "f.": "female",
      o: "other",
      other: "other",
    };

    return genderMap[gender.toLowerCase()] || gender.toLowerCase();
  };

  const normalizeTitle = (title, gender) => {
    if (!title) {
      // Set default title based on gender if title is missing
      if (gender) {
        const normalizedGender = normalizeGender(gender);
        if (normalizedGender === "male") return "mr";
        if (normalizedGender === "female") return "ms";
      }
      return "";
    }

    const titleMap = {
      mr: "mr",
      ms: "ms",
      mrs: "mrs",
      "mr.": "mr",
      "ms.": "ms",
      "mrs.": "mrs",
      mister: "mr",
      miss: "ms",
      missus: "mrs",
      shri: "mr",
      sri: "mr",
      smt: "mrs",
      kumari: "ms",
    };

    return titleMap[title.toLowerCase()] || title.toLowerCase();
  };

  // Updated date conversion function to handle multiple formats [web:28][web:30]
  const convertDateFormat = (dateStr) => {
    if (!dateStr) return "";

    try {
      // Handle DD/MM/YYYY format
      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }

      // Handle DD-MM-YYYY format
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts.length === 3 && parts[0].length <= 2) {
          // Assume DD-MM-YYYY format
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }

      return dateStr; // Return as is if already in correct format
    } catch (error) {
      console.error("Date conversion error:", error);
      return "";
    }
  };

  // Updated useEffect to load data from optimized localStorage structure [web:22][web:25]
  useEffect(() => {
    const loadFormData = () => {
      try {
        const storedData = localStorage.getItem("candidateFormData");
        if (!storedData) {
          console.log("No stored data found");
          return;
        }

        const parsedData = JSON.parse(storedData);
        console.log("Loaded data structure:", parsedData);

        // Access the new optimized structure
        const processedResults = parsedData.processedResults || {};

        // Extract data from different document types
        const panData = processedResults.pan?.data || {};
        const aadhaarFrontData = processedResults.aadhaarFront?.data || {};
        const aadhaarBackData = processedResults.aadhaarBack?.data || {};

        console.log("PAN Data:", panData);
        console.log("Aadhaar Front Data:", aadhaarFrontData);
        console.log("Aadhaar Back Data:", aadhaarBackData);

        // Build form update object with proper field mapping
        const formDataUpdate = {};

        // Title - prioritize PAN, fallback to Aadhaar, with gender-based default
        const rawGender = panData.gender || aadhaarFrontData.gender || "";
        const normalizedGender = normalizeGender(rawGender);
        const rawTitle = panData.title || aadhaarFrontData.title || "";
        formDataUpdate.title = normalizeTitle(rawTitle, normalizedGender);
        formDataUpdate.gender = normalizedGender;

        // Name fields - prioritize PAN data
        if (panData.name_on_card || panData.fullName || panData.full_name) {
          const fullName =
            panData.name_on_card || panData.fullName || panData.full_name;
          const nameParts = fullName.trim().split(/\s+/);
          formDataUpdate.firstName = nameParts[0] || "";
          formDataUpdate.middleName =
            nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";
          formDataUpdate.lastName =
            nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
          formDataUpdate.fullName = fullName;
        } else if (aadhaarFrontData.name || aadhaarFrontData.first_name) {
          // Fallback to Aadhaar data
          formDataUpdate.firstName =
            aadhaarFrontData.first_name ||
            aadhaarFrontData.name?.split(" ")[0] ||
            "";
          formDataUpdate.middleName = aadhaarFrontData.middle_name || "";
          formDataUpdate.lastName =
            aadhaarFrontData.last_name ||
            aadhaarFrontData.name?.split(" ").slice(-1)[0] ||
            "";
          formDataUpdate.fullName =
            aadhaarFrontData.name ||
            [
              aadhaarFrontData.first_name,
              aadhaarFrontData.middle_name,
              aadhaarFrontData.last_name,
            ]
              .filter(Boolean)
              .join(" ");
        }

        // Father's name - prioritize PAN
        formDataUpdate.fatherName =
          panData.father_name ||
          panData.fatherName ||
          aadhaarFrontData.father_name ||
          aadhaarFrontData.fatherName ||
          "";

        // Mother's name - usually from Aadhaar
        formDataUpdate.motherName =
          aadhaarFrontData.mother_name || aadhaarFrontData.motherName || "";

        // Date of birth - prioritize PAN
        const dobPan =
          panData.date_of_birth || panData.dateOfBirth || panData.dob;
        const dobAadhaar =
          aadhaarFrontData.date_of_birth ||
          aadhaarFrontData.dateOfBirth ||
          aadhaarFrontData.dob;
        const rawDob = dobPan || dobAadhaar;
        if (rawDob) {
          formDataUpdate.dateOfBirth = convertDateFormat(rawDob);
        }

        // PAN number
        formDataUpdate.panNo =
          panData.pan_number || panData.panNumber || panData.pan || "";

        // Aadhaar fields
        formDataUpdate.aadhaarNo =
          aadhaarFrontData.aadhaar_number ||
          aadhaarFrontData.aadhaarNumber ||
          aadhaarFrontData.aadhar_number ||
          "";

        // Name on Aadhaar
        if (aadhaarFrontData.name) {
          formDataUpdate.nameOnAadhaar = aadhaarFrontData.name;
        } else if (aadhaarFrontData.first_name || aadhaarFrontData.last_name) {
          formDataUpdate.nameOnAadhaar = [
            aadhaarFrontData.first_name,
            aadhaarFrontData.middle_name,
            aadhaarFrontData.last_name,
          ]
            .filter(Boolean)
            .join(" ");
        }

        // Address from Aadhaar back
        if (aadhaarBackData.complete_address || aadhaarBackData.address) {
          const address =
            aadhaarBackData.complete_address || aadhaarBackData.address;
          formDataUpdate.presentAddress = address;
          formDataUpdate.permanentAddress = address;
        }

        // Pin code
        if (
          aadhaarBackData.pin_code ||
          aadhaarBackData.pincode ||
          aadhaarBackData.postal_code
        ) {
          const pinCode =
            aadhaarBackData.pin_code ||
            aadhaarBackData.pincode ||
            aadhaarBackData.postal_code;
          formDataUpdate.presentAddressPinCode = pinCode;
          formDataUpdate.permanentAddressPinCode = pinCode;
        }

        // Only update fields that have values
        const filteredUpdate = Object.entries(formDataUpdate).reduce(
          (acc, [key, value]) => {
            if (value && value !== "") {
              acc[key] = value;
            }
            return acc;
          },
          {}
        );

        if (Object.keys(filteredUpdate).length > 0) {
          console.log("Updating form with:", filteredUpdate);
          setFormData((prev) => ({
            ...prev,
            ...filteredUpdate,
          }));
        }
      } catch (error) {
        console.error("Failed to load and populate form data:", error);
      }
    };

    // Load data on component mount
    loadFormData();
  }, []); // Empty dependency array ensures this runs only once on mount [web:21][web:23]

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePhoto: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "sameAsPresent" && checked
          ? {
              permanentAddress: prev.presentAddress,
              permanentAddressPinCode: prev.presentAddressPinCode,
            }
          : {}),
      }));
      return;
    }

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };

      // Auto-update full name when name components change
      if (["firstName", "middleName", "lastName"].includes(name)) {
        newFormData.fullName = [
          name === "firstName" ? value : prev.firstName,
          name === "middleName" ? value : prev.middleName,
          name === "lastName" ? value : prev.lastName,
        ]
          .filter(Boolean)
          .join(" ");
      }

      return newFormData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save current form data to localStorage
    try {
      const currentData = JSON.parse(
        localStorage.getItem("candidateFormData") || "{}"
      );
      currentData.generalFormData = formData;
      localStorage.setItem("candidateFormData", JSON.stringify(currentData));
      console.log("General form data saved:", formData);
    } catch (error) {
      console.error("Failed to save form data:", error);
    }

    navigate("/Candidate-Form/Personal");
  };

  const FormInput = ({
    label,
    id,
    name,
    type = "text",
    placeholder,
    required,
    children,
    className = "",
    disabled = false,
  }) => {
    return (
      <div className={`flex flex-col ${className}`}>
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </label>
        {type === "select" ? (
          <select
            id={id}
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
            required={required}
            disabled={disabled}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            {children}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={id}
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
            required={required}
            disabled={disabled}
            rows="4"
            placeholder={placeholder}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            value={formData[name] || ""}
            onChange={handleInputChange}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        )}
      </div>
    );
  };

  // Rest of your component JSX remains the same...
  return (
    <>
      <Nav />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="w-full max-w-7xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo and Emp Code/Title Section */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-start">
              <div className="flex flex-col items-center col-span-1 md:col-span-1">
                <label className="text-sm font-medium text-gray-700">
                  Profile Photo
                </label>
                <label className="mt-2 h-24 w-24 relative cursor-pointer group">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 rounded-lg opacity-0 group-hover:opacity-40 transition-opacity flex flex-col items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                        <span className="mt-1 text-xs text-white">Change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 w-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                      <Upload className="w-6 h-6" />
                      <span className="mt-1 text-xs">Upload</span>
                    </div>
                  )}
                </label>
              </div>
              <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <FormInput
                  label="Emp. Code"
                  id="empCode"
                  name="empCode"
                  placeholder=""
                />
                <FormInput label="Title" id="title" name="title" type="select">
                  <option value="">Select</option>
                  <option value="mr">Mr.</option>
                  <option value="ms">Ms.</option>
                  <option value="mrs">Mrs.</option>
                </FormInput>
                <FormInput
                  label="First Name"
                  id="firstName"
                  name="firstName"
                  required
                />
                <FormInput
                  label="Middle Name"
                  id="middleName"
                  name="middleName"
                />
              </div>
            </div>

            {/* Personal Info Grid 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <FormInput label="Last Name" id="lastName" name="lastName" />
              <FormInput
                label="Full Name"
                id="fullName"
                name="fullName"
                disabled
              />
              <FormInput
                label="Gender"
                id="gender"
                name="gender"
                type="select"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </FormInput>
            </div>

            {/* Personal Info Grid 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <FormInput
                label="Father's Name"
                id="fatherName"
                name="fatherName"
                required
              />
              <FormInput
                label="Mother's Name"
                id="motherName"
                name="motherName"
              />
              <FormInput
                label="Spouse Name"
                id="spouseName"
                name="spouseName"
              />
            </div>

            {/* Personal Info Grid 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <FormInput
                label="Place of Birth"
                id="placeOfBirth"
                name="placeOfBirth"
              />
              <FormInput label="PAN No." id="panNo" name="panNo" required />
              <FormInput
                label="Aadhar No."
                id="aadhaarNo"
                name="aadhaarNo"
                required
              />
            </div>

            {/* Personal Info Grid 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <FormInput
                label="Name on Aadhar"
                id="nameOnAadhaar"
                name="nameOnAadhaar"
                required
              />
              <div className="relative">
                <FormInput
                  label="Date of Birth"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 mt-2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Address Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <FormInput
                  label="Present Address"
                  id="presentAddress"
                  name="presentAddress"
                  type="textarea"
                  required
                />
                <FormInput
                  label="Present Address Pin Code"
                  id="presentAddressPinCode"
                  name="presentAddressPinCode"
                  required
                />
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Permanent Address
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sameAsPresent"
                      name="sameAsPresent"
                      checked={formData.sameAsPresent}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="sameAsPresent"
                      className="ml-2 text-sm text-gray-500"
                    >
                      Same as Present
                    </label>
                  </div>
                </div>
                <textarea
                  id="permanentAddress"
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  disabled={formData.sameAsPresent}
                  rows="4"
                  className="p-2 w-full border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <FormInput
                  label="Permanent Address Pin Code"
                  id="permanentAddressPinCode"
                  name="permanentAddressPinCode"
                  required
                  disabled={formData.sameAsPresent}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate("/Candidate-Form")}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EmployeeInformationForm;
