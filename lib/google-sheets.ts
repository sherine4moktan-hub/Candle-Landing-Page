import "server-only";

import { google, sheets_v4 } from "googleapis";
import type { SavedOrder } from "@/lib/order-schema";
import { PRODUCT, getDeliveryLabel } from "@/lib/product";

const HEADER_ROW = 3;
const DATA_START_ROW = 4;
const COLUMN_COUNT = 19;

const HEADERS = [
  "Order ID",
  "Order Date",
  "Order Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Delivery Area",
  "Product",
  "Quantity",
  "Regular Unit Price (NPR)",
  "Offer Unit Price (NPR)",
  "Product Subtotal (NPR)",
  "Customer Savings (NPR)",
  "Delivery Fee (NPR)",
  "Order Total (NPR)",
  "Payment Method",
  "Order Status",
  "Notes",
];

const ORDER_STATUSES = [
  "New Order",
  "Order Confirmed",
  "Order Ongoing",
  "Delivered",
  "Cancelled",
];

const REQUIRED_GOOGLE_ENV = [
  "GOOGLE_SHEET_ID",
  "GOOGLE_SHEET_TAB_NAME",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
] as const;

const COLORS = {
  espresso: { red: 0.176, green: 0.102, blue: 0.071 },
  amber: { red: 0.737, green: 0.424, blue: 0.176 },
  cream: { red: 1, green: 0.984, blue: 0.957 },
  sand: { red: 0.953, green: 0.89, blue: 0.792 },
  body: { red: 0.212, green: 0.153, blue: 0.122 },
  white: { red: 1, green: 1, blue: 1 },
};

