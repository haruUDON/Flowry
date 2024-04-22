export const getTimeDifferenceString = (uploadedAt) => {
  const now = new Date();
  const uploadedTime = new Date(uploadedAt);
  const timeDifference = now.getTime() - uploadedTime.getTime();

  const minutes = Math.floor(timeDifference / (1000 * 60));
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const months = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));

  if (years > 0) {
    return `${years}年前`;
  } else if (months > 0) {
    const formattedDate = `${uploadedTime.getMonth() + 1}月${uploadedTime.getDate()}日`;
    return formattedDate;
  } else if (days > 0) {
    return `${days}日前`;
  } else if (hours > 0) {
    return `${hours}時間前`;
  } else if (minutes > 0) {
    return `${minutes}分前`;
  } else {
    return '今';
  }
};