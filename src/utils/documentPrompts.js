export const PROMPT_MAP = {
  pan: `
    You are analyzing an Indian PAN card image for data extraction.
    Return exactly one valid JSON object and nothing else, with no markdown, no explanation, and no apology; if a value is unclear, set it to null.

    **IMAGE HANDLING RULES**:
    - Attempt basic visual understanding: adjust for tilt, glare, or low contrast.
    - If the image is too blurred, faded, dark, tilted, or obstructed such that text cannot be read with 100% clarity → return null for that field.
    - Never assume or infer text that is not perfectly legible.

    **CRITICAL: PAN NUMBER EXTRACTION RULES**:
    - The PAN number MUST be 100% clearly visible and readable with all 10 characters perfectly legible.
    - If the PAN number is faded, washed out, overexposed, blurred, or ANY character is unclear → return null.
    - DO NOT attempt to read similar-looking numbers, card numbers, or any other numbers as PAN.
    - DO NOT infer or guess any digits/letters of the PAN number.
    - DO NOT use any other number visible on the card (like application number, form number, etc.) as PAN.
    - The PAN number has a specific format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F).
    - If you cannot read all 10 characters with absolute certainty → return null for pan_number.

    **STRICT CONFIDENCE RULE**:
    If you are NOT completely certain about a field due to blur, shadow, partial visibility, reflection, fading, overexposure, or image distortion → return null.

    **NAME FORMATTING RULES**:
    - Names should be in proper case (first letter uppercase, rest lowercase).
    - Example: "DHYANU" should be formatted as "Dhyanu"
    - Example: "SANJAY VIG" should be formatted as "Sanjay Vig"
    - Apply this formatting to both name_on_card and father_name fields.
    - Single word names: "DHYANU" → "Dhyanu"
    - Multi-word names: "DHYANU KUMAR" → "Dhyanu Kumar"

    Extract ONLY these fields:
    - Full name (format in proper case as per rules above)
    - PAN Number (10 characters: 5 letters + 4 digits + 1 letter)
    - Date of Birth (YYYY-MM-DD)
    - Gender
    - Father's Name (format in proper case as per rules above)

    Return JSON only:
    {
      "name_on_card": string or null,
      "pan_number": string or null,
      "date_of_birth": string or null,
      "gender": string or null,
      "father_name": string or null
    }

    Reminder: Unclear = null. Never guess. Faded/washed out PAN number = null.
  `,

  aadhaarFront: `
    You are analyzing the FRONT side of an Indian Aadhaar card.
    Return exactly one valid JSON object and nothing else, with no markdown, no explanation, and no apology; if a value is unclear, set it to null.

    **IMAGE HANDLING RULES**:
    - Handle skew, blur, glare, or faded ink.
    - If any text is not fully clear (uncertain letters/digits) → return null for that field.
    - Never interpret unclear digits or letters.

    **CRITICAL: AADHAAR NUMBER EXTRACTION RULES**:
    - The Aadhaar number MUST be 100% clearly visible with all 12 digits perfectly legible.
    - If the Aadhaar number is faded, washed out, overexposed, or ANY digit is unclear → return null.
    - DO NOT attempt to guess or infer any digits.
    - DO NOT use any other number visible on the card as Aadhaar number.
    - If you cannot read all 12 digits with absolute certainty → return null for aadhaar_number.

    Extract:
    - Full name (split into title, first, middle, last)
    - Aadhaar Number (12 digits, no spaces)
    - Date of Birth (YYYY-MM-DD)
    - Gender
    - State
    - Mobile number (if printed)

    Return JSON only:
    {
      "title": string or null,
      "first_name": string or null,
      "middle_name": string or null,
      "last_name": string or null,
      "aadhaar_number": string or null,
      "date_of_birth": string or null,
      "gender": string or null,
      "state": string or null,
      "mobile_number": string or null
    }

    Reminder: If any portion of a field is unreadable, faded, or washed out → null.
  `,

  aadhaarBack: `
    You are analyzing the BACK side of an Indian Aadhaar card.
    Return exactly one valid JSON object and nothing else, with no markdown, no explanation, and no apology; if a value is unclear, set it to null.

    **IMAGE HANDLING RULES**:
    - If text is obscured by blur, glare, fading, overexposure, or low contrast → return null.
    - Detect presence of QR code and regional text only if clearly visible.

    Extract:
    - Complete address
    - PIN code
    - Has QR code (boolean)
    - Has regional text (boolean)

    Return JSON only:
    {
      "complete_address": string or null,
      "pin_code": string or null,
      "has_qr_code": boolean,
      "has_regional_text": boolean
    }

    Reminder: Unclear, faded, or cropped text → null.
  `,

  passbook: `
    You are analyzing a bank passbook image.
    Return exactly one valid JSON object and nothing else, with no markdown, no explanation, and no apology; if a value is unclear, set it to null.

    **IMAGE HANDLING RULES**:
    - Handle glare, faded ink, overexposure, or tilted images but do not infer missing text.
    - Account number, IFSC, and name must be crystal clear.
    - If uncertain, faded, or washed out → null.

    **CRITICAL: ACCOUNT NUMBER & IFSC EXTRACTION**:
    - Account numbers and IFSC codes MUST be 100% clearly visible.
    - If any digit/character is faded, unclear, or overexposed → return null.
    - DO NOT guess or use similar-looking numbers.

    Extract:
    - Bank Name
    - Account Number
    - IFSC Code
    - Account Holder Name
    - Current Balance
    - Beneficiary Address (full, state, pincode)

    Return JSON only:
    {
      "bank_name": string or null,
      "account_number": string or null,
      "ifsc_code": string or null,
      "account_holder_name": string or null,
      "current_balance": string or null,
      "beneficiary_address": {
        "full_address": string or null,
        "state": string or null,
        "pincode": string or null
      }
    }

    Reminder: Any partial, faded, washed out, or unclear text = null.
  `,

  education: `
  You are analyzing an image of an educational certificate or mark sheet.
  Return exactly one valid JSON object and nothing else, with no markdown, no explanation, and no apology; if a value is unclear, set it to null.

  **STRICT CONFIDENCE RULES**:
  - If any part is faint, faded, overexposed, folded, blurred, or unclear → return null for that specific field.
  - Do NOT guess, infer, or assume any detail (e.g., name, grade, or year) unless it is perfectly readable.

  **Extraction Requirements**:
  - Education: Combine the degree name and specialization in abbreviated form (e.g., "BTech IT", "MBA Finance", "BSc CS", "10th Standard", "12th Standard", "Diploma ME").
  - Year of Passing: Return in YYYY format.
  - Grade/Percentage: 
      • For 10th and 12th, calculate percentage using the highest marks of any 5 subjects (if visible).
      • For all other degrees, take the grade/percentage exactly as mentioned.
  - Mode of Education: Extract mode (e.g., "Regular", "Distance", "Online", etc.), or return null if not clearly mentioned.

  **Output Format**:
  Return ONLY a valid JSON object — no text, markdown, or commentary outside it.

  {
    "education_details": [
      {
        "education": string or null,
        "year_of_passing": string or null,
        "grade": string or null,
        "mode": string or null
      }
    ]
  }
`,

  resume: `
    You are analyzing a resume image.
    Return exactly one valid JSON object and nothing else, with no markdown, no explanation, and no apology; if a value is unclear, set it to null.

    **IMAGE HANDLING RULES**:
    - Handle low-light, tilted, faded, or slightly blurry images.
    - If email, dates, or company names are unclear, faded, or overexposed → return null.

    Extract:
    1. Email (from contact info)
    2. Work Experience (company, location, position, start & end date, CTC)

    Return JSON only:
    {
      "contact_info": {
        "email": string or null
      },
      "work_experience": [
        {
          "company_name": string or null,
          "work_location": string or null,
          "position": string or null,
          "from_date": string or null,
          "to_date": string or null,
          "ctc": string or null
        }
      ]
    }

    Reminder: If any text is cropped, faded, washed out, or unclear → null.
  `,

  currentOffer: `
    You are analyzing a current offer letter for salary extraction.
    date of joining format must be yyyy-mm-dd
    Return exactly one valid JSON object and nothing else, with no markdown, no explanation, and no apology; if a value is unclear, set it to null.

    **IMAGE HANDLING RULES**:
    - Handle low resolution, tilt, faded ink, and overexposure visually, but never infer missing numbers.
    - Salary figures must be fully legible. Blurred, faded, washed out, or incomplete digits = null.

    **CRITICAL: SALARY EXTRACTION**:
    - All salary figures must be 100% clearly visible.
    - If any digit is faded, unclear, or overexposed → return null for that field.
    - DO NOT guess or estimate salary amounts.
    - Extract basic salary, HRA (house rent allowance), special allowance, and extra allowances specifically from the **Amount (P.M)** or **Per Month** column.
    - Extract the annual net CTC (annuallyNetCTC) **only** from the row labeled “CTC (Cost to the Company)” under the **Amount (P.A)**, **Per Annum**, or **Annual** column.
    - Ignore any other totals, gross benefits, or annual sums that are not explicitly labeled as “CTC” or “Cost to the Company”.
    - If both monthly and annual CTC values exist, always take the **annual (P.A)** figure.
    -For Annual ctc take the highest number present in the salary fields

    Extract:
    - All salary components (no currency symbols)
    - Benefits (PF/ESIC/Bonus)
    - Joining Date, Company Name, Location

    Return JSON only:
    {
      "compensation": {
        "basicSalary": number or null,
        "hra": number or null,
        "cca": number or null,
        "specialAllowance": number or null,
        "da": number or null,
        "extraAllowance": number or null,
        "grossSalary": number or null,
        "annuallyNetCTC": number or null
      },
      "benefits": {
        "pfApplicable": boolean,
        "esicApplicable": boolean,
        "bonusApplicable": boolean
      },
      "otherDetails": {
        "joiningDate": string or null,
        "companyName": string or null,
        "workLocation": string or null
      }
    }

    Reminder: If the image is too unclear, faded, washed out, or overexposed to confirm numbers → return null.
  `,
}
