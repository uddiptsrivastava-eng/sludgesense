export function GET() {
  return Response.json({ app: "SludgeSense", stage: 4, status: "ok", assessmentAvailable: true, screeningProfileVersion: "1.0.0", regulatoryAssessment: false, inputValidationAvailable: true, csvImportAvailable: true, apiKeyRequired: false });
}



