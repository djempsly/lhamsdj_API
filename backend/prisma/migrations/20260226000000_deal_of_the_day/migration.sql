-- CreateTable
CREATE TABLE "deal_of_the_day" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_of_the_day_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deal_of_the_day_productId_key" ON "deal_of_the_day"("productId");

-- CreateIndex
CREATE INDEX "deal_of_the_day_position_idx" ON "deal_of_the_day"("position");

-- AddForeignKey
ALTER TABLE "deal_of_the_day" ADD CONSTRAINT "deal_of_the_day_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
