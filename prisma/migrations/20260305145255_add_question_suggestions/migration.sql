-- CreateTable
CREATE TABLE "QuestionSuggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionText" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "approvedBy" TEXT,
    "rejectedBy" TEXT,
    "createdQuestionId" TEXT
);

-- CreateIndex
CREATE INDEX "QuestionSuggestion_status_createdAt_idx" ON "QuestionSuggestion"("status", "createdAt");
