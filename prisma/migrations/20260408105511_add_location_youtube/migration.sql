-- AlterTable
ALTER TABLE "Church" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "mapLat" DOUBLE PRECISION,
ADD COLUMN     "mapLng" DOUBLE PRECISION,
ADD COLUMN     "parking" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Sermon" ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;