function assertGoogleConfig() {
  const missing = REQUIRED_GOOGLE_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Google Sheets is not configured. Missing: ${missing.join(", ")}`);
  }
}

function getSheetsClient() {
  assertGoogleConfig();
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function escapeSheetName(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function getKathmanduSerial(isoDate: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(isoDate));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  ) / 86_400_000 + 25_569;
}

function columnWidthRequest(
  sheetId: number,
  column: number,
  pixelSize: number,
): sheets_v4.Schema$Request {
  return {
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: column, endIndex: column + 1 },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  };
}

function statusRule(
  sheetId: number,
  text: string,
  backgroundColor: sheets_v4.Schema$Color,
  foregroundColor: sheets_v4.Schema$Color,
): sheets_v4.Schema$Request {
  return {
    addConditionalFormatRule: {
      index: 0,
      rule: {
        ranges: [{
          sheetId,
          startRowIndex: DATA_START_ROW,
          endRowIndex: 1000,
          startColumnIndex: 17,
          endColumnIndex: 18,
        }],
        booleanRule: {
          condition: { type: "TEXT_EQ", values: [{ userEnteredValue: text }] },
          format: {
            backgroundColor,
            textFormat: { foregroundColor, bold: true },
          },
        },
      },
    },
  };
}

async function ensureSheetStructure(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabName: string,
) {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title,gridProperties),merges,basicFilter,bandedRanges,conditionalFormats)",
  });
  let tab = metadata.data.sheets?.find((sheet) => sheet.properties?.title === tabName);

  if (!tab) {
    const created = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: tabName,
              gridProperties: { frozenRowCount: DATA_START_ROW, frozenColumnCount: 0 },
            },
          },
        }],
      },
    });
    tab = created.data.replies?.[0]?.addSheet;
  }

  const sheetId = tab?.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) {
    throw new Error(`Unable to find or create the Google Sheet tab "${tabName}".`);
  }

  const escapedTab = escapeSheetName(tabName);
  const currentHeader = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${escapedTab}!A${HEADER_ROW + 1}:S${HEADER_ROW + 1}`,
  });
  const row = currentHeader.data.values?.[0] ?? [];
  const hasHeaderContent = row.some((entry) => String(entry).trim());
  const headerMatches = HEADERS.every((header, index) => row[index] === header);

  if (hasHeaderContent && !headerMatches) {
    throw new Error(`The header row in "${tabName}" does not match the required A–S order.`);
  }

  if (!headerMatches) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          { range: `${escapedTab}!A1:S1`, values: [["ARINZ CANDLES — ORDER REGISTER"]] },
          { range: `${escapedTab}!A2:S2`, values: [["Cash on Delivery orders across Nepal • Updated automatically from the website"]] },
          { range: `${escapedTab}!A4:S4`, values: [HEADERS] },
        ],
      },
    });
  }

  const requests: sheets_v4.Schema$Request[] = [
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: {
            frozenRowCount: DATA_START_ROW,
            frozenColumnCount: 0,
            hideGridlines: true,
          },
          tabColorStyle: { rgbColor: COLORS.espresso },
        },
        fields: "gridProperties(frozenRowCount,frozenColumnCount,hideGridlines),tabColorStyle",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: COLUMN_COUNT },
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.espresso,
            horizontalAlignment: "LEFT",
            verticalAlignment: "MIDDLE",
            textFormat: { foregroundColor: COLORS.white, bold: true, fontFamily: "Arial", fontSize: 16 },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: COLUMN_COUNT },
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.espresso,
            horizontalAlignment: "LEFT",
            verticalAlignment: "MIDDLE",
            textFormat: { foregroundColor: COLORS.sand, italic: true, fontFamily: "Arial", fontSize: 10 },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: HEADER_ROW, endRowIndex: HEADER_ROW + 1, startColumnIndex: 0, endColumnIndex: COLUMN_COUNT },
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.amber,
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: { foregroundColor: COLORS.white, bold: true, fontFamily: "Arial", fontSize: 10 },
            borders: { bottom: { style: "SOLID_MEDIUM", color: COLORS.espresso } },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: DATA_START_ROW, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: COLUMN_COUNT },
        cell: {
          userEnteredFormat: {
            verticalAlignment: "MIDDLE",
            textFormat: { foregroundColor: COLORS.body, fontFamily: "Arial", fontSize: 10 },
          },
        },
        fields: "userEnteredFormat(verticalAlignment,textFormat)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: DATA_START_ROW, endRowIndex: 1000, startColumnIndex: 1, endColumnIndex: 2 },
        cell: { userEnteredFormat: { numberFormat: { type: "DATE", pattern: "dd mmm yyyy" }, horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: DATA_START_ROW, endRowIndex: 1000, startColumnIndex: 2, endColumnIndex: 3 },
        cell: { userEnteredFormat: { numberFormat: { type: "TIME", pattern: "h:mm am/pm" }, horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: DATA_START_ROW, endRowIndex: 1000, startColumnIndex: 9, endColumnIndex: 16 },
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "#,##0" }, horizontalAlignment: "RIGHT" } },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: DATA_START_ROW, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 9 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP" } },
        fields: "userEnteredFormat.wrapStrategy",
      },
    },
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: DATA_START_ROW, startColumnIndex: 17, endColumnIndex: 18 },
        rule: {
          condition: { type: "ONE_OF_LIST", values: ORDER_STATUSES.map((userEnteredValue) => ({ userEnteredValue })) },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 42 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 28 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: HEADER_ROW, endIndex: HEADER_ROW + 1 },
        properties: { pixelSize: 42 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: DATA_START_ROW, endIndex: 1000 },
        properties: { pixelSize: 34 },
        fields: "pixelSize",
      },
    },
    columnWidthRequest(sheetId, 0, 155),
    columnWidthRequest(sheetId, 1, 112),
    columnWidthRequest(sheetId, 2, 92),
    columnWidthRequest(sheetId, 3, 160),
    columnWidthRequest(sheetId, 4, 128),
    columnWidthRequest(sheetId, 5, 205),
    columnWidthRequest(sheetId, 6, 280),
    columnWidthRequest(sheetId, 7, 190),
    columnWidthRequest(sheetId, 8, 225),
    columnWidthRequest(sheetId, 9, 78),
    ...Array.from({ length: 6 }, (_, index) => columnWidthRequest(sheetId, 10 + index, 132)),
    columnWidthRequest(sheetId, 16, 140),
    columnWidthRequest(sheetId, 17, 150),
    columnWidthRequest(sheetId, 18, 230),
  ];

  const hasMergedTitleRow = (startRowIndex: number) =>
    tab?.merges?.some((range) =>
      range.startRowIndex === startRowIndex &&
      range.endRowIndex === startRowIndex + 1 &&
      range.startColumnIndex === 0 &&
      range.endColumnIndex === COLUMN_COUNT,
    );

  for (const startRowIndex of [0, 1]) {
    if (!hasMergedTitleRow(startRowIndex)) {
      requests.unshift({
        mergeCells: {
          range: { sheetId, startRowIndex, endRowIndex: startRowIndex + 1, startColumnIndex: 0, endColumnIndex: COLUMN_COUNT },
          mergeType: "MERGE_ALL",
        },
      });
    }
  }

  if (!tab?.basicFilter) {
    requests.push({
      setBasicFilter: {
        filter: {
          range: { sheetId, startRowIndex: HEADER_ROW, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: COLUMN_COUNT },
        },
      },
    });
  }

  if (!tab?.bandedRanges?.length) {
    requests.push({
      addBanding: {
        bandedRange: {
          range: { sheetId, startRowIndex: HEADER_ROW, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: COLUMN_COUNT },
          rowProperties: {
            headerColor: COLORS.amber,
            firstBandColor: COLORS.white,
            secondBandColor: COLORS.cream,
          },
        },
      },
    });
  }

  if (!tab?.conditionalFormats?.length) {
    requests.push(
      statusRule(sheetId, "New Order", { red: 1, green: 0.91, blue: 0.75 }, { red: 0.48, green: 0.25, blue: 0.04 }),
      statusRule(sheetId, "Order Confirmed", { red: 0.84, green: 0.91, blue: 1 }, { red: 0.12, green: 0.29, blue: 0.53 }),
      statusRule(sheetId, "Order Ongoing", { red: 0.91, green: 0.86, blue: 0.98 }, { red: 0.35, green: 0.2, blue: 0.52 }),
      statusRule(sheetId, "Delivered", { red: 0.82, green: 0.94, blue: 0.84 }, { red: 0.11, green: 0.38, blue: 0.16 }),
      statusRule(sheetId, "Cancelled", { red: 0.98, green: 0.84, blue: 0.82 }, { red: 0.56, green: 0.12, blue: 0.09 }),
    );
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

export async function initializeOrderSheet() {
  const sheets = getSheetsClient();
  await ensureSheetStructure(
    sheets,
    process.env.GOOGLE_SHEET_ID!,
    process.env.GOOGLE_SHEET_TAB_NAME!,
  );
}

export async function saveOrderToSheet(order: SavedOrder) {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME!;
  const tab = escapeSheetName(tabName);

  await ensureSheetStructure(sheets, spreadsheetId, tabName);

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A${DATA_START_ROW + 1}:A`,
  });
  const alreadySaved = (existing.data.values ?? []).some(([value]) => value === order.orderId);

  if (!alreadySaved) {
    const createdSerial = getKathmanduSerial(order.createdAt);
    const productSubtotal = order.pricePerPiece * order.quantity;
    const savings = (PRODUCT.regularPrice - order.pricePerPiece) * order.quantity;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tab}!A${DATA_START_ROW + 1}:S`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "OVERWRITE",
      requestBody: {
        values: [[
          order.orderId,
          createdSerial,
          createdSerial,
          order.name,
          order.phone,
          order.email,
          order.location,
          getDeliveryLabel(order.deliveryZone),
          order.productName,
          order.quantity,
          PRODUCT.regularPrice,
          order.pricePerPiece,
          productSubtotal,
          savings,
          order.deliveryFee,
          order.totalPrice,
          order.paymentMethod,
          order.orderStatus,
          order.notes,
        ]],
      },
    });
  }
}
