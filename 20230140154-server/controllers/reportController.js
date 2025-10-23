const presensiRecords = require("../data/presensiData");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

exports.getDailyReport = (req, res) => {
  const today = format(new Date(), "yyyy-MM-dd", { timeZone });

  // Filter hanya data hari ini
  const dailyData = presensiRecords.filter(record => {
    const recordDate = format(new Date(record.checkIn), "yyyy-MM-dd", { timeZone });
    return recordDate === today;
  });

  res.json({
    message: `Laporan presensi tanggal ${today}`,
    total: dailyData.length,
    data: dailyData,
  });
};
