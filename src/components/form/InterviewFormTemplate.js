function drawInterviewFormA4(ctx, width, height, data = {}) {
  // A4 canvas view (print-only). Pass values via `data`.
  // Example data:
  // {
  //   name: "Aman Chauhan",
  //   positionAppliedFor: "Data Analyst",
  //   preferredWorkLocation: "Delhi",
  //   maritalStatus: "Single",
  //   presentAddress: "Line 1\nLine 2",
  //   totalIndustryExperienceYrs: "5",
  //   totalExperienceYrs: "4",
  //   noticePeriodDays: "30",
  //   currentCTC: "6 LPA",
  //   expectedCTC: "8 LPA",
  //   q1: "...",
  //   q2: "...",
  //   q3: "...",
  //   strengths: ["...", "..."],
  //   weaknesses: ["...", "..."],
  //   biggestChallenges: ["...", "..."],
  //   references: [
  //     { fullName:"", companyDesignation:"", contactDetails:"", businessOccupation:"" },
  //     { fullName:"", companyDesignation:"", contactDetails:"", businessOccupation:"" },
  //     { fullName:"", companyDesignation:"", contactDetails:"", businessOccupation:"" }
  //   ],
  //   certify: true,
  //   place: "Noida",
  //   date: "2026-02-26",
  //   signature: "Aman"
  // }

  // ---- helpers ----
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  const scale = width / 1240; // base width
  const s = (n) => n * scale;

  const font = (px, bold = false) =>
    `${bold ? 700 : 400} ${Math.round(s(px))}px sans-serif`;

  function text(str, x, y, px = 18, bold = false, align = "left") {
    ctx.save();
    ctx.font = font(px, bold);
    ctx.fillStyle = "#000";
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(str ?? ""), x, y);
    ctx.restore();
  }

  function line(x1, y1, x2, y2, w = 2) {
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = s(w);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function rect(x, y, w, h, lw = 2) {
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = s(lw);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  function drawWrappedText(str, x, y, maxW, lineH, px = 16) {
    const raw = String(str ?? "");
    if (!raw) return y;

    ctx.save();
    ctx.font = font(px, false);
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    // support explicit newlines
    const paragraphs = raw.split("\n");
    let ty = y;

    for (const para of paragraphs) {
      const words = para.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        ty += lineH;
        continue;
      }
      let lineStr = "";
      for (const w of words) {
        const test = lineStr ? lineStr + " " + w : w;
        if (ctx.measureText(test).width > maxW) {
          ctx.fillText(lineStr, x, ty);
          lineStr = w;
          ty += lineH;
        } else {
          lineStr = test;
        }
      }
      if (lineStr) {
        ctx.fillText(lineStr, x, ty);
        ty += lineH;
      }
    }

    ctx.restore();
    return ty;
  }

  function drawValueOnLine(value, x, y, w, px = 16, padding = 4) {
    // draws text slightly above the underline
    const v = String(value ?? "").trim();
    if (!v) return;
    ctx.save();
    ctx.font = font(px, false);
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    // clip to field width
    ctx.beginPath();
    ctx.rect(x, y - s(22), w, s(26));
    ctx.clip();

    // if too long, shrink a bit
    let size = px;
    while (size > 10 && ctx.measureText(v).width > w - s(padding * 2)) {
      size -= 1;
      ctx.font = font(size, false);
    }

    ctx.fillText(v, x + s(padding), y);
    ctx.restore();
  }

  function labelWithLine(label, x, y, w, value, labelPx = 18, gap = 28) {
    text(label, x, y, labelPx, false);
    const yLine = y + s(gap);
    line(x, yLine, x + w, yLine, 2);
    // value sits just above the underline
    drawValueOnLine(value, x, yLine - s(6), w, 16, 6);
    return yLine + s(22);
  }

  function sectionHeader(title, x, y) {
    text(title, x, y, 22, true);
    return y + s(32);
  }

  // ---- layout ----
  const M = s(70);
  const x0 = M;
  const x1 = width - M;

  // Title
  text("Interview Form", width / 2, s(90), 36, true, "center");

  const colGap = s(40);
  const colW = (x1 - x0 - colGap) / 2;

  // Row 1
  let y = s(150);
  const yA = labelWithLine("Name", x0, y, colW, data.name);
  const yB = labelWithLine(
    "Position Applied For",
    x0 + colW + colGap,
    y,
    colW,
    data.positionAppliedFor
  );
  y = Math.max(yA, yB);

  // Row 2
  y = s(260);
  const yC = labelWithLine(
    "Preferred Work Location",
    x0,
    y,
    colW,
    data.preferredWorkLocation
  );
  const yD = labelWithLine(
    "Marital Status",
    x0 + colW + colGap,
    y,
    colW,
    data.maritalStatus
  );
  y = Math.max(yC, yD);

  // Present Address (2 lines) with wrapped text
  y = s(370);
  text("Present Address", x0, y, 18, false);
  const yLine1 = y + s(28);
  const yLine2 = y + s(78);
  line(x0, yLine1, x1, yLine1, 2);
  line(x0, yLine2, x1, yLine2, 2);

  // Put address between label and second line; allow 2 lines
  const addrBoxTop = y + s(10);
  const addrBoxBottom = yLine2 - s(8);
  const maxAddrLines = 2;
  const lineH = s(20);

  // draw wrapped address with clipping to 2 lines area
  if (data.presentAddress) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, addrBoxTop, x1 - x0, addrBoxBottom - addrBoxTop);
    ctx.clip();
    let ty = yLine1 - s(8); // start slightly above line1
    // draw up to 2 lines
    const startY = ty;
    const endY = startY + lineH * maxAddrLines;
    const renderedEnd = drawWrappedText(
      String(data.presentAddress),
      x0 + s(6),
      startY,
      x1 - x0 - s(12),
      lineH,
      16
    );
    // if overflow, ignore due to clipping
    void renderedEnd;
    ctx.restore();
  }

  y = y + s(120);

  // Work Experience
  y += s(10);
  y = sectionHeader("Work Experience", x0, y) + s(18);

  // 3 columns
  const gap3 = s(30);
  const w3 = (x1 - x0 - 2 * gap3) / 3;
  const yRow = y;

  text("Total Industry Experience (in yrs)", x0, yRow, 16, false);
  line(x0, yRow + s(26), x0 + w3, yRow + s(26), 2);
  drawValueOnLine(data.totalIndustryExperienceYrs, x0, yRow + s(20), w3, 16, 6);

  const xMid = x0 + w3 + gap3;
  text("Total Experience (in yrs)", xMid, yRow, 16, false);
  line(xMid, yRow + s(26), xMid + w3, yRow + s(26), 2);
  drawValueOnLine(data.totalExperienceYrs, xMid, yRow + s(20), w3, 16, 6);

  const xRight = x0 + 2 * (w3 + gap3);
  text("Notice Period (in days)", xRight, yRow, 16, false);
  line(xRight, yRow + s(26), xRight + w3, yRow + s(26), 2);
  drawValueOnLine(data.noticePeriodDays, xRight, yRow + s(20), w3, 16, 6);

  y = yRow + s(85);

  // Current/Expected CTC
  y += s(10);
  const yE = labelWithLine("Current CTC", x0, y, colW, data.currentCTC);
  const yF = labelWithLine("Expected CTC", x0 + colW + colGap, y, colW, data.expectedCTC);
  y = Math.max(yE, yF);

  // Q1 - Q3 (wrap text inside a 1-line area by default; you can increase height if needed)
  y += s(20);
  function qBlock(qLabel, value) {
    text(qLabel, x0, y, 16, false);
    const yL = y + s(26);
    line(x0, yL, x1, yL, 2);

    // one-line clipped value (like a blank line on a form)
    if (value) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y - s(2), x1 - x0, s(30));
      ctx.clip();
      drawValueOnLine(value, x0, yL - s(6), x1 - x0, 15, 6);
      ctx.restore();
    }

    y += s(70);
  }
  qBlock("Q.1. Highlights of your department's SOP?", data.q1);
  qBlock("Q.2. Reports prepared in your organization (column headers):", data.q2);
  qBlock("Q.3. Review process in your current organization:", data.q3);

  // Strength And Weaknesses
  y += s(10);
  y = sectionHeader("Strength And Weaknesses", x0, y) + s(10);

  // Table: Strengths / Weaknesses
  const tableX = x0;
  const tableW = x1 - x0;
  const rowH = s(32);
  const c0 = s(60);
  const c1 = (tableW - c0) / 2;

  // header row
  rect(tableX, y, tableW, rowH, 2);
  line(tableX + c0, y, tableX + c0, y + rowH, 2);
  line(tableX + c0 + c1, y, tableX + c0 + c1, y + rowH, 2);
  text("Strengths", tableX + c0 + c1 / 2, y + s(24), 16, true, "center");
  text("Weaknesses", tableX + c0 + c1 + c1 / 2, y + s(24), 16, true, "center");
  y += rowH;

  const strengths = Array.isArray(data.strengths) ? data.strengths : [];
  const weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses : [];

  for (let i = 0; i < 2; i++) {
    rect(tableX, y, tableW, rowH, 2);
    line(tableX + c0, y, tableX + c0, y + rowH, 2);
    line(tableX + c0 + c1, y, tableX + c0 + c1, y + rowH, 2);
    text(`${i + 1}.`, tableX + s(12), y + s(24), 16, false);

    // strength value (clipped)
    ctx.save();
    ctx.beginPath();
    ctx.rect(tableX + c0 + s(6), y + s(6), c1 - s(12), rowH - s(12));
    ctx.clip();
    drawWrappedText(strengths[i] ?? "", tableX + c0 + s(8), y + s(22), c1 - s(16), s(18), 14);
    ctx.restore();

    // weakness value (clipped)
    ctx.save();
    ctx.beginPath();
    ctx.rect(tableX + c0 + c1 + s(6), y + s(6), c1 - s(12), rowH - s(12));
    ctx.clip();
    drawWrappedText(weaknesses[i] ?? "", tableX + c0 + c1 + s(8), y + s(22), c1 - s(16), s(18), 14);
    ctx.restore();

    y += rowH;
  }

  // Biggest challenges header row (colspan)
  rect(tableX, y, tableW, rowH, 2);
  text("Biggest challenges you've managed", tableX + tableW / 2, y + s(24), 16, true, "center");
  y += rowH;

  // two blank rows (colspan) with optional lines of text
  const challenges = Array.isArray(data.biggestChallenges) ? data.biggestChallenges : [];
  for (let i = 0; i < 2; i++) {
    rect(tableX, y, tableW, rowH, 2);
    if (challenges[i]) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(tableX + s(8), y + s(6), tableW - s(16), rowH - s(12));
      ctx.clip();
      drawWrappedText(challenges[i], tableX + s(10), y + s(22), tableW - s(20), s(18), 14);
      ctx.restore();
    }
    y += rowH;
  }

  // References
  y += s(30);
  y = sectionHeader("References (Exclude relatives)", x0, y) + s(10);

  // References table (3 rows as in your updated loop)
  const rRowH = s(30);
  const cols = [
    s(160),
    s(380),
    s(250),
    tableW - (s(160) + s(380) + s(250)),
  ];
  const headers = ["Full Name", "Company & Designation", "Contact Details", "Business or Occupation"];

  rect(tableX, y, tableW, rRowH, 2);
  let cx = tableX;
  for (let i = 0; i < cols.length; i++) {
    text(headers[i], cx + s(8), y + s(22), 14, true);
    cx += cols[i];
    if (i !== cols.length - 1) line(cx, y, cx, y + rRowH, 2);
  }
  y += rRowH;

  const refs = Array.isArray(data.references) ? data.references : [];
  for (let r = 0; r < 3; r++) {
    rect(tableX, y, tableW, rRowH, 2);

    // vertical separators
    cx = tableX;
    for (let i = 0; i < cols.length - 1; i++) {
      cx += cols[i];
      line(cx, y, cx, y + rRowH, 2);
    }

    const ref = refs[r] || {};
    const values = [
      ref.fullName ?? "",
      ref.companyDesignation ?? "",
      ref.contactDetails ?? "",
      ref.businessOccupation ?? "",
    ];

    // draw each cell clipped
    let cellX = tableX;
    for (let i = 0; i < cols.length; i++) {
      const cellW = cols[i];
      ctx.save();
      ctx.beginPath();
      ctx.rect(cellX + s(6), y + s(6), cellW - s(12), rRowH - s(12));
      ctx.clip();
      drawWrappedText(values[i], cellX + s(8), y + s(22), cellW - s(16), s(16), 12);
      ctx.restore();
      cellX += cellW;
    }

    y += rRowH;
  }

  // Checkbox statement
  y += s(30);
  const cb = s(18);
  rect(x0, y + s(4), cb, cb, 2);

  // If certify true, draw a tick
  if (data.certify) {
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = s(2);
    ctx.beginPath();
    ctx.moveTo(x0 + s(4), y + s(14));
    ctx.lineTo(x0 + s(8), y + s(18));
    ctx.lineTo(x0 + s(15), y + s(6));
    ctx.stroke();
    ctx.restore();
  }

  const statement =
    "I certify that the statements made by me are true and correct. I understand that any misrepresentation or " +
    "omission renders me liable to termination by V2 RETAIL LTD.";

  const tx = x0 + cb + s(14);
  const maxW = x1 - tx;
  drawWrappedText(statement, tx, y + s(20), maxW, s(20), 16);

  y += s(70);

  // Place / Date lines
  const yG = labelWithLine("Place", x0, y, colW, data.place);
  const yH = labelWithLine("Date", x0 + colW + colGap, y, colW, data.date);
  y = Math.max(yG, yH);

  // Signature (left column like your HTML)
  y += s(20);
  text("Signature", x0, y, 18, false);
  line(x0, y + s(28), x0 + colW, y + s(28), 2);
  // optional signature text on line
  drawValueOnLine(data.signature, x0, y + s(22), colW, 16, 6);
}

export default drawInterviewFormA4;

export const interviewFormData = {
    name: "Aman Chauhan",
    positionAppliedFor: "Data Analyst",
    preferredWorkLocation: "Delhi",
    maritalStatus: "Single",
    presentAddress: "Line 1\nLine 2",
    totalIndustryExperienceYrs: "5",
    totalExperienceYrs: "4",
    noticePeriodDays: "30",
    currentCTC: "6 LPA",
    expectedCTC: "8 LPA",
    q1: "...",
    q2: "...",
    q3: "...",
    strengths: ["...", "..."],
    weaknesses: ["...", "..."],
    biggestChallenges: ["...", "..."],
    references: [
      { fullName:"", companyDesignation:"", contactDetails:"", businessOccupation:"" },
      { fullName:"", companyDesignation:"", contactDetails:"", businessOccupation:"" },
      { fullName:"", companyDesignation:"", contactDetails:"", businessOccupation:"" }
    ],
    certify: true,
    place: "Noida",
    date: "2026-02-26",
    signature: "Aman"
  }