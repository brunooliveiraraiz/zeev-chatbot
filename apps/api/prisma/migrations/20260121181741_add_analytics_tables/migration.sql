-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chatSessionToken" TEXT NOT NULL,
    "userData" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'START',
    "collectedData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationResolution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "category" TEXT,
    "requestId" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConversationRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "helpful" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_chatSessionToken_key" ON "Session"("chatSessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_chatSessionToken_idx" ON "Session"("chatSessionToken");

-- CreateIndex
CREATE INDEX "Message_sessionId_idx" ON "Message"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationResolution_sessionId_key" ON "ConversationResolution"("sessionId");

-- CreateIndex
CREATE INDEX "ConversationResolution_resolved_idx" ON "ConversationResolution"("resolved");

-- CreateIndex
CREATE INDEX "ConversationResolution_resolvedAt_idx" ON "ConversationResolution"("resolvedAt");

-- CreateIndex
CREATE INDEX "ConversationResolution_category_idx" ON "ConversationResolution"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationRating_sessionId_key" ON "ConversationRating"("sessionId");

-- CreateIndex
CREATE INDEX "ConversationRating_rating_idx" ON "ConversationRating"("rating");

-- CreateIndex
CREATE INDEX "ConversationRating_createdAt_idx" ON "ConversationRating"("createdAt");
